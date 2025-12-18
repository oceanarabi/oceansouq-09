import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RecentlyViewed = ({ limit = 6 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language') || 'en';
  const navigate = useNavigate();

  const t = (key) => {
    const translations = {
      en: {
        recentlyViewed: 'Recently Viewed',
        viewAll: 'View All',
        addToCart: 'Add to Cart',
        noHistory: 'No recently viewed products'
      },
      ar: {
        recentlyViewed: 'شوهد مؤخراً',
        viewAll: 'عرض الكل',
        addToCart: 'أضف للسلة',
        noHistory: 'لا توجد منتجات مشاهدة مؤخراً'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/recently-viewed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts((res.data.products || []).slice(0, limit));
    } catch (err) {
      console.error('Error fetching recently viewed:', err);
    }
    setLoading(false);
  };

  const addToCart = async (e, productId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/cart`, 
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <span>🕐</span> {t('recentlyViewed')}
          </h2>
          <Link 
            to="/recently-viewed"
            className="text-ocean-600 hover:text-ocean-700 font-semibold text-sm"
          >
            {t('viewAll')} →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group"
            >
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold line-clamp-2 mb-2 dark:text-white">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-600 font-bold">${product.price}</span>
                  <button
                    onClick={(e) => addToCart(e, product.id)}
                    className="text-xs bg-ocean-600 hover:bg-ocean-700 text-white px-2 py-1 rounded transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
