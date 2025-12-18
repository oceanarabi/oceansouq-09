import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SellerProvider, useSeller } from './contexts/SellerContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import Promotions from './pages/Promotions';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Login from './pages/Login';

const SellerLayout = ({ children }) => {
  const { sidebarOpen, language } = useSeller();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <main className={`transition-all duration-300 ${sidebarOpen ? (language === 'ar' ? 'mr-64' : 'ml-64') : (language === 'ar' ? 'mr-20' : 'ml-20')}`}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { seller, loading } = useSeller();
  if (loading) return <div className="min-h-screen bg-emerald-900 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full"></div></div>;
  if (!seller) return <Navigate to="/seller/login" replace />;
  return <SellerLayout>{children}</SellerLayout>;
};

const SellerRoutes = () => {
  const { seller, loading } = useSeller();
  if (loading) return <div className="min-h-screen bg-emerald-900 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full"></div></div>;

  return (
    <Routes>
      <Route path="login" element={seller ? <Navigate to="/seller" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
      <Route path="inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
      <Route path="reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/seller" replace />} />
    </Routes>
  );
};

const SellerApp = () => {
  return (
    <SellerProvider>
      <SellerRoutes />
    </SellerProvider>
  );
};

export default SellerApp;
