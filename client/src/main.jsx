import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import axios from 'axios';

// Configure global API baseURL for production deployment flexibility
axios.defaults.baseURL = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || 'https://sninfra.onrender.com') : '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);
