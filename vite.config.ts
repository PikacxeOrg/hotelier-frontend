import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/identity': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/identity/, '/api'),
      },
      '/api/accommodations': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/accommodations/, '/api/accommodation'),
      },
      '/api/availability': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api/reservations': {
        target: 'http://localhost:5006',
        changeOrigin: true,
      },
      '/api/ratings': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
      '/api/search': {
        target: 'http://localhost:5007',
        changeOrigin: true,
      },
      '/api/cdn': {
        target: 'http://localhost:5008',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/cdn/, '/api/assets'),
      },
    },
  },
})
