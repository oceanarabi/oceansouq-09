import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const getTranslation = (lang, key) => {
  const translations = {
    en: { login: 'Login', shopNow: 'Shop Now', addToCart: 'Add to Cart', outOfStock: 'Out of Stock' },
    ar: { login: 'تسجيل الدخول', shopNow: 'تسوق الآن', addToCart: 'أضف للسلة', outOfStock: 'نفد المخزون' }
  };
  return translations[lang]?.[key] || key;
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const t = (key) => getTranslation(language, key);
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const [userRes, wishlistRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUser(userRes.data);
        setWishlist(wishlistRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWishlist(prev => ({ ...prev, items: prev.items.filter(p => p.id !== productId) }));
    } catch (err) { console.error(err); }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/api/cart`, { product_id: productId, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
      return true;
    } catch (err) { console.error(err); return false; }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center"><div className="loading-spinner mx-auto"></div></div>;

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) {
      await removeFromWishlist(productId);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-6 block">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please Log In'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'يجب تسجيل الدخول لعرض المفضلة' : 'You need to log in to view your wishlist'}
          </p>
          <Link to="/login" className="inline-block bg-ocean-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-ocean-700">
            {t('login')}
          </Link>
        </div>
      </div>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-6 block">❤️</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'قائمة المفضلة فارغة' : 'Your Wishlist is Empty'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'ابدأ بإضافة منتجات للمفضلة' : 'Start adding products to your wishlist'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-ocean-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-ocean-700"
          >
            {t('shopNow')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {language === 'ar' ? 'المفضلة' : 'My Wishlist'}
        <span className="text-lg font-normal text-gray-500 ml-2">({wishlist.items.length} {language === 'ar' ? 'منتج' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.items.map(product => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div
              onClick={() => navigate(`/products/${product.id}`)}
              className="relative h-48 cursor-pointer"
            >
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                ❤️
              </button>
            </div>
            <div className="p-4">
              <h3
                onClick={() => navigate(`/products/${product.id}`)}
                className="font-semibold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-ocean-600"
              >
                {product.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-ocean-600">${product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm line-through text-gray-400">${product.original_price}</span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stock === 0}
                className="w-full mt-4 bg-ocean-600 hover:bg-ocean-700 text-white py-3 rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {product.stock === 0 ? (language === 'ar' ? 'نفد المخزون' : 'Out of Stock') : t('addToCart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
