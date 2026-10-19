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

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    pageHeads(),
  ],
  base: '/',
  build: {
    minify: "esbuild",
    sourcemap: false,
  }
})