import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CaptainProvider, useCaptain } from './contexts/CaptainContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Rides from './pages/Rides';
import Earnings from './pages/Earnings';
import History from './pages/History';
import Ratings from './pages/Ratings';
import Settings from './pages/Settings';
import Login from './pages/Login';

const CaptainLayout = ({ children }) => {
  const { sidebarOpen } = useCaptain();
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
  const { captain, loading } = useCaptain();
  if (loading) return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
    </div>
  );
  if (!captain) return <Navigate to="/captain/login" replace />;
  return <CaptainLayout>{children}</CaptainLayout>;
};

const CaptainRoutes = () => {
  const { captain, loading } = useCaptain();
  if (loading) return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <Routes>
      <Route path="login" element={captain ? <Navigate to="/captain" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="rides" element={<ProtectedRoute><Rides /></ProtectedRoute>} />
      <Route path="earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/captain" replace />} />
    </Routes>
  );
};

const CaptainApp = () => {
  return (
    <CaptainProvider>
      <CaptainRoutes />
    </CaptainProvider>
  );
};

export default CaptainApp;
