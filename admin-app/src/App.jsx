import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { useAuth } from './context/AuthContext';

// Admin Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GalleryManager from './pages/GalleryManager';
import ServiceManager from './pages/ServiceManager';
import TestimonialManager from './pages/TestimonialManager';
import EnquiryManager from './pages/EnquiryManager';
import SettingsManager from './pages/SettingsManager';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Admin Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Root route resolver
const RootResolver = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Entry Route */}
        <Route path="/" element={<RootResolver />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard & Management Views */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServiceManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/testimonials"
          element={
            <ProtectedRoute>
              <TestimonialManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enquiries"
          element={
            <ProtectedRoute>
              <EnquiryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <SettingsManager />
            </ProtectedRoute>
          }
        />

        {/* Legacy redirect alias if any internal links point to /admin/* */}
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
