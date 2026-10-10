import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch website settings on load
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data);
      applyThemeColors(res.data.themeColors);
    } catch (err) {
      console.error('Failed to fetch settings from server:', err);
      // Create local fallback values if database fails
      const fallbackSettings = {
        companyName: 'SN Infra',
        tagline: 'Planning • Approval • Vastu • Construction • Interior & Exterior • Renovation • Surveying • Labour Contract • Structural Design',
        phone: '+91 84385 68318',
        email: 'sninfracbe@gmail.com',
        address: '1, Kamaraj Road, Near Roundana, Mahalingapuram, Tamil Nadu – 642002',
        mapIframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7953388896212!2d77.009411!3d10.673176799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba839c41ac96adf%3A0x2ab711cb85b35ec0!2sSN%20Infra!5e1!3m2!1sen!2sin!4v1786689408616!5m2!1sen!2sin',
        whatsapp: '+918438568318',
        themeColors: {
          primary: '#ffc100',
          secondary: '#1C68F5',
          accent: '#ffc100'
        },
        socialLinks: {
          facebook: '',
          instagram: '',
          youtube: '',
          linkedin: ''
        }
      };
      setSettings(fallbackSettings);
      applyThemeColors(fallbackSettings.themeColors);
    } finally {
      setLoading(false);
    }
  };

  // Inject primary, secondary and accent colors dynamically
  const applyThemeColors = (colors) => {
    if (!colors) return;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary || '#ffc100');
    root.style.setProperty('--secondary-color', colors.secondary || '#1C68F5');
    root.style.setProperty('--accent-color', colors.accent || '#ffc100');
    
    // Create soft light/dark variants using custom opacity layers or hex translations
    root.style.setProperty('--primary-color-rgb', hexToRgb(colors.primary || '#ffc100'));
    root.style.setProperty('--secondary-color-rgb', hexToRgb(colors.secondary || '#1C68F5'));
    root.style.setProperty('--accent-color-rgb', hexToRgb(colors.accent || '#ffc100'));
  };

  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const cleanHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  // Trigger dark mode styles on document element (Disabled: always light mode for white background)
  const toggleDarkMode = () => {
    setDarkMode(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  };

  useEffect(() => {
    fetchSettings();
    document.documentElement.classList.remove('dark');
  }, []);

  const value = {
    settings,
    darkMode,
    loading,
    toggleDarkMode,
    fetchSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
