import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { PAGES, SITE_URL, type PagePath, type PageSeo } from './src/data/seo'
import { pageSchema } from './src/data/schema'
import { workPages, workStills, type WorkTitle } from './src/data/workAbout'

// Hosted on Cloudflare: a Worker serving dist/ (see wrangler.jsonc). A path
// with no file gets index.html with a 200, and the router shows the page (or
// the not-found page).

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** a page's address: the home page with its slash, the rest without */
const pageUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)

/**
 * Finds a source asset's built address: Vite names src/assets/x.webp
 * dist/assets/x-<hash>.webp. Fails the build if it's missing, so the
 * structured data and sitemap never point at a file that isn't there.
 */
const assetFinder = () => {
  const built = readdirSync(resolve(__dirname, 'dist/assets'))
  return (file: string) => {
    const dot = file.lastIndexOf('.')
    const stem = file.slice(0, dot)
    const ext = file.slice(dot)
    const match = built.find((name) => name.startsWith(`${stem}-`) && name.endsWith(ext) && name.length - stem.length - ext.length === 9)
    if (!match) throw new Error(`page-heads: no built file for ${file} (inlined, or renamed?)`)
    return `${SITE_URL}/assets/${match}`
  }
}

/**
 * Gives every page its own HTML file with its own title, description,
 * canonical link, link-preview tags (from src/data/seo.ts) and structured
 * data (src/data/schema.ts) already in it, for crawlers and link previews
 * that don't run the app. /work is served from work.html, and so on; the app
 * itself is the same in every file. Then writes the sitemap, with each
 * page's images, so Google Images can find the work.
 */
