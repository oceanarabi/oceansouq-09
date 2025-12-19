import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRestaurant } from '../contexts/RestaurantContext';

const Sidebar = () => {
  const { restaurant, logout, sidebarOpen, setSidebarOpen, isOpen, toggleOpen } = useRestaurant();
  const location = useLocation();

  const menuItems = [
    { path: '/restaurant', icon: '🏠', label: 'الرئيسية' },
    { path: '/restaurant/orders', icon: '📦', label: 'الطلبات' },
    { path: '/restaurant/menu', icon: '🍴', label: 'قائمة الطعام' },
    { path: '/restaurant/analytics', icon: '📊', label: 'التحليلات' },
    { path: '/restaurant/reviews', icon: '⭐', label: 'المراجعات' },
    { path: '/restaurant/settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  return (
    <aside className={`fixed right-0 top-0 h-full bg-gradient-to-b from-orange-700 to-red-800 text-white transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      {/* Header */}
      <div className="p-4 border-b border-orange-600">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍔</span>
              <div>
                <h1 className="font-bold">لوحة المطعم</h1>
                <p className="text-xs text-orange-200">Ocean Food</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-orange-600 rounded-lg">
            {sidebarOpen ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Open/Close Toggle */}
      <div className="p-4 border-b border-orange-600">
        <button
          onClick={toggleOpen}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isOpen 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
          {sidebarOpen && (isOpen ? 'مفتوح - نستقبل الطلبات' : 'مغلق')}
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
                ? 'bg-orange-600 text-white'
                : 'text-orange-100 hover:bg-orange-600/50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Restaurant Info */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-orange-600">
        {sidebarOpen && restaurant && (
          <div className="mb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🍔</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{restaurant.name || 'المطعم'}</p>
              <p className="text-xs text-orange-200">⭐ {restaurant.rating || '4.5'}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-200 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
