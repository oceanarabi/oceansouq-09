import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CaptainContext = createContext();

export const useCaptain = () => {
  const context = useContext(CaptainContext);
  if (!context) throw new Error('useCaptain must be used within CaptainProvider');
  return context;
};

export const CaptainProvider = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('captainToken');
    const savedCaptain = localStorage.getItem('captainData');
    if (token && savedCaptain) {
      const data = JSON.parse(savedCaptain);
      setCaptain(data);
      setIsOnline(data.status === 'online');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/captain/auth/login`, { email, password });
      localStorage.setItem('captainToken', res.data.token);
      localStorage.setItem('captainData', JSON.stringify(res.data.captain));
      setCaptain(res.data.captain);
      setIsOnline(res.data.captain.status === 'online');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'خطأ في تسجيل الدخول' };
    }
  };

  const logout = () => {
    localStorage.removeItem('captainToken');
    localStorage.removeItem('captainData');
    setCaptain(null);
    setIsOnline(false);
  };

  const toggleOnline = async () => {
    try {
      const token = localStorage.getItem('captainToken');
      const newStatus = isOnline ? 'offline' : 'online';
      await axios.post(`${API_URL}/api/captain/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline(!isOnline);
      setCaptain(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const value = {
    captain,
    loading,
    login,
    logout,
    sidebarOpen,
    setSidebarOpen,
    isOnline,
    toggleOnline,
    currentRide,
    setCurrentRide,
    API_URL
  };

  return <CaptainContext.Provider value={value}>{children}</CaptainContext.Provider>;
};
