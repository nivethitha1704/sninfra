import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ApiConfigContext = createContext();

export const useApiConfig = () => useContext(ApiConfigContext);

const DEFAULT_CLOUD_URL = 'https://sninfra.onrender.com';
const STORAGE_KEY = 'sninfra_api_url';

export const ApiConfigProvider = ({ children }) => {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CLOUD_URL;
  });
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [lastPing, setLastPing] = useState(null);

  // Apply baseURL to axios
  useEffect(() => {
    const cleanUrl = (apiUrl || DEFAULT_CLOUD_URL).trim().replace(/\/+$/, '');
    axios.defaults.baseURL = cleanUrl;
    localStorage.setItem(STORAGE_KEY, cleanUrl);
    checkHealth(cleanUrl);
  }, [apiUrl]);

  const checkHealth = async (targetUrl = apiUrl) => {
    setServerStatus('checking');
    try {
      const clean = (targetUrl || DEFAULT_CLOUD_URL).trim().replace(/\/+$/, '');
      const response = await axios.get(`${clean}/api/settings`, { timeout: 8000 });
      if (response.status === 200 || response.status === 304) {
        setServerStatus('online');
        setLastPing(Date.now());
        return { ok: true };
      }
      setServerStatus('online');
      return { ok: true };
    } catch (err) {
      console.warn('API Health Check failed:', err?.message || err);
      // Even if /api/settings throws (e.g. 401 or empty), check if server responded
      if (err.response) {
        setServerStatus('online');
        return { ok: true };
      }
      setServerStatus('offline');
      return { ok: false, error: err.message };
    }
  };

  const updateApiUrl = (newUrl) => {
    const clean = (newUrl || DEFAULT_CLOUD_URL).trim().replace(/\/+$/, '');
    setApiUrl(clean);
  };

  const resetToDefault = () => {
    setApiUrl(DEFAULT_CLOUD_URL);
  };

  return (
    <ApiConfigContext.Provider
      value={{
        apiUrl,
        serverStatus,
        lastPing,
        updateApiUrl,
        resetToDefault,
        checkHealth,
        DEFAULT_CLOUD_URL
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};
