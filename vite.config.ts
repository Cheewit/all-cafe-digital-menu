import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose the Vercel environment variable to the client-side code.
    // The app code uses process.env.API_KEY, but Vite requires the VITE_ prefix
    // for environment variables. This bridge makes it work.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
})
