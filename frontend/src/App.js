import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';
import { getTranslation } from './i18n';

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

// Top Bar Component
const TopBar = () => {
  const { t, language, switchLanguage } = useLanguage();

  return (
    <div className="bg-gray-900 text-white text-sm py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link to="/help" className="hover:text-ocean-300" data-testid="help-link">{t('help')}</Link>
          <Link to="/track-order" className="hover:text-ocean-300" data-testid="track-order-link">{t('trackOrder')}</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-ocean-300">{t('freeShipping')}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2 py-1 rounded ${language === 'en' ? 'bg-ocean-600' : 'hover:bg-gray-800'}`}
              data-testid="lang-en"
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('ar')}
              className={`px-2 py-1 rounded ${language === 'ar' ? 'bg-ocean-600' : 'hover:bg-gray-800'}`}
              data-testid="lang-ar"
            >
              AR
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-fit" data-testid="logo">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">🌊</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold text-ocean-700">Ocean</h1>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full px-6 py-3 border-2 border-gray-300 rounded-full focus:border-ocean-500 focus:outline-none"
                data-testid="search-input"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-ocean-600 text-white px-6 py-2 rounded-full hover:bg-ocean-700"
                data-testid="search-button"
              >
                🔍
              </button>
            </div>
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
                <Link to="/cart" className="relative hover:text-ocean-600" data-testid="cart-link">
                  <span className="text-2xl">🛒</span>
                  {cart.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-ocean-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm hidden lg:block" data-testid="user-name">{t('welcome')}, {user.name}</span>
                  <button
                    onClick={logout}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm"
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

      {/* Navigation Bar */}
      <nav className="bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 py-3 overflow-x-auto">
            <Link to="/products" className="hover:text-ocean-600 font-medium whitespace-nowrap" data-testid="nav-all">{t('allProducts')}</Link>
            <Link to="/products?category=Electronics" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('electronics')}</Link>
            <Link to="/products?category=Fashion" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('mensFashion')}</Link>
            <Link to="/products?category=Beauty" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('beautyPersonalCare')}</Link>
            <Link to="/products?category=Home" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('homeKitchen')}</Link>
            <Link to="/products?category=Sports" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('sportsFitness')}</Link>
            <Link to="/products?category=Kids" className="hover:text-ocean-600 font-medium whitespace-nowrap">{t('kidsBaby')}</Link>
            {user?.role === 'seller' && (
              <Link to="/dashboard" className="hover:text-ocean-600 font-medium text-ocean-700 whitespace-nowrap">{t('myProducts')}</Link>
            )}
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
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

