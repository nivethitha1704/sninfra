import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context utilities
import { useAuth } from './context/AuthContext';

// Layout / Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import FloatingWidgets from './components/FloatingWidgets';
import ScrollProgress from './components/ScrollProgress';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProjectManager from './pages/admin/ProjectManager';
import GalleryManager from './pages/admin/GalleryManager';
import ServiceManager from './pages/admin/ServiceManager';
import TestimonialManager from './pages/admin/TestimonialManager';
import EnquiryManager from './pages/admin/EnquiryManager';
import SettingsManager from './pages/admin/SettingsManager';

// Router Scroll restoration (resets scroll to top on navigation, unless navigating to an anchor)
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      const scrollToHashElement = () => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      // Attempt immediately
      if (!scrollToHashElement()) {
        const timer1 = setTimeout(scrollToHashElement, 80);
        const timer2 = setTimeout(scrollToHashElement, 250);
        const timer3 = setTimeout(scrollToHashElement, 600);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};

// Route wrapper enforcing login
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-secondary rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading secure connection...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Main Routing Shell Layout selector
const LayoutWrapper = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  React.useEffect(() => {
    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: false,
      offset: 70,
    });
  }, []);

  React.useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-slate-100 transition-colors">
      <CustomCursor />
      {!isAdminRoute && <ScrollProgress />}
      
      {/* Conditionally hide public header/footer on active Admin Dashboard screens */}
      {!isAdminRoute && <Navbar />}
      
      <main className={`flex-grow ${isAdminRoute ? 'pt-0 h-screen overflow-hidden' : 'pt-20 pb-0'}`}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          {/* Projects routes redirected to Gallery */}
          <Route path="/projects" element={<Navigate to="/gallery" replace />} />
          <Route path="/projects/:id" element={<Navigate to="/gallery" replace />} />

          {/* Admin Authentication & Entry */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/projects" element={<Navigate to="/admin/gallery" replace />} />

          {/* Admin Dashboard CMS Portal (Protected) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute>
              <GalleryManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute>
              <ServiceManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/testimonials" element={
            <ProtectedRoute>
              <TestimonialManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/enquiries" element={
            <ProtectedRoute>
              <EnquiryManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <SettingsManager />
            </ProtectedRoute>
          } />

          {/* Catch All Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWidgets />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper />
    </Router>
  );
};

export default App;
