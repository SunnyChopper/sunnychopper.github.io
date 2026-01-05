import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Copy CNAME file to dist after build
    {
      name: 'copy-cname',
      closeBundle() {
        try {
          copyFileSync(
            join(process.cwd(), 'public', 'CNAME'),
            join(process.cwd(), 'dist', 'CNAME')
          )
        } catch (error) {
          console.warn('CNAME file not found or already exists')
        }
      },
    },
  ],
  base: '/', // Use root path for custom domain
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
