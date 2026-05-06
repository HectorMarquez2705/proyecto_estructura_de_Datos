import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':            { target: 'http://localhost:3000', changeOrigin: true },
      '/rutas':           { target: 'http://localhost:3000', changeOrigin: true },
      '/gps':             { target: 'http://localhost:3000', changeOrigin: true },
      '/micros':          { target: 'http://localhost:3000', changeOrigin: true },
      '/notificaciones':  { target: 'http://localhost:3000', changeOrigin: true },
      '/eta':             { target: 'http://localhost:3000', changeOrigin: true },
      '/tarjeta':         { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io':       { target: 'http://localhost:3000', changeOrigin: true, ws: true },
    }
  }
})
