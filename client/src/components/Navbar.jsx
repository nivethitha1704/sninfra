import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaBuilding, FaUserShield } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../logo.png';

const Navbar = () => {
  const { settings, darkMode, toggleDarkMode } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll for solid background transition & progress bar
  useEffect(() => {
    const handleScroll = () => {
      // Solid transition trigger
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Calculate scroll progress percentage
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-navbar shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
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
            <span className="text-xl font-bold tracking-wider text-primary dark:text-white block leading-none">
              {settings?.companyName || 'SN INFRA'}
            </span>
            <span className="text-[9px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-semibold block mt-1">
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
                    className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-secondary dark:hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors relative py-1 ${
                      isActive(link.path)
                        ? 'text-secondary font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:text-secondary dark:hover:text-secondary'
                    }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* UTILITIES & CALL-TO-ACTIONS */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              aria-label="Toggle theme mode"
            >
              {darkMode ? <FaSun size={15} className="text-amber-400" /> : <FaMoon size={15} />}
            </button>

            {/* Dashboard redirect if logged in */}
            {user && (
              <Link
                to="/admin/dashboard"
                className="p-2 rounded-xl bg-primary text-white hover:bg-primary-light transition-colors shadow-md relative group"
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
              className="bg-secondary hover:bg-secondary-light text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all"
            >
              Get Quote
            </Link>
          </div>
        </div>

        {/* MOBILE MENU TOGGLER */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {darkMode ? <FaSun size={15} className="text-amber-400" /> : <FaMoon size={15} />}
          </button>

          {user && (
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-xl bg-primary text-white"
            >
              <FaUserShield size={15} />
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass shadow-xl border-t border-slate-200/50 dark:border-slate-800/50 py-6 px-6 animate-fade-in">
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
                    className="block text-base font-medium py-1.5 text-slate-800 dark:text-slate-100 hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <Link
                    to={link.path}
                    className={`block text-base font-medium py-1.5 ${
                      isActive(link.path)
                        ? 'text-secondary font-bold'
                        : 'text-slate-800 dark:text-slate-100 hover:text-secondary'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/contact"
                className="w-full block text-center bg-secondary hover:bg-secondary-light text-white font-medium py-3 rounded-xl shadow-md"
              >
                Get Free Quote
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* SCROLL PROGRESS INDICATOR */}
      <div 
        className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />
    </nav>
  );
};

export default Navbar;
