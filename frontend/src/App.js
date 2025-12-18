import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';
import { getTranslation } from './i18n';
import AdminApp from './admin/AdminApp';
import SellerApp from './seller/SellerApp';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Language Context
const LanguageContext = createContext();

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const t = (key) => getTranslation(language, key);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Dark Mode Context
const DarkModeContext = createContext();

const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error('useDarkMode must be used within DarkModeProvider');
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cart Context
const CartContext = createContext();

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const { token } = useAuth();

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      alert('Please login to add items to cart');
      return false;
    }
    try {
      await axios.post(`${API_URL}/api/cart`, 
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      return true;
    } catch (error) {
      alert(error.response?.data?.detail || 'Error adding to cart');
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/cart/${productId}`, 
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Wishlist Context
const WishlistContext = createContext();

const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ items: [] });
  const { token } = useAuth();

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const addToWishlist = async (productId) => {
    if (!token) {
      alert('Please login to add to wishlist');
      return false;
    }
    try {
      await axios.post(`${API_URL}/api/wishlist/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Skeleton Loading Component
const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="h-64 skeleton"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton rounded w-3/4"></div>
        <div className="h-4 skeleton rounded w-full"></div>
        <div className="h-4 skeleton rounded w-5/6"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 skeleton rounded w-20"></div>
          <div className="h-6 skeleton rounded w-16"></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 skeleton rounded"></div>
          <div className="flex-1 h-10 skeleton rounded"></div>
        </div>
      </div>
    </div>
  );
};

// Animated Logo Component - Text Only with Ocean Theme
const AnimatedLogo = () => {
  const [showArabic, setShowArabic] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setShowArabic(prev => !prev);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/" className="flex items-center min-w-fit" data-testid="logo">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl ocean-brand transition-all duration-500 hover:scale-105">
        {showArabic && language === 'ar' ? 'المحيط' : 'Ocean'}
      </h1>
    </Link>
  );
};

// Loyalty Badge Component
const LoyaltyBadge = () => {
  const [points, setPoints] = useState(null);
  const { token } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/loyalty/points`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPoints(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  if (!points) return null;

  const tierColors = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-600'
  };

  return (
    <div className={`${tierColors[points.tier]} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
      <span>⭐</span>
      <span>{points.points}</span>
    </div>
  );
};

