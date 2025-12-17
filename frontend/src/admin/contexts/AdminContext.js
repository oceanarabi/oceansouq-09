import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getAdminTranslation } from '../i18n-admin';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('admin_language') || 'ar');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = (key) => getAdminTranslation(language, key);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('admin_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.role === 'admin' || res.data.role === 'super_admin') {
          setAdmin(res.data);
        } else {
          localStorage.removeItem('admin_token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setAdmin(userData);
    setToken(userToken);
    localStorage.setItem('admin_token', userToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // API helper with auth
  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return (
    <AdminContext.Provider value={{
      admin,
      token,
      loading,
      language,
      sidebarOpen,
      t,
      switchLanguage,
      login,
      logout,
      toggleSidebar,
      api
    }}>
      {children}
    </AdminContext.Provider>
  );
};
