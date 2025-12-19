import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const HotelContext = createContext();

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within HotelProvider');
  return context;
};

export const HotelProvider = ({ children }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hotelToken');
    const savedHotel = localStorage.getItem('hotelData');
    if (token && savedHotel) {
      const data = JSON.parse(savedHotel);
      setHotel(data);
      setIsAvailable(data.is_available !== false);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/hotel/auth/login`, { email, password });
      localStorage.setItem('hotelToken', res.data.token);
      localStorage.setItem('hotelData', JSON.stringify(res.data.hotel));
      setHotel(res.data.hotel);
      setIsAvailable(res.data.hotel.is_available !== false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'خطأ في تسجيل الدخول' };
    }
  };

  const logout = () => {
    localStorage.removeItem('hotelToken');
    localStorage.removeItem('hotelData');
    setHotel(null);
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const newStatus = !isAvailable;
      await axios.post(`${API_URL}/api/hotel/status`, 
        { is_available: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAvailable(newStatus);
      setHotel(prev => ({ ...prev, is_available: newStatus }));
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const value = {
    hotel,
    loading,
    login,
    logout,
    sidebarOpen,
    setSidebarOpen,
    isAvailable,
    toggleAvailability,
    API_URL
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};
