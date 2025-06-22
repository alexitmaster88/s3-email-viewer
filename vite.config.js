import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/s3-email-viewer/',  // Change this to your repo name
  plugins: [react()]
})