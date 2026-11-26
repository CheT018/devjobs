import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Las peticiones a /api se redirigen a la API local, tanto en desarrollo
// como al previsualizar el build.
const proxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
