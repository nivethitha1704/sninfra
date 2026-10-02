import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { indexAllPages } from './scripts/index-pages.js';

// Custom plugin to automatically index all static pages on build completion
function autoIndexPagesPlugin() {
  return {
    name: 'auto-index-pages-plugin',
    closeBundle() {
      try {
        indexAllPages();
      } catch (err) {
        console.error('Failed to auto-index pages:', err);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from client directory
  const env = loadEnv(mode, process.cwd(), '');
  // Default to local backend (port 5000) for local development unless explicitly set otherwise
  const backendTarget = process.env.BACKEND_URL || 
    (env.VITE_API_URL && !env.VITE_API_URL.includes('onrender.com') ? env.VITE_API_URL : 'http://localhost:5000');

  return {
    base: '/',
    plugins: [
      react(),
      autoIndexPagesPlugin()
    ],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/photos': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});

