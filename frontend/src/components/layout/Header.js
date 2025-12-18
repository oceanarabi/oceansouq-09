import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, useCart, useWishlist, useLanguage } from '../../contexts';
import { AnimatedLogo, LoyaltyBadge } from '../common';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
                <Link to="/wishlist" className="relative hover:text-ocean-600 hidden md:block" data-testid="wishlist-link">
                  <span className="text-2xl">❤️</span>
                  {wishlist.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlist.items.length}
                    </span>
                  )}
                </Link>
                <div 
                  className="relative hidden md:block"
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
                  className="bg-ocean-600 hover:bg-ocean-700 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base"
                  data-testid="login-btn"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block border-2 border-ocean-600 text-ocean-600 hover:bg-ocean-50 px-4 md:px-6 py-2 rounded-lg text-sm md:text-base"
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
      <nav className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-sm hidden md:block">
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

export default Header;
