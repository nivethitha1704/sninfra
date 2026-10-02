import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import axios from 'axios';

// Configure global API baseURL for local testing and multi-host deployment flexibility
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const configuredApiUrl = import.meta.env.VITE_API_URL;

if (isLocalhost) {
  // On localhost, use relative '' so dev proxy or local fullstack server handles /api
  axios.defaults.baseURL = '';
} else if (configuredApiUrl && configuredApiUrl.startsWith('http') && !configuredApiUrl.includes('localhost')) {
  axios.defaults.baseURL = configuredApiUrl;
} else {
  // Relative path works automatically for same-domain deployments (Render, Docker, VPS)
  axios.defaults.baseURL = '';
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
