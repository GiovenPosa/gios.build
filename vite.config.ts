import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// Hosted on Cloudflare Pages. With no 404.html in the build, Pages treats it
// as a single-page app: any path it has no file for gets index.html with a
// 200, and the router shows the page (or the not-found page).
export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  base: '/',
  build: {
    minify: "esbuild",
    sourcemap: false,
  }
})