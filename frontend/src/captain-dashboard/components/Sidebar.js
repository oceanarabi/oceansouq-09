import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCaptain } from '../contexts/CaptainContext';

const Sidebar = () => {
  const { captain, logout, sidebarOpen, setSidebarOpen, isOnline, toggleOnline } = useCaptain();
  const location = useLocation();

  const menuItems = [
    { path: '/captain', icon: '🏠', label: 'الرئيسية' },
    { path: '/captain/rides', icon: '🚗', label: 'الرحلات' },
    { path: '/captain/earnings', icon: '💰', label: 'الأرباح' },
    { path: '/captain/history', icon: '📋', label: 'السجل' },
    { path: '/captain/ratings', icon: '⭐', label: 'التقييمات' },
    { path: '/captain/settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  return (
    <aside className={`fixed right-0 top-0 h-full bg-gradient-to-b from-blue-800 to-indigo-900 text-white transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      {/* Header */}
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚗</span>
              <div>
                <h1 className="font-bold">لوحة الكابتن</h1>
                <p className="text-xs text-blue-300">Ocean Rides</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-700 rounded-lg">
            {sidebarOpen ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Online Toggle */}
      <div className="p-4 border-b border-blue-700">
        <button
          onClick={toggleOnline}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isOnline 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
          {sidebarOpen && (isOnline ? 'متصل - استقبال الرحلات' : 'غير متصل')}
        </button>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Captain Info */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-blue-700">
        {sidebarOpen && captain && (
          <div className="mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {captain.name?.charAt(0) || '👤'}
            </div>
            <div>
              <p className="font-semibold text-sm">{captain.name}</p>
              <p className="text-xs text-blue-300">⭐ {captain.rating || '4.8'} • {captain.vehicle}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
