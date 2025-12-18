import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ProductComparison = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language') || 'en';
  const navigate = useNavigate();

  const t = (key) => {
    const translations = {
      en: {
        compareProducts: 'Compare Products',
        noProducts: 'No products to compare. Add products from the product page.',
        remove: 'Remove',
        price: 'Price',
        category: 'Category',
        stock: 'Stock',
        rating: 'Rating',
        addToCart: 'Add to Cart',
        clearAll: 'Clear All',
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
        viewProduct: 'View Product',
        browseProducts: 'Browse Products'
      },
      ar: {
        compareProducts: 'مقارنة المنتجات',
        noProducts: 'لا توجد منتجات للمقارنة. أضف منتجات من صفحة المنتج.',
        remove: 'إزالة',
        price: 'السعر',
        category: 'الفئة',
        stock: 'المخزون',
        rating: 'التقييم',
        addToCart: 'أضف للسلة',
        clearAll: 'مسح الكل',
        inStock: 'متوفر',
        outOfStock: 'غير متوفر',
        viewProduct: 'عرض المنتج',
        browseProducts: 'تصفح المنتجات'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/compare`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching comparison:', err);
    }
    setLoading(false);
  };

  const removeFromCompare = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/compare/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error removing from compare:', err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/compare`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([]);
    } catch (err) {
      console.error('Error clearing comparison:', err);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/api/cart`, 
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(language === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{t('compareProducts')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('noProducts')}</p>
        <Link 
          to="/products" 
          className="inline-block bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          {t('browseProducts')}
        </Link>
      </div>
    );
  }

  const comparisonFields = [
    { key: 'price', label: t('price'), render: (p) => `$${p.price}` },
    { key: 'category', label: t('category'), render: (p) => p.category },
    { key: 'stock', label: t('stock'), render: (p) => p.stock > 0 ? `✅ ${t('inStock')} (${p.stock})` : `❌ ${t('outOfStock')}` },
    { key: 'rating', label: t('rating'), render: (p) => '⭐'.repeat(Math.round(p.rating || 4)) + ` (${p.rating || 4.0})` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">{t('compareProducts')}</h1>
        <button 
          onClick={clearAll}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          {t('clearAll')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 dark:bg-gray-700 text-left"></th>
              {products.map(product => (
                <th key={product.id} className="p-4 bg-gray-50 dark:bg-gray-700 min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-sm dark:text-white line-clamp-2">{product.title}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field, idx) => (
              <tr key={field.key} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">{field.label}</td>
                {products.map(product => (
                  <td key={product.id} className="p-4 text-center dark:text-white">
                    {field.render(product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-ocean-50 dark:bg-ocean-900/20">
              <td className="p-4"></td>
              {products.map(product => (
                <td key={product.id} className="p-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      {t('addToCart')}
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg text-sm font-semibold text-center transition"
                    >
                      {t('viewProduct')}
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductComparison;
