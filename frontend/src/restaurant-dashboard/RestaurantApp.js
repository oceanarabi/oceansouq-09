import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Analytics from './pages/Analytics';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Login from './pages/Login';

const RestaurantLayout = ({ children }) => {
  const { sidebarOpen } = useRestaurant();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-20'}`}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { restaurant, loading } = useRestaurant();
  if (loading) return (
    <div className="min-h-screen bg-orange-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full"></div>
    </div>
  );
  if (!restaurant) return <Navigate to="/restaurant/login" replace />;
  return <RestaurantLayout>{children}</RestaurantLayout>;
};

const RestaurantRoutes = () => {
  const { restaurant, loading } = useRestaurant();
  if (loading) return (
    <div className="min-h-screen bg-orange-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <Routes>
      <Route path="login" element={restaurant ? <Navigate to="/restaurant" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
      <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/restaurant" replace />} />
    </Routes>
  );
};

const RestaurantApp = () => {
  return (
    <RestaurantProvider>
      <RestaurantRoutes />
    </RestaurantProvider>
  );
};

export default RestaurantApp;
