import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('restaurantToken');
    const savedRestaurant = localStorage.getItem('restaurantData');
    if (token && savedRestaurant) {
      const data = JSON.parse(savedRestaurant);
      setRestaurant(data);
      setIsOpen(data.is_open !== false);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/restaurant/auth/login`, { email, password });
      localStorage.setItem('restaurantToken', res.data.token);
      localStorage.setItem('restaurantData', JSON.stringify(res.data.restaurant));
      setRestaurant(res.data.restaurant);
      setIsOpen(res.data.restaurant.is_open !== false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'خطأ في تسجيل الدخول' };
    }
  };

  const logout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurantData');
    setRestaurant(null);
  };

  const toggleOpen = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      await axios.post(`${API_URL}/api/restaurant/status`, 
        { is_open: !isOpen },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOpen(!isOpen);
      setRestaurant(prev => ({ ...prev, is_open: !isOpen }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const value = {
    restaurant,
    loading,
    login,
    logout,
    sidebarOpen,
    setSidebarOpen,
    language,
    setLanguage,
    isOpen,
    toggleOpen,
    API_URL
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};
