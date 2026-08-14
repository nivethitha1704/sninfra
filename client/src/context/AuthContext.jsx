import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default auth headers for axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      return { success: true };
    } catch (err) {
      console.error('Login error details:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkUserProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/api/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout(); // Token expired or invalid, clear login state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserProfile();
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    checkUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
