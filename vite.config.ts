import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { PAGES, SITE_URL, type PageSeo } from './src/data/seo'

// Hosted on Cloudflare: a Worker serving dist/ (see wrangler.jsonc). A path
// with no file gets index.html with a 200, and the router shows the page (or
// the not-found page).

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Gives every page its own HTML file with its own title, description,
 * canonical link and link-preview tags (from src/data/seo.ts) already in it,
 * for crawlers and link previews that don't run the app. /work is served
 * from work.html, and so on; the app itself is the same in every file.
 */
const pageHeads = () => ({
  name: 'page-heads',
  closeBundle() {
    const template = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf-8')
    for (const [path, page] of Object.entries(PAGES) as [string, PageSeo][]) {
      const url = `${SITE_URL}${path}`
      const shareTitle = escape(page.shareTitle ?? page.title)
      const shareDescription = escape(page.shareDescription ?? page.description)
      const set = (html: string, pattern: RegExp, value: string) => {
        if (!pattern.test(html)) throw new Error(`page-heads: no match for ${pattern} in index.html`)
        return html.replace(pattern, `$1${value}$2`)
      }
      let html = template
      html = set(html, /(<title>)[^<]*(<\/title>)/, escape(page.title))
      html = set(html, /(<meta data-rh="true" name="description" content=")[^"]*(")/, escape(page.description))
      html = set(html, /(<meta data-rh="true" property="og:title" content=")[^"]*(")/, shareTitle)
      html = set(html, /(<meta data-rh="true" property="og:description" content=")[^"]*(")/, shareDescription)
      html = set(html, /(<meta data-rh="true" property="og:url" content=")[^"]*(")/, url)
      html = set(html, /(<meta data-rh="true" name="twitter:title" content=")[^"]*(")/, shareTitle)
      html = set(html, /(<meta data-rh="true" name="twitter:description" content=")[^"]*(")/, shareDescription)
      if (page.keywords) html = set(html, /(<meta data-rh="true" name="keywords" content=")[^"]*(")/, escape(page.keywords))
      // the app's own canonical (react-helmet-async) takes over once it runs
      html = set(html, /(<!-- page canonical -->)()/, `\n    <link rel="canonical" href="${url}" data-rh="true">`)
      const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`
      writeFileSync(resolve(__dirname, 'dist', file), html)
    }
    console.log(`✓ page heads written for ${Object.keys(PAGES).join(', ')}`)
  },
})

/**
 * Local stand-in for the enquiry form's endpoint. On the live site /api/enquiry
 * is the Cloudflare Worker (worker/enquiry.ts), which `vite` and `vite preview`
 * don't run, so locally every step failed with a 404. This answers the same
 * three calls the same way, so the form can be clicked through end to end,
 * but saves nothing: no test enquiries land in Supabase or the lead app. To
 * try the real thing, build and run `npx wrangler dev` (see wrangler.jsonc).
 */
const localEnquiry = () => {
  type Next = () => void
  type Req = import('http').IncomingMessage
  type Res = import('http').ServerResponse
  const handle = (req: Req, res: Res, next: Next) => {
    const match = req.url?.split('?')[0].match(/^\/api\/enquiry(?:\/([^/]+))?(\/send)?$/)
    if (!match) return next()
    const [, id, isSend] = match
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      const reply = (status: number, body: object) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }
      let body: Record<string, unknown> = {}
      try {
        body = JSON.parse(raw || '{}')
      } catch {
        return reply(400, { error: 'Something went wrong sending the form. Please try again.' })
      }
      if (!id && req.method === 'POST') {
        if (!String(body.name ?? '').trim()) return reply(400, { error: 'Please enter your name.' })
        if (!String(body.email ?? '').includes('@')) return reply(400, { error: 'Please enter a valid email.' })
        console.log('[local enquiry] step 1 (not saved):', body.name, body.email)
        return reply(200, { id: crypto.randomUUID() })
      }
      if (id && !isSend && req.method === 'PATCH') {
        console.log('[local enquiry] step update (not saved)')
        return reply(200, { id })
      }
      if (id && isSend && req.method === 'POST') {
        console.log('[local enquiry] sent (not saved)')
        return reply(200, { ok: true })
      }
      reply(405, { error: 'Not allowed.' })
    })
  }
  return {
    name: 'local-enquiry',
    configureServer(server: { middlewares: { use: (fn: typeof handle) => void } }) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof handle) => void } }) {
      server.middlewares.use(handle)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    pageHeads(),
    localEnquiry(),
  ],
  base: '/',
  build: {
    minify: "esbuild",
    sourcemap: false,
  }
})