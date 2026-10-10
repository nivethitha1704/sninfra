import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useApiConfig } from '../context/ApiConfigContext';
import logoImg from '../assets/logo.png';
import { 
  FaChartPie, FaImages, FaWrench, 
  FaComments, FaInbox, FaCog, FaSignOutAlt, 
  FaBars, FaTimes, FaWifi, FaExclamationCircle,
  FaRedo
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { apiUrl, serverStatus, checkHealth, updateApiUrl, DEFAULT_CLOUD_URL } = useApiConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isChecking, setIsChecking] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Analytics', path: '/dashboard', icon: <FaChartPie size={16} />, shortName: 'Analytics' },
    { name: 'Gallery & Categories', path: '/gallery', icon: <FaImages size={16} />, shortName: 'Gallery' },
    { name: 'Services Catalog', path: '/services', icon: <FaWrench size={16} />, shortName: 'Services' },
    { name: 'Testimonials', path: '/testimonials', icon: <FaComments size={16} />, shortName: 'Reviews' },
    { name: 'Contact Inbox', path: '/enquiries', icon: <FaInbox size={16} />, shortName: 'Inbox' },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'System Settings', path: '/settings', icon: <FaCog size={16} />, shortName: 'Settings' });
  }

  const handleTestAndSaveServer = async () => {
    setIsChecking(true);
    updateApiUrl(tempUrl);
    await checkHealth(tempUrl);
    setIsChecking(false);
    setShowServerModal(false);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* MOBILE TOP BAR (Visible on mobile/tablet) */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 z-30 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src={logoImg} 
            alt="SN Infra Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" 
          />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              {settings?.companyName || 'SN INFRA'}
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-amber-400 font-semibold block">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Server Connection Badge */}
          <button 
            onClick={() => { setTempUrl(apiUrl); setShowServerModal(true); }}
            title={`Server: ${apiUrl} (${serverStatus})`}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 active:scale-95 transition-transform"
          >
            <span className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
              serverStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-red-500'
            }`} />
            <span className="hidden xs:inline uppercase text-[9px]">{serverStatus}</span>
          </button>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center active:bg-slate-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL (Desktop fixed sidebar + Mobile slide-out drawer) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 bg-slate-900 text-slate-300
        flex flex-col justify-between shrink-0 p-5
        border-r border-slate-800
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top brand header */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src={logoImg} 
                alt="SN Infra" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-md" 
              />
              <div>
                <span className="text-sm font-black text-white tracking-wider block leading-tight">
                  {settings?.companyName || 'SN INFRA'}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold mt-0.5 block">
                  Admin Panel
                </span>
              </div>
            </div>
            {/* Close button inside mobile drawer */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1.5"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all
                  ${isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                  }
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Card & Server Status */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
          
          {/* Server status pill */}
          <button
            onClick={() => { setTempUrl(apiUrl); setShowServerModal(true); }}
            className="flex items-center justify-between px-3 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                serverStatus === 'online' ? 'bg-emerald-500' :
                serverStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
              }`} />
              <div className="truncate">
                <span className="text-[10px] font-bold text-slate-200 block truncate">Backend Server</span>
                <span className="text-[9px] text-slate-400 font-mono block truncate">{apiUrl.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>
            <FaWifi size={11} className="text-slate-400 shrink-0 ml-1" />
          </button>

          {/* User info */}
          <div className="flex items-center justify-between px-1">
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">{user?.name || 'Admin User'}</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 block">{user?.role || 'Admin'}</span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
            >
              <FaSignOutAlt size={13} />
            </button>
          </div>
        </div>

      </aside>

      {/* CENTER WORKPLACE / MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb navigation for Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-2 py-1.5 z-30 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[9px] font-medium transition-all ${
                isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="mb-0.5">{item.icon}</span>
              <span className="truncate">{item.shortName}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* SERVER CONFIGURATION MODAL */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FaWifi className="text-secondary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Backend Server URL</h3>
              </div>
              <button 
                onClick={() => setShowServerModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Configure the API endpoint this Android application connects to:
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Target Backend URL
              </label>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://sninfra.onrender.com"
                className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="mb-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Quick Select Presets
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTempUrl(DEFAULT_CLOUD_URL)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Cloud (Render Backend)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUrl('http://10.0.2.2:5000')}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Android Emulator (10.0.2.2:5000)
                </button>
                <button
                  type="button"
                  onClick={() => setTempUrl('http://localhost:5000')}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Localhost (5000)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isChecking}
                onClick={handleTestAndSaveServer}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {isChecking ? <FaRedo className="animate-spin" size={12} /> : null}
                {isChecking ? 'Connecting...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;
