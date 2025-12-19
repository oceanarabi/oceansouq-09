import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider, useHotel } from './contexts/HotelContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Rooms from './pages/Rooms';
import Analytics from './pages/Analytics';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Login from './pages/Login';

const HotelLayout = ({ children }) => {
  const { sidebarOpen } = useHotel();
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
  const { hotel, loading } = useHotel();
  if (loading) return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"></div>
    </div>
  );
  if (!hotel) return <Navigate to="/hotel/login" replace />;
  return <HotelLayout>{children}</HotelLayout>;
};

const HotelRoutes = () => {
  const { hotel, loading } = useHotel();
  if (loading) return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <Routes>
      <Route path="login" element={hotel ? <Navigate to="/hotel" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/hotel" replace />} />
    </Routes>
  );
};

const HotelApp = () => {
  return (
    <HotelProvider>
      <HotelRoutes />
    </HotelProvider>
  );
};

export default HotelApp;
