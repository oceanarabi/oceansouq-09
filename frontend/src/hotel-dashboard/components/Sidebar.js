import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHotel } from '../contexts/HotelContext';

const Sidebar = () => {
  const { hotel, logout, sidebarOpen, setSidebarOpen, isAcceptingBookings, toggleBookings } = useHotel();
  const location = useLocation();

  const menuItems = [
    { path: '/hotel', icon: '🏠', label: 'الرئيسية' },
    { path: '/hotel/bookings', icon: '📅', label: 'الحجوزات' },
    { path: '/hotel/rooms', icon: '🛏️', label: 'الغرف' },
    { path: '/hotel/guests', icon: '👥', label: 'النزلاء' },
    { path: '/hotel/analytics', icon: '📊', label: 'التحليلات' },
    { path: '/hotel/reviews', icon: '⭐', label: 'المراجعات' },
    { path: '/hotel/settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  return (
    <aside className={`fixed right-0 top-0 h-full bg-gradient-to-b from-purple-800 to-purple-900 text-white transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      {/* Header */}
      <div className="p-4 border-b border-purple-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏨</span>
              <div>
                <h1 className="font-bold">لوحة الفندق</h1>
                <p className="text-xs text-purple-300">Ocean Hotels</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-purple-700 rounded-lg">
            {sidebarOpen ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Booking Toggle */}
      <div className="p-4 border-b border-purple-700">
        <button
          onClick={toggleBookings}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isAcceptingBookings 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isAcceptingBookings ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
          {sidebarOpen && (isAcceptingBookings ? 'نستقبل الحجوزات' : 'الحجز مغلق')}
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
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:bg-purple-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Hotel Info */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-purple-700">
        {sidebarOpen && hotel && (
          <div className="mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🏨</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{hotel.name || 'الفندق'}</p>
              <p className="text-xs text-purple-300">⭐ {hotel.rating || '4.5'} • {hotel.stars || 5} نجوم</p>
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
