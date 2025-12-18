import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FollowSeller from '../components/FollowSeller';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const getTranslation = (lang, key) => {
  const translations = {
    en: { addToCart: 'Add to Cart', outOfStock: 'Out of Stock', addedToCartAnimation: '✓ Added!' },
    ar: { addToCart: 'أضف للسلة', outOfStock: 'نفد المخزون', addedToCartAnimation: '✓ تمت الإضافة!' }
  };
  return translations[lang]?.[key] || key;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const t = (key) => getTranslation(language, key);
  const token = localStorage.getItem('token');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  const inWishlist = product ? wishlistIds.includes(product.id) : false;

  // Fetch wishlist IDs
  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setWishlistIds(res.data.items.map(i => i.id)))
        .catch(err => console.error(err));
    }
  }, [token]);

  const addToCart = async (productId, qty = 1) => {
    if (!token) { alert('Please login'); return false; }
    try {
      await axios.post(`${API_URL}/api/cart`, { product_id: productId, quantity: qty }, { headers: { Authorization: `Bearer ${token}` } });
      return true;
    } catch (err) { console.error(err); return false; }
  };

  const addToWishlist = async (productId) => {
    if (!token) { alert('Please login'); return false; }
    try {
      await axios.post(`${API_URL}/api/wishlist/${productId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setWishlistIds(prev => [...prev, productId]);
      return true;
    } catch (err) { console.error(err); return false; }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWishlistIds(prev => prev.filter(id => id !== productId));
      return true;
    } catch (err) { console.error(err); return false; }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
        
        // Fetch related products
        const relatedRes = await axios.get(`${API_URL}/api/products?category=${res.data.category}&limit=4`);
        setRelatedProducts(relatedRes.data.products.filter(p => p.id !== id).slice(0, 4));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      setShowAddedMessage(true);
      if (token) {
        axios.post(`${API_URL}/api/loyalty/add-points?points_to_add=${quantity * 10}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error(err));
      }
      setTimeout(() => setShowAddedMessage(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
        </h2>
        <button onClick={() => navigate('/products')} className="bg-ocean-600 text-white px-6 py-3 rounded-xl">
          {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.image_url];
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><button onClick={() => navigate('/')} className="hover:text-ocean-600">{language === 'ar' ? 'الرئيسية' : 'Home'}</button></li>
          <li>/</li>
          <li><button onClick={() => navigate('/products')} className="hover:text-ocean-600">{language === 'ar' ? 'المنتجات' : 'Products'}</button></li>
          <li>/</li>
          <li><button onClick={() => navigate(`/products?category=${product.category}`)} className="hover:text-ocean-600">{product.category}</button></li>
          <li>/</li>
          <li className="text-gray-900 dark:text-white font-medium truncate max-w-[150px]">{product.title}</li>
        </ol>
      </nav>

      {/* Success Message */}
      {showAddedMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{language === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                -{discount}%
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{t('outOfStock')}</span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-ocean-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            <span className="text-sm text-ocean-600 font-medium">{product.category}</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating || 4))}
              {'☆'.repeat(5 - Math.floor(product.rating || 4))}
            </div>
            <span className="text-gray-500">({product.reviews_count || 0} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl md:text-4xl font-bold text-ocean-600">${product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.original_price}</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">
                  {language === 'ar' ? `وفر $${(product.original_price - product.price).toFixed(2)}` : `Save $${(product.original_price - product.price).toFixed(2)}`}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-green-600 font-medium">
                  {language === 'ar' ? `متوفر (${product.stock} قطعة)` : `In Stock (${product.stock} items)`}
                </span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-red-600 font-medium">{t('outOfStock')}</span>
              </>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'الكمية:' : 'Quantity:'}
              </span>
              <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-xl"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <span>🛒</span>
              <span>{t('addToCart')}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {language === 'ar' ? 'اشتري الآن' : 'Buy Now'}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition ${
                inWishlist 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {language === 'ar' ? 'شحن مجاني' : 'Free Shipping'}
                </p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'للطلبات فوق $50' : 'On orders over $50'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {language === 'ar' ? 'إرجاع مجاني' : 'Free Returns'}
                </p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'خلال 30 يوم' : 'Within 30 days'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {language === 'ar' ? 'ضمان سنة' : '1 Year Warranty'}
                </p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'ضمان المصنع' : 'Manufacturer warranty'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {language === 'ar' ? 'دفع آمن' : 'Secure Payment'}
                </p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'تشفير SSL' : 'SSL Encrypted'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{p.title}</h3>
                  <p className="text-ocean-600 font-bold mt-1">${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
