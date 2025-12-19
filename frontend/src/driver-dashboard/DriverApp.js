import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DriverProvider, useDriver } from './contexts/DriverContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Earnings from './pages/Earnings';
import History from './pages/History';
import Ratings from './pages/Ratings';
import Settings from './pages/Settings';
import Login from './pages/Login';

const DriverLayout = ({ children }) => {
  const { sidebarOpen } = useDriver();
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
  const { driver, loading } = useDriver();
  if (loading) return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full"></div>
    </div>
  );
  if (!driver) return <Navigate to="/driver/login" replace />;
  return <DriverLayout>{children}</DriverLayout>;
};

const DriverRoutes = () => {
  const { driver, loading } = useDriver();
  if (loading) return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <Routes>
      <Route path="login" element={driver ? <Navigate to="/driver" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
      <Route path="earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/driver" replace />} />
    </Routes>
  );
};

const DriverApp = () => {
  return (
    <DriverProvider>
      <DriverRoutes />
    </DriverProvider>
  );
};

export default DriverApp;
