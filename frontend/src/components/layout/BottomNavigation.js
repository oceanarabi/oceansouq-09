import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, useAuth, useCart, useWishlist } from '../../contexts';

const BottomNavigation = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { path: '/products', icon: '🔍', label: language === 'ar' ? 'بحث' : 'Search' },
    { path: '/wishlist', icon: '❤️', label: language === 'ar' ? 'المفضلة' : 'Wishlist', badge: wishlist.items.length },
    { path: '/cart', icon: '🛒', label: language === 'ar' ? 'السلة' : 'Cart', badge: cart.items.length },
    { path: user ? '/account' : '/login', icon: '👤', label: user ? (language === 'ar' ? 'حسابي' : 'Account') : (language === 'ar' ? 'دخول' : 'Login') },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 bottom-nav-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`mobile-nav-item relative ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            {item.badge > 0 && (
              <span className="badge-mobile bg-red-500 text-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
            <span className={`mobile-nav-label ${isActive(item.path) ? 'text-ocean-600 dark:text-ocean-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