// Hero Section Component
const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
    },
    {
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      title: 'Tech & Electronics',
      subtitle: 'Latest gadgets and devices',
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
      title: 'Fashion & Style',
      subtitle: 'Trending styles for everyone',
    },
  ];

  return (
    <div className="relative">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx} className="relative">
            <div className="h-96 md:h-[500px] bg-cover bg-center relative" style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-5xl md:text-6xl font-bold mb-4" data-testid="hero-title">{slide.title}</h2>
                  <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                      data-testid="shop-now-btn"
                    >
                      {t('shopNow')}
                    </button>
                    <button
                      onClick={() => navigate('/about')}
                      className="bg-white hover:bg-gray-100 text-ocean-600 px-8 py-3 rounded-lg text-lg font-semibold"
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
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(product.id);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="product-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group relative"
      data-testid={`product-card-${product.id}`}
    >
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

      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
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
          <span className="text-2xl font-bold text-ocean-600" data-testid={`product-price-${product.id}`}>${product.price}</span>
          <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">{product.category}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          data-testid={`add-cart-btn-${product.id}`}
        >
          {t('addToCart')}
        </button>
      </div>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

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

      {/* Trending Products */}
      <section className="py-16 bg-gray-50">
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
            <p className="text-center text-gray-600">Loading products...</p>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('shopByCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: t('electronics'), icon: '📱', category: 'Electronics', color: 'from-blue-500 to-blue-700' },
              { name: t('mensFashion'), icon: '👔', category: 'MensFashion', color: 'from-gray-700 to-gray-900' },
              { name: t('womensFashion'), icon: '👗', category: 'WomensFashion', color: 'from-pink-500 to-pink-700' },
              { name: t('kidsBaby'), icon: '👶', category: 'KidsBaby', color: 'from-yellow-400 to-yellow-600' },
              { name: t('sportsFitness'), icon: '⚽', category: 'SportsFitness', color: 'from-green-500 to-green-700' },
              { name: t('homeKitchen'), icon: '🏠', category: 'HomeKitchen', color: 'from-orange-500 to-orange-700' },
              { name: t('beautyPersonalCare'), icon: '💄', category: 'Beauty', color: 'from-purple-500 to-purple-700' },
              { name: t('shoes'), icon: '👟', category: 'Shoes', color: 'from-red-500 to-red-700' },
              { name: t('bagsLuggage'), icon: '👜', category: 'Bags', color: 'from-indigo-500 to-indigo-700' },
              { name: t('jewelryWatches'), icon: '⌚', category: 'Jewelry', color: 'from-yellow-600 to-yellow-800' },
              { name: t('books'), icon: '📚', category: 'Books', color: 'from-teal-500 to-teal-700' },
              { name: t('toysGames'), icon: '🎮', category: 'Toys', color: 'from-cyan-500 to-cyan-700' },
              { name: t('automotive'), icon: '🚗', category: 'Automotive', color: 'from-gray-600 to-gray-800' },
              { name: t('phonesTablets'), icon: '📱', category: 'Phones', color: 'from-blue-600 to-blue-800' },
              { name: t('computers'), icon: '💻', category: 'Computers', color: 'from-slate-600 to-slate-800' },
              { name: t('cameras'), icon: '📷', category: 'Cameras', color: 'from-rose-500 to-rose-700' },
              { name: t('furniture'), icon: '🛋️', category: 'Furniture', color: 'from-amber-600 to-amber-800' },
              { name: t('homeDecor'), icon: '🖼️', category: 'HomeDecor', color: 'from-lime-500 to-lime-700' },
              { name: t('gardenOutdoor'), icon: '🌳', category: 'Garden', color: 'from-emerald-500 to-emerald-700' },
              { name: t('healthWellness'), icon: '💊', category: 'Health', color: 'from-red-400 to-red-600' },
              { name: t('groceryFood'), icon: '🛒', category: 'Grocery', color: 'from-green-600 to-green-800' },
              { name: t('petSupplies'), icon: '🐾', category: 'Pets', color: 'from-orange-400 to-orange-600' },
              { name: t('officeSupplies'), icon: '📎', category: 'Office', color: 'from-blue-500 to-blue-700' },
              { name: t('toolsHardware'), icon: '🔧', category: 'Tools', color: 'from-gray-500 to-gray-700' },
              { name: t('musicalInstruments'), icon: '🎸', category: 'Music', color: 'from-violet-500 to-violet-700' },
              { name: t('artCrafts'), icon: '🎨', category: 'Art', color: 'from-fuchsia-500 to-fuchsia-700' },
              { name: t('partySupplies'), icon: '🎉', category: 'Party', color: 'from-pink-400 to-pink-600' },
              { name: t('babyCare'), icon: '🍼', category: 'BabyCare', color: 'from-sky-400 to-sky-600' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/products?category=${cat.category}`}
                className={`group relative h-32 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-gradient-to-br ${cat.color}`}
                data-testid={`category-${cat.category}`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                  <span className="text-4xl mb-2">{cat.icon}</span>
                  <h3 className="text-sm font-bold text-center">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { t } = useLanguage();
  const location = window.location;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const categoryParam = params.get('category') || '';
    
    setSearch(searchParam);
    setCategory(categoryParam);
    
    const apiParams = new URLSearchParams();
    if (searchParam) apiParams.append('search', searchParam);
    if (categoryParam) apiParams.append('category', categoryParam);
    
    axios.get(`${API_URL}/api/products?${apiParams.toString()}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [location.search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('allProducts')}</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={t('searchProduct')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-ocean-500 focus:outline-none"
          data-testid="search-filter"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-ocean-500 focus:outline-none"
          data-testid="category-filter"
        >
          <option value="">{t('allCategories')}</option>
          <option value="قوارب">{t('boats')}</option>
          <option value="غوص">{t('diving')}</option>
          <option value="معدات صيد">{t('fishing')}</option>
          <option value="إكسسوارات">{t('accessories')}</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600 py-12">No products found</p>
      )}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <TopBar />
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
