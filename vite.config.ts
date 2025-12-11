import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'

// Plugin to copy index.html to 404.html for GitHub Pages SPA support
const copy404Plugin = () => ({
  name: 'copy-404',
  closeBundle() {
    const indexPath = resolve(__dirname, 'dist/index.html')
    const notFoundPath = resolve(__dirname, 'dist/404.html')
    try {
      const indexContent = readFileSync(indexPath, 'utf-8')
      writeFileSync(notFoundPath, indexContent)
      console.log('✓ Copied index.html to 404.html for GitHub Pages')
    } catch (error) {
      console.error('Failed to copy 404.html:', error)
    }
  }
})

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    copy404Plugin()
  ],
  base: '/',
  build: {
    minify: "esbuild",
    sourcemap: false,
  }
})