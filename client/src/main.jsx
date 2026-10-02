import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import axios from 'axios';

// Configure global API baseURL for local testing and multi-host deployment flexibility
const RENDER_BACKEND_URL = 'https://sninfra.onrender.com';
const configuredApiUrl = import.meta.env.VITE_API_URL;

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.local')
);

if (isLocalhost) {
  // On localhost, use relative '' so dev proxy handles /api to local server
  axios.defaults.baseURL = (configuredApiUrl && configuredApiUrl.startsWith('http') && !configuredApiUrl.includes('localhost') && !configuredApiUrl.includes('127.0.0.1'))
    ? configuredApiUrl
    : '';
} else {
  // In production (Vercel, Netlify, custom domains, or Render):
  // If running on Render itself, relative '' routes directly to Express on same domain.
  // If running on Vercel, Netlify, or any other host, route API calls directly to Render backend!
  const isRenderHosted = typeof window !== 'undefined' && window.location.hostname.includes('sninfra.onrender.com');
  
  if (isRenderHosted) {
    axios.defaults.baseURL = '';
  } else {
    axios.defaults.baseURL = (configuredApiUrl && configuredApiUrl.startsWith('http') && !configuredApiUrl.includes('localhost'))
      ? configuredApiUrl
      : RENDER_BACKEND_URL;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);
