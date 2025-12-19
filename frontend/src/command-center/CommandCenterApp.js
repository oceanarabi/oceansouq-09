import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Pages
import Dashboard from './pages/Dashboard';
import ServicesManager from './pages/ServicesManager';
import ShoppingService from './pages/services/ShoppingService';
import DeliveryService from './pages/services/DeliveryService';
import FoodService from './pages/services/FoodService';
import RidesService from './pages/services/RidesService';
import HotelsService from './pages/services/HotelsService';
import ExperiencesService from './pages/services/ExperiencesService';
import OnDemandService from './pages/services/OnDemandService';
import SubscriptionsService from './pages/services/SubscriptionsService';
import AICenter from './pages/AICenter';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LiveMap from './pages/LiveMap';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Auth Context
const CommandAuthContext = createContext();
export const useCommandAuth = () => useContext(CommandAuthContext);

// Services Context
const ServicesContext = createContext();
export const useServices = () => useContext(ServicesContext);

// Service definitions
const ALL_SERVICES = [
  { id: 'shopping', name: 'التسوق الإلكتروني', nameEn: 'Shopping', icon: '🛒', color: 'ocean', route: '/shopping' },
  { id: 'delivery', name: 'توصيل الطلبات', nameEn: 'Delivery', icon: '🚚', color: 'green', route: '/delivery' },
  { id: 'food', name: 'طلب الطعام', nameEn: 'Food', icon: '🍔', color: 'orange', route: '/food' },
  { id: 'rides', name: 'المشاوير', nameEn: 'Rides', icon: '🚗', color: 'purple', route: '/rides' },
  { id: 'hotels', name: 'الفنادق والإقامات', nameEn: 'Hotels', icon: '🏨', color: 'blue', route: '/hotels' },
  { id: 'experiences', name: 'الأنشطة والتجارب', nameEn: 'Experiences', icon: '🎭', color: 'pink', route: '/experiences' },
  { id: 'ondemand', name: 'خدمات يومية', nameEn: 'On-Demand', icon: '🔧', color: 'yellow', route: '/ondemand' },
  { id: 'subscriptions', name: 'الاشتراكات', nameEn: 'Subscriptions', icon: '⭐', color: 'gold', route: '/subscriptions' }
];

// Sidebar Component
const Sidebar = ({ services, collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeServices = services.filter(s => s.enabled);
  
  const menuItems = [
    { path: '/command', icon: '🏠', label: 'الرئيسية', labelEn: 'Dashboard' },
    { path: '/command/live-map', icon: '🗺️', label: 'الخريطة الحية', labelEn: 'Live Map' },
    { path: '/command/services', icon: '⚙️', label: 'إدارة الخدمات', labelEn: 'Services' },
    { path: '/command/ai', icon: '🤖', label: 'مركز AI', labelEn: 'AI Center' },
    { path: '/command/analytics', icon: '📊', label: 'التحليلات', labelEn: 'Analytics' },
    { path: '/command/users', icon: '👥', label: 'المستخدمين', labelEn: 'Users' },
    { path: '/command/settings', icon: '🔧', label: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <aside className={`fixed right-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌊</span>
            <div>
              <h1 className="text-xl font-bold">Ocean</h1>
              <p className="text-xs text-gray-400">Command Center</p>
            </div>
          </div>
        )}
        {collapsed && <span className="text-3xl mx-auto">🌊</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${location.pathname === item.path ? 'bg-ocean-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Active Services */}
      {!collapsed && activeServices.length > 0 && (
        <div className="px-4 mt-4">
          <p className="text-xs text-gray-500 mb-3 px-2">الخدمات النشطة</p>
          <div className="space-y-1">
            {activeServices.map((service) => {
              const def = ALL_SERVICES.find(s => s.id === service.id);
              return (
                <Link
                  key={service.id}
                  to={`/command${def.route}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white ${location.pathname === `/command${def.route}` ? 'bg-gray-800 text-white' : ''}`}
                >
                  <span>{def.icon}</span>
                  <span className="text-sm">{def.name}</span>
                  <span className="mr-auto w-2 h-2 bg-green-500 rounded-full"></span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Theme Toggle & Logout */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-gray-800 space-y-3">
        {/* Theme Toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!collapsed && <span className="text-sm text-gray-400">الوضع الداكن</span>}
          <button
            onClick={() => {
              const isDark = document.documentElement.classList.contains('dark');
              if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
              } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
              }
            }}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            title="تبديل الوضع"
          >
            <span className="text-lg">🌓</span>
          </button>
        </div>
        
        {/* User Info */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-ocean-600 rounded-full flex items-center justify-center">
            <span>👤</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="font-semibold text-sm">Super Admin</p>
              <p className="text-xs text-gray-400">admin@ocean.com</p>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        {!collapsed && (
          <button
            onClick={() => {
              localStorage.removeItem('commandToken');
              localStorage.removeItem('commandUser');
              navigate('/command/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
          >
            <span>🚪</span>
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        )}
      </div>
    </aside>
  );
};

// Main Layout
const CommandLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [services, setServices] = useState([]);
  const token = localStorage.getItem('commandToken');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/command/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data.services || []);
    } catch (err) {
      // Set defaults
      setServices(ALL_SERVICES.map(s => ({ id: s.id, enabled: s.id === 'shopping' })));
    }
  };

  const toggleService = async (serviceId, enabled) => {
    try {
      await axios.post(`${API_URL}/api/command/services/${serviceId}/toggle`, 
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, enabled } : s));
    } catch (err) {
      console.error('Error toggling service:', err);
    }
  };

  return (
    <ServicesContext.Provider value={{ services, setServices, toggleService, ALL_SERVICES }}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <Sidebar services={services} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`transition-all duration-300 ${collapsed ? 'mr-20' : 'mr-72'}`}>
          {children}
        </main>
      </div>
    </ServicesContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('commandToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/command/login');
    }
  }, [token, navigate]);

  if (!token) return null;

  return <CommandLayout>{children}</CommandLayout>;
};

// Main App
const CommandCenterApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/live-map" element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><ServicesManager /></ProtectedRoute>} />
      <Route path="/shopping/*" element={<ProtectedRoute><ShoppingService /></ProtectedRoute>} />
      <Route path="/delivery/*" element={<ProtectedRoute><DeliveryService /></ProtectedRoute>} />
      <Route path="/food/*" element={<ProtectedRoute><FoodService /></ProtectedRoute>} />
      <Route path="/rides/*" element={<ProtectedRoute><RidesService /></ProtectedRoute>} />
      <Route path="/hotels/*" element={<ProtectedRoute><HotelsService /></ProtectedRoute>} />
      <Route path="/experiences/*" element={<ProtectedRoute><ExperiencesService /></ProtectedRoute>} />
      <Route path="/ondemand/*" element={<ProtectedRoute><OnDemandService /></ProtectedRoute>} />
      <Route path="/subscriptions/*" element={<ProtectedRoute><SubscriptionsService /></ProtectedRoute>} />
      <Route path="/ai/*" element={<ProtectedRoute><AICenter /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
};

export default CommandCenterApp;
export { ALL_SERVICES };
