import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Capacitor needs the built output in /dist
  build: {
    outDir: 'dist',
  },
})
