import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DriverContext = createContext();

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used within DriverProvider');
  return context;
};

export const DriverProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('driverToken');
    const savedDriver = localStorage.getItem('driverData');
    if (token && savedDriver) {
      setDriver(JSON.parse(savedDriver));
      setIsOnline(JSON.parse(savedDriver).status === 'online');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/driver/auth/login`, { email, password });
      localStorage.setItem('driverToken', res.data.token);
      localStorage.setItem('driverData', JSON.stringify(res.data.driver));
      setDriver(res.data.driver);
      setIsOnline(res.data.driver.status === 'online');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'خطأ في تسجيل الدخول' };
    }
  };

  const logout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverData');
    setDriver(null);
    setIsOnline(false);
  };

  const toggleOnline = async () => {
    try {
      const token = localStorage.getItem('driverToken');
      const newStatus = isOnline ? 'offline' : 'online';
      await axios.post(`${API_URL}/api/driver/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline(!isOnline);
      setDriver(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const value = {
    driver,
    loading,
    login,
    logout,
    sidebarOpen,
    setSidebarOpen,
    language,
    setLanguage,
    isOnline,
    toggleOnline,
    API_URL
  };

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
};
