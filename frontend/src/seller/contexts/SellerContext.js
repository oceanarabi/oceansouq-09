import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getSellerTranslation } from '../i18n-seller';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SellerContext = createContext();

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) throw new Error('useSeller must be used within SellerProvider');
  return context;
};

export const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('seller_token'));
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('seller_language') || 'ar');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = (key) => getSellerTranslation(language, key);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('seller_language', lang);
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
        if (res.data.role === 'seller' || res.data.role === 'admin' || res.data.role === 'super_admin') {
          setSeller(res.data);
        } else {
          localStorage.removeItem('seller_token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('seller_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setSeller(userData);
    setToken(userToken);
    localStorage.setItem('seller_token', userToken);
  };

  const logout = () => {
    setSeller(null);
    setToken(null);
    localStorage.removeItem('seller_token');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return (
    <SellerContext.Provider value={{
      seller,
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
    </SellerContext.Provider>
  );
};
