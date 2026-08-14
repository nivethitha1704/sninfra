import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import logoImg from '../logo.png';
import { 
  FaChartPie, FaTasks, FaImages, FaWrench, 
  FaComments, FaInbox, FaCog, FaSignOutAlt, 
  FaChevronRight, FaUserShield, FaGlobe 
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { name: 'Analytics Dashboard', path: '/admin/dashboard', icon: <FaChartPie size={14} /> },
    { name: 'Projects Manager', path: '/admin/projects', icon: <FaTasks size={14} /> },
    { name: 'Gallery Portfolio', path: '/admin/gallery', icon: <FaImages size={14} /> },
    { name: 'Services Catalog', path: '/admin/services', icon: <FaWrench size={14} /> },
    { name: 'Client Testimonials', path: '/admin/testimonials', icon: <FaComments size={14} /> },
    { name: 'Contact Inbox', path: '/admin/enquiries', icon: <FaInbox size={14} /> },
  ];

  // Admin-only routing items
  if (user?.role === 'Admin') {
    navItems.push({ name: 'System Settings', path: '/admin/settings', icon: <FaCog size={14} /> });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row relative">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-400 flex flex-col justify-between shrink-0 p-6 border-r border-slate-950">
        
        <div>
          {/* Logo Heading */}
          <Link to="/" className="flex items-center gap-2 mb-10 pb-6 border-b border-slate-800">
            <img 
              src={settings?.logoUrl || logoImg} 
              alt="Logo" 
              className="w-8 h-8 object-contain" 
            />
            <div>
              <span className="text-sm font-bold text-white tracking-wider block leading-none">
                {settings?.companyName || 'SN INFRA'}
              </span>
              <span className="text-[8px] uppercase tracking-widest block text-slate-500 font-semibold mt-1">CMS Control</span>
            </div>
          </Link>

          {/* Navigation link stacks */}
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-secondary text-white shadow-md shadow-orange-500/15'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <FaChevronRight size={8} className={`transition-opacity ${isActive(item.path) ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Card & Log out */}
        <div className="pt-6 border-t border-slate-800 mt-10">
          <div className="flex items-center gap-3 mb-4 text-left">
            <div className="w-10 h-10 bg-primary/20 text-primary-light rounded-xl flex items-center justify-center shrink-0">
              <FaUserShield size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-none mb-1">{user?.name}</h4>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{user?.role}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="w-full bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-bold text-[10px] py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <FaGlobe size={11} />
              Visit Website
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 font-bold text-[10px] py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <FaSignOutAlt size={11} />
              Sign Out
            </button>
          </div>
        </div>

      </aside>

      {/* CENTER WORKPLACE WINDOW */}
      <main className="flex-grow p-6 sm:p-8 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
