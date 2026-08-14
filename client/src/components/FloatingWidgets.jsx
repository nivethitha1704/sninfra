import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaPhoneAlt, FaChevronUp } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

const FloatingWidgets = () => {
  const { settings } = useSettings();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const phone = settings?.phone || '+91 84385 68318';
  const rawPhone = phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawPhone || '918438568318'}`;
  const callUrl = `tel:${phone}`;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-[40]">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group relative"
        title="WhatsApp Consultation"
      >
        <FaWhatsapp size={26} className="animate-pulse" />
        <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
          Chat on WhatsApp
        </span>
      </a>

      {/* Direct Call Button */}
      <a
        href={callUrl}
        className="w-14 h-14 bg-[#FFC100] text-[#1C68F5] hover:bg-[#ffca28] rounded-full flex items-center justify-center shadow-lg hover:shadow-[#FFC100]/30 hover:-translate-y-1 transition-all duration-300 group relative font-bold"
        title="Call SN Infra"
      >
        <FaPhoneAlt size={20} />
        <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
          Call Now
        </span>
      </a>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-14 h-14 bg-[#1C68F5] hover:bg-[#091aa1] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[#1C68F5]/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in group relative"
          title="Scroll to Top"
        >
          <FaChevronUp size={18} />
          <span className="absolute right-16 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            Back to Top
          </span>
        </button>
      )}
    </div>
  );
};

export default FloatingWidgets;
