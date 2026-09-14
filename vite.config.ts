import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { projectPages } from './scripts/vite-project-pages.ts'

export default defineConfig({
  build: {
    sourcemap: 'hidden',
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./projects/index.html', import.meta.url)),
      },
    },
  },
  plugins: [
    react(),
    projectPages(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