// Top Bar Component - Mobile Optimized
const TopBar = () => {
  const { t, language, switchLanguage } = useLanguage();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-ocean-200 dark:border-gray-700 text-sm py-2 md:py-3" style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}>
      <div className="container mx-auto px-3 md:px-4 flex justify-between items-center">
        {/* Left Side - Help & Track */}
        <div className="flex items-center space-x-3 md:space-x-6 rtl:space-x-reverse">
          <Link to="/help" className="text-ocean-600 hover:text-ocean-700 font-medium text-xs md:text-sm flex items-center gap-1" data-testid="help-link">
            <span>📞</span>
            <span className="hidden sm:inline">{t('help')}</span>
          </Link>
          <Link to="/track-order" className="text-ocean-600 hover:text-ocean-700 font-medium text-xs md:text-sm flex items-center gap-1" data-testid="track-order-link">
            <span>📦</span>
            <span className="hidden sm:inline">{t('trackOrder')}</span>
          </Link>
        </div>
        {/* Right Side - Language Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 border-2 border-ocean-200 dark:border-gray-600 rounded-full px-2 py-0.5 md:px-3 md:py-1">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                language === 'en' 
                  ? 'bg-ocean-500 text-white' 
                  : 'text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-gray-800'
              }`}
              data-testid="lang-en"
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('ar')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                language === 'ar' 
                  ? 'bg-ocean-500 text-white' 
                  : 'text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-gray-800'
              }`}
              data-testid="lang-ar"
            >
              العربية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showBrandsMenu, setShowBrandsMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios.get(`${API_URL}/api/search/suggestions?q=${searchQuery}`)
        .then(res => {
          setSearchSuggestions(res.data);
          setShowSuggestions(true);
        })
        .catch(err => console.error(err));
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b-2 border-ocean-100 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Animated Logo */}
          <div className="flex-shrink-0">
            <AnimatedLogo />
          </div>

          {/* Search Bar - Mobile Optimized */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border-2 border-ocean-300 dark:border-gray-600 rounded-xl md:rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:focus:ring-ocean-500/30 focus:bg-white dark:focus:bg-gray-700 transition-all"
                data-testid="search-input"
              />
              <button
                type="button"
                onClick={() => alert('Barcode scanner feature - Coming soon!')}
                className="absolute right-14 md:right-20 top-1/2 -translate-y-1/2 text-ocean-600 hover:text-ocean-700 text-lg md:text-xl p-1"
                title="Scan Barcode"
              >
                📷
              </button>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-ocean-500 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-full hover:bg-ocean-600 transition text-sm md:text-base"
                data-testid="search-button"
              >
                🔍
              </button>
            </div>
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                {searchSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigate(`/products/${suggestion.id}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                  >
                    <img src={suggestion.image_url} alt={suggestion.title} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm dark:text-white">{suggestion.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.category}</p>
                    </div>
                    <span className="font-bold text-ocean-600">${suggestion.price}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/wishlist" className="relative hover:text-ocean-600" data-testid="wishlist-link">
                  <span className="text-2xl">❤️</span>
                  {wishlist.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlist.items.length}
                    </span>
                  )}
                </Link>
                <div 
                  className="relative"
                  onMouseEnter={() => setShowCartPreview(true)}
                  onMouseLeave={() => setShowCartPreview(false)}
                >
                  <Link to="/cart" className="relative hover:text-ocean-600" data-testid="cart-link">
                    <span className="text-2xl">🛒</span>
                    {cart.items.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-ocean-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cart.items.length}
                      </span>
                    )}
                  </Link>
                  
                  {/* Cart Preview */}
                  {showCartPreview && cart.items.length > 0 && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 p-4">
                      <h3 className="font-bold text-lg mb-3 dark:text-white">{t('shoppingCart')}</h3>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {cart.items.slice(0, 3).map(item => (
                          <div key={item.product_id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <img src={item.product?.image_url} alt={item.product?.title} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold line-clamp-1 dark:text-white">{item.product?.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{item.quantity} x ${item.product?.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between mb-3">
                          <span className="font-bold dark:text-white">{t('total')}:</span>
                          <span className="font-bold text-ocean-600">${cart.total}</span>
                        </div>
                        <Link 
                          to="/cart" 
                          className="block w-full bg-ocean-600 text-white text-center py-2 rounded-lg hover:bg-ocean-700"
                        >
                          {t('viewCart')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <LoyaltyBadge />
                  <span className="text-sm hidden lg:block dark:text-white" data-testid="user-name">{t('welcome')}, {user.name}</span>
                  {user.role !== 'seller' && (
                    <Link 
                      to="/become-seller"
                      className="hidden md:block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      💼 Become a Seller
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-3 sm:px-4 py-2 rounded-lg text-sm"
                    data-testid="logout-btn"
                  >
                    {t('logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg"
                  data-testid="login-btn"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-ocean-600 text-ocean-600 hover:bg-ocean-50 px-6 py-2 rounded-lg"
                  data-testid="register-btn"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Categories Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowCategoriesMenu(true)}
              onMouseLeave={() => setShowCategoriesMenu(false)}
            >
              <button className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 font-semibold">
                <span>☰</span>
                <span>CATEGORIES</span>
                <span>▼</span>
              </button>
              
              {showCategoriesMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {[
                      { name: t('womensFashion'), icon: '👗', category: 'WomensFashion' },
                      { name: t('mensFashion'), icon: '👔', category: 'MensFashion' },
                      { name: t('kidsBaby'), icon: '👶', category: 'KidsBaby' },
                      { name: t('homeKitchen'), icon: '🏠', category: 'HomeKitchen' },
                      { name: t('beautyPersonalCare'), icon: '💄', category: 'Beauty' },
                      { name: t('sportsFitness'), icon: '⚽', category: 'SportsFitness' },
                      { name: t('electronics'), icon: '📱', category: 'Electronics' },
                      { name: t('shoes'), icon: '👟', category: 'Shoes' },
                    ].map((cat, idx) => (
                      <Link
                        key={idx}
                        to={`/products?category=${cat.category}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="dark:text-white">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/products?category=WomensFashion" className="hover:text-ocean-600 font-medium dark:text-white">WOMEN</Link>
              <Link to="/products?category=MensFashion" className="hover:text-ocean-600 font-medium dark:text-white">MEN</Link>
              <Link to="/products?category=KidsBaby" className="hover:text-ocean-600 font-medium dark:text-white">KIDS</Link>
              <Link to="/products?category=HomeKitchen" className="hover:text-ocean-600 font-medium dark:text-white">HOME</Link>
              <Link to="/products?category=Beauty" className="hover:text-ocean-600 font-medium dark:text-white">BEAUTY</Link>
              <Link to="/products?category=SportsFitness" className="hover:text-ocean-600 font-medium dark:text-white">SPORTS</Link>
              <Link to="/products?new=true" className="hover:text-ocean-600 font-medium text-green-600 dark:text-green-400">NEW IN</Link>
              <Link to="/products?sale=true" className="hover:text-ocean-600 font-medium text-red-600 dark:text-red-400">SALE %</Link>
            </div>

            {/* Brands Dropdown */}
            <div 
              className="relative hidden lg:block"
              onMouseEnter={() => setShowBrandsMenu(true)}
              onMouseLeave={() => setShowBrandsMenu(false)}
            >
              <button className="flex items-center gap-2 px-4 py-2 hover:text-ocean-600 font-medium dark:text-white">
                <span>BRANDS</span>
                <span>▼</span>
              </button>
              
              {showBrandsMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50">
                  <div className="p-2">
                    {['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'LG'].map((brand, idx) => (
                      <Link
                        key={idx}
                        to={`/products?brand=${brand}`}
                        className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-white"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

// Footer Component  
const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('customerService')}</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white">{t('helpCenter')}</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white">{t('returns')}</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white">{t('shippingInfo')}</Link></li>
              <li><Link to="/track" className="text-gray-400 hover:text-white">{t('trackMyOrder')}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('aboutUs')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">{t('aboutUs')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">{t('careers')}</Link></li>
              <li><Link to="/become-seller" className="text-green-400 hover:text-green-300 font-semibold">💼 Become a Seller</Link></li>
              <li><Link to="/affiliate" className="text-gray-400 hover:text-white">{t('affiliateProgram')}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">{t('privacyPolicy')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('category')}</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=Electronics" className="text-gray-400 hover:text-white">{t('electronics')}</Link></li>
              <li><Link to="/products?category=Fashion" className="text-gray-400 hover:text-white">{t('mensFashion')}</Link></li>
              <li><Link to="/products?category=Beauty" className="text-gray-400 hover:text-white">{t('beautyPersonalCare')}</Link></li>
              <li><Link to="/products?category=Home" className="text-gray-400 hover:text-white">{t('homeKitchen')}</Link></li>
            </ul>
          </div>

          {/* Social & Payment */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('followUs')}</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-2xl hover:text-ocean-400">📘</a>
              <a href="#" className="text-2xl hover:text-ocean-400">📷</a>
              <a href="#" className="text-2xl hover:text-ocean-400">🐦</a>
            </div>
            <h3 className="font-bold text-lg mb-4">{t('paymentMethods')}</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Stripe</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Apple Pay</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Tabby</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Tamara</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Mada</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 Ocean. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Hero Section Component - Mobile Optimized
const HeroSection = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false, // Hide arrows on mobile
  };

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
    },
    {
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      title: language === 'ar' ? 'تقنية وإلكترونيات' : 'Tech & Electronics',
      subtitle: language === 'ar' ? 'أحدث الأجهزة والتقنيات' : 'Latest gadgets and devices',
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
      title: language === 'ar' ? 'أزياء وموضة' : 'Fashion & Style',
      subtitle: language === 'ar' ? 'أحدث صيحات الموضة' : 'Trending styles for everyone',
    },
  ];

  return (
    <div className="relative">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx} className="relative">
            {/* Mobile: 280px, Tablet: 350px, Desktop: 500px */}
            <div 
              className="h-[280px] sm:h-[350px] md:h-[500px] bg-cover bg-center relative" 
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 flex items-center justify-center">
                <div className="text-center text-white px-6 md:px-4 max-w-2xl">
                  {/* Mobile: 1.75rem, Tablet: 2.5rem, Desktop: 3.75rem */}
                  <h2 
                    className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 leading-tight" 
                    data-testid="hero-title"
                  >
                    {slide.title}
                  </h2>
                  {/* Mobile: 0.875rem, Tablet: 1rem, Desktop: 1.25rem */}
                  <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  {/* Mobile: Stacked buttons, Desktop: Side by side */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => navigate('/products')}
                      className="touch-btn touch-btn-primary text-sm md:text-lg"
                      data-testid="shop-now-btn"
                    >
                      {t('shopNow')}
                    </button>
                    <button
                      onClick={() => navigate('/about')}
                      className="touch-btn touch-btn-secondary text-sm md:text-lg"
                    >
                      {t('learnMore')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      {/* Custom Dots Styling for Mobile */}
      <style>{`
        .slick-dots {
          bottom: 16px !important;
        }
        .slick-dots li button:before {
          color: white !important;
          opacity: 0.5 !important;
          font-size: 10px !important;
        }
        .slick-dots li.slick-active button:before {
          opacity: 1 !important;
        }
        @media (max-width: 640px) {
          .slick-dots li {
            margin: 0 3px !important;
          }
        }
      `}</style>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, showBadge = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const { token } = useAuth();
  
  // Determine badge type
  const getBadge = () => {
    if (product.discount_percent) {
      return { text: `-${product.discount_percent}%`, color: 'bg-red-600', label: 'SALE' };
    }
    if (product.isNew) {
      return { text: 'NEW', color: 'bg-green-600', label: 'NEW' };
    }
    if (product.isHot) {
      return { text: 'HOT', color: 'bg-orange-600', label: 'HOT' };
    }
    return null;
  };
  
  const badge = showBadge ? getBadge() : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const success = await addToCart(product.id);
    if (success) {
      setShowAddAnimation(true);
      // Award loyalty points
      if (token) {
        axios.post(`${API_URL}/api/loyalty/add-points?points_to_add=10`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error(err));
      }
      setTimeout(() => setShowAddAnimation(false), 2000);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    await addToCart(product.id);
    navigate('/cart');
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="product-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group relative"
      data-testid={`product-card-${product.id}`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute top-3 left-3 z-10 ${badge.color} text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg`}>
          {badge.text}
        </div>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center ${
          inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
        } shadow-md hover:scale-110 transition`}
        data-testid={`wishlist-btn-${product.id}`}
      >
        {inWishlist ? '❤️' : '🤍'}
      </button>

      {/* Badge */}
      {badge && (
        <div className={`absolute top-3 left-3 z-10 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
          {badge.text}
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          onLoad={(e) => e.target.classList.remove('skeleton')}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1" data-testid={`product-title-${product.id}`}>{product.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-ocean-600" data-testid={`product-price-${product.id}`}>${product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm line-through text-gray-400">${product.original_price}</span>
              )}
            </div>
            {product.discount_percent && (
              <span className="text-xs text-red-600 font-semibold">Save ${(product.original_price - product.price).toFixed(2)}</span>
            )}
          </div>
          <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">{product.category}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition relative"
            data-testid={`add-cart-btn-${product.id}`}
          >
            {showAddAnimation ? (
              <span className="animate-bounce">{t('addedToCartAnimation')}</span>
            ) : (
              t('addToCart')
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            data-testid={`buy-now-btn-${product.id}`}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const { t } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all product sections
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/daily-deals`)
      .then(res => setDailyDeals(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/trending`)
      .then(res => setTrending(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${API_URL}/api/products/best-sellers`)
      .then(res => setBestSellers(res.data))
      .catch(err => console.error(err));
    
    if (token) {
      axios.get(`${API_URL}/api/products/recommended`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRecommended(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Daily Deals */}
      {dailyDeals.length > 0 && (
        <section className="py-12 bg-red-50 dark:bg-red-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 text-red-600 dark:text-red-300">⚡ {t('dailyDeals')} ⚡</h2>
              <p className="text-gray-600 dark:text-gray-300">{t('limitedOffer')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {dailyDeals.slice(0, 4).map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden relative">
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    {product.discount_percent}% {t('discount')}
                  </div>
                  <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">{product.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-red-600">${product.price}</span>
                      <span className="text-sm line-through text-gray-400">${product.original_price}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                    >
                      {t('shopNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <section className="py-12 bg-purple-50 dark:bg-purple-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 dark:text-white">💎 {t('recommendedForYou')} 💎</h2>
              <p className="text-gray-600 dark:text-gray-300">Based on your interests</p>
            </div>
            <Slider {...sliderSettings}>
              {recommended.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">{t('trendingNow')}</h2>
            <p className="text-gray-600">{t('freshPicks')}</p>
          </div>

          {products.length > 0 ? (
            <Slider {...sliderSettings}>
              {products.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <ProductSkeleton key={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('shopByCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: t('electronics'), icon: '📱', category: 'Electronics', img: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=400&h=300' },
              { name: t('mensFashion'), icon: '👔', category: 'MensFashion', img: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400&h=300' },
              { name: t('womensFashion'), icon: '👗', category: 'WomensFashion', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300' },
              { name: t('kidsBaby'), icon: '👶', category: 'KidsBaby', img: 'https://images.pexels.com/photos/255514/pexels-photo-255514.jpeg?w=400&h=300' },
              { name: t('sportsFitness'), icon: '⚽', category: 'SportsFitness', img: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=400&h=300' },
              { name: t('homeKitchen'), icon: '🏠', category: 'HomeKitchen', img: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=400&h=300' },
              { name: t('beautyPersonalCare'), icon: '💄', category: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
              { name: t('fragrance'), icon: '🌸', category: 'Fragrance', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop' },
              { name: t('shoes'), icon: '👟', category: 'Shoes', img: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png?w=400&h=300' },
              { name: t('bagsLuggage'), icon: '👜', category: 'Bags', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300' },
              { name: t('jewelryWatches'), icon: '⌚', category: 'Jewelry', img: 'https://images.pexels.com/photos/6662322/pexels-photo-6662322.jpeg?w=400&h=300' },
              { name: t('books'), icon: '📚', category: 'Books', img: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?w=400&h=300' },
              { name: t('toysGames'), icon: '🎮', category: 'Toys', img: 'https://images.pexels.com/photos/168866/pexels-photo-168866.jpeg?w=400&h=300' },
              { name: t('automotive'), icon: '🚗', category: 'Automotive', img: 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?w=400&h=300' },
              { name: t('phonesTablets'), icon: '📱', category: 'Phones', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300' },
              { name: t('computers'), icon: '💻', category: 'Computers', img: 'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?w=400&h=300' },
              { name: t('cameras'), icon: '📷', category: 'Cameras', img: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=400&h=300' },
              { name: t('furniture'), icon: '🛋️', category: 'Furniture', img: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=400&h=300' },
              { name: t('homeDecor'), icon: '🖼️', category: 'HomeDecor', img: 'https://images.pexels.com/photos/298842/pexels-photo-298842.jpeg?w=400&h=300' },
              { name: t('gardenOutdoor'), icon: '🌳', category: 'Garden', img: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?w=400&h=300' },
              { name: t('healthWellness'), icon: '💊', category: 'Health', img: 'https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg?w=400&h=300' },
              { name: t('groceryFood'), icon: '🛒', category: 'Grocery', img: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?w=400&h=300' },
              { name: t('petSupplies'), icon: '🐾', category: 'Pets', img: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?w=400&h=300' },
              { name: t('officeSupplies'), icon: '📎', category: 'Office', img: 'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?w=400&h=300' },
              { name: t('toolsHardware'), icon: '🔧', category: 'Tools', img: 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg?w=400&h=300' },
              { name: t('musicalInstruments'), icon: '🎸', category: 'Music', img: 'https://images.pexels.com/photos/6153367/pexels-photo-6153367.jpeg?w=400&h=300' },
              { name: t('artCrafts'), icon: '🎨', category: 'Art', img: 'https://images.pexels.com/photos/1377034/pexels-photo-1377034.jpeg?w=400&h=300' },
              { name: t('partySupplies'), icon: '🎉', category: 'Party', img: 'https://images.pexels.com/photos/794064/pexels-photo-794064.jpeg?w=400&h=300' },
              { name: t('babyCare'), icon: '🍼', category: 'BabyCare', img: 'https://images.pexels.com/photos/255514/pexels-photo-255514.jpeg?w=400&h=300' },
              // 25 Additional Categories
              { name: 'Smart Home', icon: '🏡', category: 'SmartHome', img: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=400&h=300' },
              { name: 'Gaming', icon: '🎯', category: 'Gaming', img: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?w=400&h=300' },
              { name: 'Travel', icon: '✈️', category: 'Travel', img: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?w=400&h=300' },
              { name: 'Outdoor', icon: '⛺', category: 'Outdoor', img: 'https://images.pexels.com/photos/6271577/pexels-photo-6271577.jpeg?w=400&h=300' },
              { name: 'Appliances', icon: '🔌', category: 'Appliances', img: 'https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg?w=400&h=300' },
              { name: 'Kitchenware', icon: '🍳', category: 'Kitchenware', img: 'https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg?w=400&h=300' },
              { name: 'Lighting', icon: '💡', category: 'Lighting', img: 'https://images.pexels.com/photos/276267/pexels-photo-276267.jpeg?w=400&h=300' },
              { name: 'Bedding', icon: '🛏️', category: 'Bedding', img: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?w=400&h=300' },
              { name: 'Bathroom', icon: '🚿', category: 'Bathroom', img: 'https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg?w=400&h=300' },
              { name: 'Skincare', icon: '🧴', category: 'Skincare', img: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?w=400&h=300' },
              { name: 'Haircare', icon: '💇', category: 'Haircare', img: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?w=400&h=300' },
              { name: 'Fragrance', icon: '🌸', category: 'Fragrance', img: 'https://images.pexels.com/photos/3738386/pexels-photo-3738386.jpeg?w=400&h=300' },
              { name: 'Cycling', icon: '🚴', category: 'Cycling', img: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?w=400&h=300' },
              { name: 'Fitness Equipment', icon: '🏋️', category: 'FitnessEquip', img: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?w=400&h=300' },
              { name: 'Yoga', icon: '🧘', category: 'Yoga', img: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?w=400&h=300' },
              { name: 'Swimming', icon: '🏊', category: 'Swimming', img: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?w=400&h=300' },
              { name: 'Winter Sports', icon: '⛷️', category: 'WinterSports', img: 'https://images.pexels.com/photos/848599/pexels-photo-848599.jpeg?w=400&h=300' },
              { name: 'Stationery', icon: '✏️', category: 'Stationery', img: 'https://images.pexels.com/photos/3831645/pexels-photo-3831645.jpeg?w=400&h=300' },
              { name: 'Backpacks', icon: '🎒', category: 'Backpacks', img: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?w=400&h=300' },
              { name: 'Sunglasses', icon: '🕶️', category: 'Sunglasses', img: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?w=400&h=300' },
              { name: 'Hats & Caps', icon: '🧢', category: 'Hats', img: 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?w=400&h=300' },
              { name: 'Belts', icon: '👔', category: 'Belts', img: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=400&h=300' },
              { name: 'Socks', icon: '🧦', category: 'Socks', img: 'https://images.pexels.com/photos/2995333/pexels-photo-2995333.jpeg?w=400&h=300' },
              { name: 'Underwear', icon: '👙', category: 'Underwear', img: 'https://images.pexels.com/photos/2235071/pexels-photo-2235071.jpeg?w=400&h=300' },
              { name: 'Activewear', icon: '🏃', category: 'Activewear', img: 'https://images.pexels.com/photos/4498598/pexels-photo-4498598.jpeg?w=400&h=300' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/products?category=${cat.category}`}
                className="group relative h-40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                data-testid={`category-${cat.category}`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cat.img})` }}
                ></div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition"></div>
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                  <span className="text-5xl mb-2 drop-shadow-lg">{cat.icon}</span>
                  <h3 className="text-sm font-bold text-center drop-shadow-lg">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-12 bg-yellow-50 dark:bg-yellow-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 dark:text-white">🏆 {t('bestSellers')} 🏆</h2>
              <p className="text-gray-600 dark:text-gray-300">Most popular products</p>
            </div>
            <Slider {...sliderSettings}>
              {bestSellers.map(product => (
                <div key={product.id} className="px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}
    </div>
  );
};

// Customer Area Page
const CustomerAreaPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Load user data
    if (user) {
      setProfile({ name: user.name, email: user.email, phone: user.phone || '' });
    }
    
    // Load orders
    axios.get(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error(err));
  }, [token, user, navigate]);

  if (!token) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-ocean-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-lg dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'profile', icon: '👤', label: 'Profile' },
                { id: 'orders', icon: '📦', label: 'My Orders' },
                { id: 'addresses', icon: '📍', label: 'Addresses' },
                { id: 'wishlist', icon: '❤️', label: 'Wishlist' },
                { id: 'settings', icon: '⚙️', label: 'Settings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-ocean-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-white">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-white">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-white">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-semibold">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">My Orders</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border dark:border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm dark:text-white">
                            <span>{item.title} x{item.quantity}</span>
                            <span>${item.item_total}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                        <span className="font-bold dark:text-white">Total: ${order.total}</span>
                        <button className="text-ocean-600 hover:underline">Track Order</button>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">No orders yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">My Addresses</h2>
                <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-semibold mb-6">
                  + Add New Address
                </button>
                <p className="text-gray-500 dark:text-gray-400">No addresses saved yet</p>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">My Wishlist</h2>
                <Link to="/wishlist" className="text-ocean-600 hover:underline">View Full Wishlist →</Link>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Account Settings</h2>
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                    Change Password
                  </button>
                  <button className="w-full text-left px-4 py-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                    Notification Preferences
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Page
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const location = window.location;
  const productsPerPage = 12;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const categoryParam = params.get('category') || '';
    
    setSearch(searchParam);
    setCategory(categoryParam);
    setPage(1);
    
    const apiParams = new URLSearchParams();
    if (searchParam) apiParams.append('search', searchParam);
    if (categoryParam) apiParams.append('category', categoryParam);
    
    axios.get(`${API_URL}/api/products?${apiParams.toString()}`)
      .then(res => {
        let filtered = res.data;
        
        // Apply filters
        if (selectedBrand) {
          filtered = filtered.filter(p => p.brand === selectedBrand);
        }
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
        
        // Apply sorting
        filtered = sortProducts(filtered, sortBy);
        
        setProducts(filtered);
        setDisplayedProducts(filtered.slice(0, productsPerPage));
        setHasMore(filtered.length > productsPerPage);
      })
      .catch(err => console.error(err));
  }, [location.search, sortBy, priceRange, selectedBrand]);
  
  const sortProducts = (prods, sort) => {
    const sorted = [...prods];
    switch(sort) {
      case 'priceLow':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceHigh':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };
  
  const loadMore = () => {
    const nextPage = page + 1;
    const start = nextPage * productsPerPage;
    const newProducts = products.slice(0, start);
    setDisplayedProducts(newProducts);
    setPage(nextPage);
    setHasMore(products.length > start);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold dark:text-white">{t('allProducts')}</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden bg-ocean-600 text-white px-4 py-2 rounded-lg"
        >
          {t('filters')} ☰
        </button>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-4 dark:text-white">{t('filters')}</h3>
            
            {/* Sort By */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="newest">{t('newest')}</option>
                <option value="priceLow">{t('priceLowToHigh')}</option>
                <option value="priceHigh">{t('priceHighToLow')}</option>
                <option value="popular">{t('mostPopular')}</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('priceRange')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Min"
                />
                <span className="dark:text-white">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Max"
                />
              </div>
            </div>
            
            {/* Brand Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 dark:text-white">{t('brand')}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">All Brands</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
              </select>
            </div>
            
            <button 
              onClick={() => {
                setSortBy('newest');
                setPriceRange([0, 10000]);
                setSelectedBrand('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg"
            >
              {t('clearFilters')}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('showing')} {displayedProducts.length} {t('results')}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {displayedProducts.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-12">No products found</p>
          )}
          
          {/* Load More Button */}
          {hasMore && displayedProducts.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                {t('loadMore')}
              </button>
            </div>
          )}
          
          {!hasMore && displayedProducts.length > 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noMoreProducts')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Bottom Navigation for Mobile - iOS/Android Optimized
const BottomNavigation = () => {
  const { t, language } = useLanguage();
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

// Store Layout Component
function StoreLayout() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <TopBar />
                <Header />
                <main className="flex-1 pb-20 md:pb-0">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/account" element={<CustomerAreaPage />} />
                    <Route path="/my-account" element={<CustomerAreaPage />} />
                  </Routes>
                </main>
                <Footer />
                <BottomNavigation />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </DarkModeProvider>
    </LanguageProvider>
  );
}

// Main App Component with Admin Route
function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Seller Dashboard */}
        <Route path="/seller/*" element={<SellerApp />} />
        {/* Store */}
        <Route path="/*" element={<StoreLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
