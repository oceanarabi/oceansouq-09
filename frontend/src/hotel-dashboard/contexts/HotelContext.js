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
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hotelToken');
    const savedHotel = localStorage.getItem('hotelData');
    if (token && savedHotel) {
      const data = JSON.parse(savedHotel);
      setHotel(data);
      setIsAcceptingBookings(data.accepting_bookings !== false);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/hotel-dashboard/auth/login`, { email, password });
      localStorage.setItem('hotelToken', res.data.token);
      localStorage.setItem('hotelData', JSON.stringify(res.data.hotel));
      setHotel(res.data.hotel);
      setIsAcceptingBookings(res.data.hotel.accepting_bookings !== false);
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

  const toggleBookings = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      await axios.post(`${API_URL}/api/hotel-dashboard/status`, 
        { accepting_bookings: !isAcceptingBookings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAcceptingBookings(!isAcceptingBookings);
      setHotel(prev => ({ ...prev, accepting_bookings: !isAcceptingBookings }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const value = {
    hotel,
    loading,
    login,
    logout,
    sidebarOpen,
    setSidebarOpen,
    isAcceptingBookings,
    toggleBookings,
    API_URL
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
};
