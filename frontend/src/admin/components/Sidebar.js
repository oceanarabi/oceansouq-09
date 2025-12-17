import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const { t, language, switchLanguage, logout, sidebarOpen, toggleSidebar, admin } = useAdmin();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/admin/products', icon: Package, label: 'products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'orders' },
    { path: '/admin/users', icon: Users, label: 'users' },
    { path: '/admin/analytics', icon: BarChart3, label: 'analytics' },
    { path: '/admin/settings', icon: Settings, label: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full bg-slate-900 text-white transition-all duration-300 z-50 ${
      sidebarOpen ? 'w-64' : 'w-20'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="font-bold text-lg">Ocean Admin</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? 
            (language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />) : 
            (language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)
          }
        </button>
      </div>

      {/* Admin Info */}
      {sidebarOpen && admin && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="font-semibold">{admin.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{admin.name}</p>
              <p className="text-xs text-slate-400 capitalize">{admin.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{t(item.label)}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-slate-700">
        {/* Language Toggle */}
        <button
          onClick={() => switchLanguage(language === 'ar' ? 'en' : 'ar')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
        >
          <Globe size={20} />
          {sidebarOpen && <span>{language === 'ar' ? 'English' : 'عربي'}</span>}
        </button>

        {/* Back to Store */}
        <a
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
        >
          <Store size={20} />
          {sidebarOpen && <span>{t('backToStore')}</span>}
        </a>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
