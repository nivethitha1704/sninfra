import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://sninfra.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://sninfra.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/photos': {
        target: 'https://sninfra.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
