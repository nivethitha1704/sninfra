import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaUserShield } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../logo.png';

const Navbar = () => {
  const { settings, darkMode, toggleDarkMode } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const percentage = (window.scrollY / totalHeight) * 100;
        setScrollProgress(percentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Testimonials', path: '/#testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      const elementId = path.split('#')[1];
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isActive = (path) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#1C68F5] border-b border-[#1C68F5]/30 shadow-md py-4 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={settings?.logoUrl || logoImg} 
            alt="Logo" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <div>
            <span className="text-xl font-black tracking-wider text-white block leading-none uppercase">
              {settings?.companyName ? (
                <>
                  {settings.companyName.split(' ')[0]} <span className="text-[#FFC100]">{settings.companyName.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>
                  SN <span className="text-[#FFC100]">INFRA</span>
                </>
              )}
            </span>
            <span className="text-[9px] tracking-widest text-[#FFC100] uppercase font-bold block mt-1">
              Engineering Excellence
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.path.startsWith('/#') ? (
                  <Link
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="text-xs uppercase tracking-wider font-bold text-white hover:text-[#FFC100] transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <Link
                    to={link.path}
                    className={`text-xs uppercase tracking-wider font-bold transition-colors relative py-1 ${
                      isActive(link.path)
                        ? 'text-[#FFC100]'
                        : 'text-white hover:text-[#FFC100]'
                    }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC100] rounded-full" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {/* UTILITIES & CALL-TO-ACTIONS */}
          <div className="flex items-center gap-4">
            

            {/* Dashboard redirect if logged in */}
            {user && (
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-xl bg-[#FFC100] text-[#1C68F5] hover:bg-[#ffca28] transition-colors shadow-md relative group font-bold"
                title="Go to CMS Dashboard"
              >
                <FaUserShield size={16} />
                <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Admin Panel
                </span>
              </Link>
            )}

            {/* Quote CTA Button */}
            <Link
              to="/contact"
              className="bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-black uppercase tracking-wider text-[11px] px-5 py-3 rounded transition-all shadow-md shadow-[#FFC100]/10 hover:shadow-[#FFC100]/25"
            >
              GET A QUOTE
            </Link>
          </div>
        </div>

        {/* MOBILE MENU TOGGLER */}
        <div className="flex items-center gap-3 lg:hidden">
          

          {user && (
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-[#FFC100] text-[#1C68F5]"
            >
              <FaUserShield size={15} />
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-white bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#1C68F5] shadow-xl border-t border-blue-800/40 py-6 px-6 animate-fade-in">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.path.startsWith('/#') ? (
                  <Link
                    to={link.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setTimeout(() => handleNavClick(link.path), 100);
                    }}
                    className="block text-base font-bold uppercase tracking-wider py-1.5 text-white hover:text-[#FFC100]"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <Link
                    to={link.path}
                    className={`block text-base font-bold uppercase tracking-wider py-1.5 ${
                      isActive(link.path)
                        ? 'text-[#FFC100]'
                        : 'text-white hover:text-[#FFC100]'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-4 border-t border-blue-800/40">
              <Link
                to="/contact"
                className="w-full block text-center bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-bold uppercase tracking-wider py-3 rounded shadow"
              >
                GET A QUOTE
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* SCROLL PROGRESS INDICATOR */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-[#FFC100] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />
    </nav>
  );
};

export default Navbar;
