import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import steamVerifyPlugin from './server/steam-verify-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), steamVerifyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
