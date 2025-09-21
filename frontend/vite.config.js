import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server:{
    headers:{
      "Cross-origin-embedder-policy": 'require-corp',
      "Cross-origin-opener-policy": 'same-origin'
    },

   
  }
})
