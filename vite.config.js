import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep generated files readable for learning and review.
    minify: false,
    cssMinify: false,
  },
})