const pageHeads = () => ({
  name: 'page-heads',
  closeBundle() {
    const template = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf-8')
    const asset = assetFinder()
    for (const [path, page] of Object.entries(PAGES) as [PagePath, PageSeo][]) {
      const url = pageUrl(path)
      const image = `${SITE_URL}${page.image}`
      const shareTitle = escape(page.shareTitle ?? page.title)
      const shareDescription = escape(page.shareDescription ?? page.description)
      const set = (html: string, pattern: RegExp, value: string) => {
        if (!pattern.test(html)) throw new Error(`page-heads: no match for ${pattern} in index.html`)
        return html.replace(pattern, `$1${value}$2`)
      }
      // written into a <script>, so a "</" in the text can't end it early
      const schema = JSON.stringify(pageSchema(path, asset)).replace(/<\//g, '<\\/')
      let html = template
      html = set(html, /(<title>)[^<]*(<\/title>)/, escape(page.title))
      html = set(html, /(<meta data-rh="true" name="description" content=")[^"]*(")/, escape(page.description))
      html = set(html, /(<meta data-rh="true" property="og:title" content=")[^"]*(")/, shareTitle)
      html = set(html, /(<meta data-rh="true" property="og:description" content=")[^"]*(")/, shareDescription)
      html = set(html, /(<meta data-rh="true" property="og:url" content=")[^"]*(")/, url)
      html = set(html, /(<meta data-rh="true" property="og:image" content=")[^"]*(")/, image)
      html = set(html, /(<meta data-rh="true" property="og:image:alt" content=")[^"]*(")/, escape(page.imageAlt))
      html = set(html, /(<meta data-rh="true" name="twitter:title" content=")[^"]*(")/, shareTitle)
      html = set(html, /(<meta data-rh="true" name="twitter:description" content=")[^"]*(")/, shareDescription)
      html = set(html, /(<meta data-rh="true" name="twitter:image" content=")[^"]*(")/, image)
      html = set(html, /(<meta data-rh="true" name="twitter:image:alt" content=")[^"]*(")/, escape(page.imageAlt))
      if (page.keywords) html = set(html, /(<meta data-rh="true" name="keywords" content=")[^"]*(")/, escape(page.keywords))
      // the app's own canonical (react-helmet-async) takes over once it runs
      html = set(html, /(<!-- page canonical -->)()/, `\n    <link rel="canonical" href="${url}" data-rh="true">`)
      html = set(html, /(<!-- structured data -->)()/, `\n    <script type="application/ld+json">${schema}</script>`)
      // a project's page goes in a folder: /work/kape-coffee is work/kape-coffee.html
      const file = resolve(__dirname, 'dist', path === '/' ? 'index.html' : `${path.slice(1)}.html`)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, html)
    }

    // the pages, each with the images that matter on it. No lastmod: a date
    // that changes with every build, whether the page did or not, teaches
    // Google to ignore it
    const images: Partial<Record<PagePath, string[]>> = {
      '/': [`${SITE_URL}/og/home.png`, asset('gio-portrait.webp'), ...Object.values(workStills).map(asset)],
      '/work': [`${SITE_URL}/og/work.jpg`, ...Object.values(workStills).map(asset)],
      '/packages': [`${SITE_URL}/og/packages.png`],
      '/ui': [`${SITE_URL}/og/ui.png`],
      '/website-audit': [`${SITE_URL}/og/audit.png`],
      '/web-design-bath': [`${SITE_URL}/og/bath.png`],
      '/web-design-bristol': [`${SITE_URL}/og/bristol.png`],
      '/web-design-trowbridge': [`${SITE_URL}/og/trowbridge.png`],
      '/websites-for-fitness-studios': [`${SITE_URL}/og/fitness.jpg`, asset('ossa-1-hero.webp'), asset('ossa-3-new.webp'), asset('ossa-2-seen.webp'), asset('ossa-8-reviews.webp')],
      '/websites-for-local-services': [`${SITE_URL}/og/local-services.jpg`, asset('primestock-1-hero.webp'), asset('primestock-2-always-on.webp'), asset('primestock-5-founding.webp'), asset('primestock-6-quote-form.webp')],
      '/websites-for-cafes': [`${SITE_URL}/og/cafes.jpg`, asset('kape-1-hero.webp'), asset('kape-4-our-menu.webp'), asset('kape-3-new-on-menu.webp'), asset('kape-5-merienda.webp')],
    }
    for (const title of Object.keys(workPages) as WorkTitle[]) {
      images[`/work/${workPages[title].slug}`] = [`${SITE_URL}${workPages[title].image}`, asset(workStills[title])]
    }
    const urls = (Object.keys(PAGES) as PagePath[]).map((path) => {
      const pictures = (images[path] ?? []).map((src) => `\n    <image:image><image:loc>${src}</image:loc></image:image>`).join('')
      return `  <url>\n    <loc>${pageUrl(path)}</loc>${pictures}\n  </url>`
    })
    writeFileSync(
      resolve(__dirname, 'dist/sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`
    )
    console.log(`✓ page heads, structured data and sitemap written for ${Object.keys(PAGES).join(', ')}`)
  },
})

// a made-up report in the real shape (src/data/auditReport.ts), for the
// local stand-in below
const SAMPLE_REPORT = {
  url: 'https://www.example-detailing.co.uk/',
  domain: 'example-detailing.co.uk',
  createdAt: '2026-11-14T10:00:00Z',
  gatheredAt: '2026-11-14T10:01:30Z',
  preview: true,
  screenshot: null,
  gaps: ['There isn’t enough real-visitor data in Google’s Chrome reports for this site, so speed is from a test visit only.'],
  evidence: [
    { key: 'speed.mobile.performance', label: 'Google speed score on a phone, out of 100', value: 51 },
    { key: 'speed.mobile.interactiveSeconds', label: 'Seconds until the page can be used on a phone', value: 21.9 },
    { key: 'site.places.Westbury', label: 'Times "Westbury" is named across the pages read', value: 0 },
    { key: 'page.5.title', label: 'Google title of /service-page/ppf-1', value: 'PPF 1 | Example Detailing' },
    { key: 'profile.nameMatches', label: 'Google profile name matches the site', value: false },
  ],
  report: {
    business: { name: 'Example Detailing', whatTheyDo: 'car detailing and paint protection', where: 'Southwick, near Trowbridge', customers: 'car owners nearby' },
    verdict: 'Great reviews, but a slow site that Google struggles to place.',
    scorecards: [
      { area: 'speed', rating: 'poor', summary: 'Phone speed score 51 out of 100' },
      { area: 'google', rating: 'needs work', summary: 'Service page titles don’t say what or where' },
      { area: 'local', rating: 'needs work', summary: 'Nearby towns aren’t named on the site' },
    ],
    problems: [
      { title: 'Customers give up waiting.', whatItCosts: 'On a phone, the home page takes 21.9 seconds before it can be used. Someone looking for a valet today will go back and pick the next result.', evidence: ['speed.mobile.interactiveSeconds', 'speed.mobile.performance'], fix: 'A lighter, faster site, built for phones first.', severity: 'high' },
      { title: 'Nobody next door finds you.', whatItCosts: 'Westbury isn’t named once across the pages read, so Google has no reason to show the business to people searching there.', evidence: ['site.places.Westbury'], fix: 'Name the towns you serve, with a page for each of the main ones.', severity: 'medium' },
      { title: 'Google can’t tell what you sell.', whatItCosts: 'Service pages have titles like "PPF 1 | Example Detailing", which say neither the service nor the place.', evidence: ['page.5.title'], fix: 'Titles like "Paint protection film in Trowbridge".', severity: 'medium' },
    ],
    observations: [
      'From reading your site, it’s clear you take on everything from valets to paint protection, which is a strong range.',
      'From your home page on a phone, the first screen shows your logo and a photo, but not how to book.',
    ],
    quickWins: [
      { title: 'Match your name everywhere', how: 'Make the business name on your website match your Google profile exactly. It helps Google trust both.' },
      { title: 'Put the town in your title', how: 'Change the home page title to say what you do and where, like "Car detailing in Trowbridge".' },
    ],
    recommendation: { package: 'redesign', why: 'The site exists and has real content, but it’s slow and Google can’t read what or where you sell. A redesign fixes both while keeping the rankings you already have.', includes: ['Faster loading pages', 'Clearer messaging that sells', 'Keep your Google rankings'], alsoConsider: 'Growth adds a page for each town you serve.' },
    closing: 'See what your new homepage could look like, free, before you decide anything.',
  },
}

/**
 * Local stand-in for the enquiry form's endpoint (and the free audit's). On the live site /api/enquiry
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
    const path = req.url?.split('?')[0]
    // an audit report, for checking the report page's design: any id gives
    // the same made-up example (worker/audit.ts serves the real ones)
    if (path?.startsWith('/api/audit/report/')) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(SAMPLE_REPORT))
      return
    }
    // the free audit's form (worker/audit.ts): answers as the Worker would, saves nothing
    if (path === '/api/audit') {
      let raw = ''
      req.on('data', (chunk) => (raw += chunk))
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json')
        let body: Record<string, unknown> = {}
        try {
          body = JSON.parse(raw || '{}')
        } catch {
          // falls through to the checks below
        }
        const fail = (error: string) => {
          res.statusCode = 400
          res.end(JSON.stringify({ error }))
        }
        if (!String(body.website ?? '').includes('.')) return fail('Please enter your website.')
        if (!String(body.email ?? '').includes('@')) return fail('Please enter a valid email.')
        if (String(body.phone ?? '').replace(/\D/g, '').length < 7) return fail('Please enter a phone number.')
        if (body.consent !== true) return fail('Please tick the box so the report can be sent to you.')
        console.log('[local audit] request (not saved):', body.website, body.email)
        res.end(JSON.stringify({ ok: true }))
      })
      return
    }
    const match = path?.match(/^\/api\/enquiry(?:\/([^/]+))?(\/send)?$/)
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