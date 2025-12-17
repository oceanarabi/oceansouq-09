import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

const AdminLayout = ({ children }) => {
  const { sidebarOpen, language } = useAdmin();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <main className={`transition-all duration-300 ${
        sidebarOpen 
          ? (language === 'ar' ? 'mr-64' : 'ml-64') 
          : (language === 'ar' ? 'mr-20' : 'ml-20')
      }`}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const AdminRoutes = () => {
  const { admin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={admin ? <Navigate to="/admin" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

const AdminApp = () => {
  return (
    <AdminProvider>
      <AdminRoutes />
    </AdminProvider>
  );
};

export default AdminApp;
