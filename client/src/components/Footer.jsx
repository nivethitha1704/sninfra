import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import logoImg from '../logo.png';

const Footer = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e, path) => {
    if (path.includes('#')) {
      const elementId = path.split('#')[1];
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, '', `/#${elementId}`);
      }
    }
  };

  const companyName = settings?.companyName || 'SN Infra';
  const tagline = settings?.tagline || 'Planning • Approval • Vastu • Construction • Interior & Exterior • Renovation • Surveying • Labour Contract • Structural Design';
  const phone = settings?.phone || '+91 84385 68318';
  const email = settings?.email || 'sninfracbe@gmail.com';
  const address = settings?.address || '1, Kamaraj Road, Near Roundana, Mahalingapuram, Tamil Nadu – 642002';
  
  const social = settings?.socialLinks || { facebook: '', instagram: '', youtube: '', linkedin: '' };

  const serviceLinks = [
    { name: 'Planning & Layouts', path: '/services' },
    { name: 'Building Approvals', path: '/services' },
    { name: 'Vastu Consultant', path: '/services' },
    { name: 'Residential Construction', path: '/services' },
    { name: 'Interior & Exterior', path: '/services' },
    { name: 'Structural Design', path: '/services' }
  ];

  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Building & Interiors Gallery', path: '/gallery' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Client Reviews', path: '/#testimonials' }
  ];

  return (
    <footer className="bg-[#1C68F5] text-slate-100 pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* BRAND COLUMN */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-6">
            <img 
              src={settings?.logoUrl || logoImg} 
              alt="Logo" 
              className="h-10 w-auto object-contain" 
            />
            <span className="text-xl font-black tracking-wider text-white uppercase">
              {companyName.split(' ')[0]} <span className="text-[#FFC100]">{companyName.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed mb-6 text-slate-200">
            Professional engineering and custom architectural planning. Delivering dream properties safely, cost-effectively, and matching structural and Vastu alignments.
          </p>
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-[#FFC100] hover:text-[#1C68F5] transition-colors">
                <FaFacebookF size={14} />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-[#FFC100] hover:text-[#1C68F5] transition-colors">
                <FaInstagram size={14} />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-[#FFC100] hover:text-[#1C68F5] transition-colors">
                <FaYoutube size={14} />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center hover:bg-[#FFC100] hover:text-[#1C68F5] transition-colors">
                <FaLinkedinIn size={14} />
              </a>
            )}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6 border-l-2 border-[#FFC100] pl-3">
            Company Info
          </h4>
          <ul className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className="text-xs text-slate-200 hover:text-[#FFC100] hover:translate-x-1 transition-all inline-block"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICES COLUMN */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6 border-l-2 border-[#FFC100] pl-3">
            Core Services
          </h4>
          <ul className="flex flex-col gap-3">
            {serviceLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="text-xs text-slate-200 hover:text-[#FFC100] hover:translate-x-1 transition-all inline-block">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT COLUMN */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6 border-l-2 border-[#FFC100] pl-3">
            Get in Touch
          </h4>
          <ul className="flex flex-col gap-4 text-xs">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt size={16} className="text-[#FFC100] shrink-0 mt-0.5" />
              <div>
                <span className="leading-relaxed text-slate-200 block mb-1">
                  {address}
                </span>
                <a 
                  href="https://maps.app.goo.gl/U7GHGkvcHRGscX7E7?g_st=aw" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#FFC100] hover:text-white font-semibold transition-colors"
                >
                  View on Google Maps ↗
                </a>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt size={14} className="text-[#FFC100] shrink-0" />
              <a href={`tel:${phone}`} className="text-slate-200 hover:text-white">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope size={14} className="text-[#FFC100] shrink-0" />
              <a href={`mailto:${email}`} className="text-slate-200 hover:text-white">
                {email}
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-slate-300 text-center sm:text-left">
          &copy; {currentYear} {companyName}. All Rights Reserved. Designed for premium durability.
        </p>
        <p className="text-[10px] text-slate-300 text-center sm:text-right">
          {tagline.substring(0, 75)}...
        </p>
      </div>
    </footer>
  );
};

export default Footer;
