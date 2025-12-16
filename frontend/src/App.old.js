import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
    if (!token) return alert('Please login to add items to cart');
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

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-ocean-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🌊</span>
            <span className="text-2xl font-bold">OceanSouq</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-ocean-200" data-testid="nav-products">المنتجات</Link>
            {user?.role === 'seller' && (
              <Link to="/dashboard" className="hover:text-ocean-200" data-testid="nav-dashboard">لوحة البائع</Link>
            )}
            <Link to="/cart" className="hover:text-ocean-200 relative" data-testid="nav-cart">
              <span>🛒 السلة</span>
              {cart.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm" data-testid="user-greeting">مرحباً، {user.name}</span>
                <button 
                  onClick={logout}
                  className="bg-ocean-700 hover:bg-ocean-800 px-4 py-2 rounded-lg text-sm"
                  data-testid="logout-button"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="bg-ocean-700 hover:bg-ocean-800 px-4 py-2 rounded-lg text-sm"
                  data-testid="login-link"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-ocean-600 hover:bg-ocean-50 px-4 py-2 rounded-lg text-sm font-semibold"
                  data-testid="register-link"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl">🌊</span>
          <span className="text-xl font-bold">OceanSouq</span>
        </div>
        <p className="text-gray-400">السوق البحري الخاص بك - جميع الحقوق محفوظة 2025</p>
      </div>
    </footer>
  );
};

// Home Page
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6" data-testid="hero-title">مرحباً بك في OceanSouq 🌊</h1>
          <p className="text-xl mb-8 text-ocean-100">سوقك البحري لكل ما تحتاجه من معدات بحرية وقوارب ومستلزمات الصيد</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-ocean-600 px-8 py-3 rounded-lg font-semibold hover:bg-ocean-50 transition"
              data-testid="browse-products-button"
            >
              تصفح المنتجات
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-ocean-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-ocean-900 transition"
              data-testid="start-selling-button"
            >
              ابدأ البيع
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">الفئات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['قوارب', 'معدات صيد', 'غوص', 'إكسسوارات'].map((category, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/products?category=${category}`)}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl cursor-pointer text-center transition"
                data-testid={`category-${category}`}
              >
                <div className="text-5xl mb-4">{['⛵', '🎣', '🤿', '⚓'][idx]}</div>
                <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">منتجات مميزة</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="product-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                  data-testid={`featured-product-${product.id}`}
                >
                  <div className="h-48 bg-gradient-to-br from-ocean-200 to-ocean-400 flex items-center justify-center">
                    <span className="text-6xl">{product.image_url || '📦'}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">{product.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-ocean-600">${product.price}</span>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">جاري التحميل...</p>
          )}
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
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    axios.get(`${API_URL}/api/products?${params.toString()}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [search, category]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">جميع المنتجات</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          data-testid="search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          data-testid="category-filter"
        >
          <option value="">جميع الفئات</option>
          <option value="قوارب">قوارب</option>
          <option value="معدات صيد">معدات صيد</option>
          <option value="غوص">غوص</option>
          <option value="إكسسوارات">إكسسوارات</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div 
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            className="product-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
            data-testid={`product-card-${product.id}`}
          >
            <div className="h-40 bg-gradient-to-br from-ocean-200 to-ocean-400 flex items-center justify-center">
              <span className="text-5xl">{product.image_url || '📦'}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-gray-800">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-ocean-600">${product.price}</span>
                <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">{product.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-600 py-12">لا توجد منتجات</p>
      )}
    </div>
  );
};

// Product Detail Page
const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(id, quantity);
    if (success) {
      alert('تمت إضافة المنتج إلى السلة');
      navigate('/cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) return alert('يرجى تسجيل الدخول لإضافة تقييم');
    
    try {
      await axios.post(`${API_URL}/api/reviews`, 
        { product_id: id, rating: review.rating, comment: review.comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('تم إضافة التقييم بنجاح');
      setReview({ rating: 5, comment: '' });
      // Refresh product
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      alert(error.response?.data?.detail || 'خطأ في إضافة التقييم');
    }
  };

  if (!product) return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-ocean-200 to-ocean-400 rounded-2xl h-96 flex items-center justify-center">
          <span className="text-9xl">{product.image_url || '📦'}</span>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4 text-gray-800" data-testid="product-title">{product.title}</h1>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="ml-2 text-gray-600" data-testid="review-count">({product.review_count} تقييم)</span>
          </div>
          <p className="text-gray-600 mb-6" data-testid="product-description">{product.description}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-ocean-600" data-testid="product-price">${product.price}</span>
            <span className="ml-3 text-gray-500">متوفر: {product.stock}</span>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">الكمية</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              data-testid="quantity-input"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-testid="add-to-cart-button"
          >
            {product.stock === 0 ? 'نفذت الكمية' : 'أضف إلى السلة 🛒'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">التقييمات</h2>
        
        {/* Add Review Form */}
        {user && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold mb-4">أضف تقييمك</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">التقييم</label>
              <select
                value={review.rating}
                onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                data-testid="rating-select"
              >
                {[5,4,3,2,1].map(r => (
                  <option key={r} value={r}>{'⭐'.repeat(r)}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">التعليق</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({...review, comment: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
                required
                data-testid="review-comment"
              />
            </div>
            <button 
              type="submit"
              className="bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700"
              data-testid="submit-review-button"
            >
              إضافة التقييم
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews?.map(rev => (
            <div key={rev.id} className="bg-white p-6 rounded-xl shadow-md" data-testid={`review-${rev.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{rev.user_name}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rev.rating ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, fetchCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">يرجى تسجيل الدخول</h2>
        <Link to="/login" className="text-ocean-600 hover:underline">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800" data-testid="cart-title">سلة التسوق</h1>
      
      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">السلة فارغة</p>
          <Link to="/products" className="text-ocean-600 hover:underline">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.product_id} className="bg-white p-6 rounded-xl shadow-md" data-testid={`cart-item-${item.product_id}`}>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-ocean-200 to-ocean-400 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">{item.product?.image_url || '📦'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{item.product?.title}</h3>
                    <p className="text-gray-600 mb-2">${item.product?.price}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.product?.stock}
                        value={item.quantity}
                        onChange={(e) => updateCartItem(item.product_id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        data-testid={`quantity-${item.product_id}`}
                      />
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`remove-${item.product_id}`}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ocean-600">${item.item_total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
              <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span data-testid="subtotal">${cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>مجاني</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span>الإجمالي</span>
                  <span className="text-ocean-600" data-testid="total">${cart.total}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700"
                data-testid="checkout-button"
              >
                إتمام الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Checkout Page
const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    shipping_name: '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    shipping_phone: ''
  });
  const [loading, setLoading] = useState(false);

  if (!token || cart.items.length === 0) {
    return <Navigate to="/cart" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/orders`, shipping, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`تم تأكيد الطلب! رقم الطلب: ${res.data.order_id}`);
      await fetchCart();
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.detail || 'خطأ في إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">إتمام الطلب</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6">معلومات الشحن</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={shipping.shipping_name}
                  onChange={(e) => setShipping({...shipping, shipping_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  data-testid="shipping-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">العنوان</label>
                <input
                  type="text"
                  required
                  value={shipping.shipping_address}
                  onChange={(e) => setShipping({...shipping, shipping_address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  data-testid="shipping-address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">المدينة</label>
                  <input
                    type="text"
                    required
                    value={shipping.shipping_city}
                    onChange={(e) => setShipping({...shipping, shipping_city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    data-testid="shipping-city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">الرمز البريدي</label>
                  <input
                    type="text"
                    required
                    value={shipping.shipping_zip}
                    onChange={(e) => setShipping({...shipping, shipping_zip: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    data-testid="shipping-zip"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  value={shipping.shipping_phone}
                  onChange={(e) => setShipping({...shipping, shipping_phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  data-testid="shipping-phone"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700 disabled:bg-gray-400"
              data-testid="place-order-button"
            >
              {loading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
            <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>
            <div className="space-y-3 mb-6">
              {cart.items.map(item => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>{item.product?.title} x{item.quantity}</span>
                  <span>${item.item_total}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between text-xl font-bold">
                <span>الإجمالي</span>
                <span className="text-ocean-600">${cart.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page (Seller)
const DashboardPage = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'قوارب',
    image_url: '⛵',
    stock: ''
  });

  useEffect(() => {
    if (token) {
      if (user?.role === 'seller') {
        axios.get(`${API_URL}/api/products/seller/my-products`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setProducts(res.data));
      }
      
      axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setOrders(res.data));
    }
  }, [token, user]);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct.id}`, productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('تم تحديث المنتج');
      } else {
        await axios.post(`${API_URL}/api/products`, productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('تم إضافة المنتج');
      }
      
      // Refresh products
      const res = await axios.get(`${API_URL}/api/products/seller/my-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ title: '', description: '', price: '', category: 'قوارب', image_url: '⛵', stock: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'خطأ في حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف المنتج؟')) return;
    
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productId));
      alert('تم حذف المنتج');
    } catch (error) {
      alert('خطأ في حذف المنتج');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      stock: product.stock
    });
    setShowProductForm(true);
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800" data-testid="dashboard-title">
        {user?.role === 'seller' ? 'لوحة البائع' : 'لوحة المشتري'}
      </h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-8">
        {user?.role === 'seller' && (
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'border-b-2 border-ocean-600 text-ocean-600' : 'text-gray-600'}`}
            data-testid="products-tab"
          >
            منتجاتي
          </button>
        )}
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-ocean-600 text-ocean-600' : 'text-gray-600'}`}
          data-testid="orders-tab"
        >
          طلباتي
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && user?.role === 'seller' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">منتجاتي</h2>
            <button
              onClick={() => {
                setShowProductForm(true);
                setEditingProduct(null);
                setProductForm({ title: '', description: '', price: '', category: 'قوارب', image_url: '⛵', stock: '' });
              }}
              className="bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700"
              data-testid="add-product-button"
            >
              + إضافة منتج
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">عنوان المنتج</label>
                      <input
                        type="text"
                        required
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        data-testid="product-title-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">الوصف</label>
                      <textarea
                        required
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        data-testid="product-description-input"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">السعر</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          data-testid="product-price-input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold mb-2">الكمية</label>
                        <input
                          type="number"
                          required
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          data-testid="product-stock-input"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">الفئة</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        data-testid="product-category-input"
                      >
                        <option value="قوارب">قوارب</option>
                        <option value="معدات صيد">معدات صيد</option>
                        <option value="غوص">غوص</option>
                        <option value="إكسسوارات">إكسسوارات</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">رمز المنتج (إيموجي)</label>
                      <input
                        type="text"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="⛵"
                        data-testid="product-icon-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700"
                      data-testid="save-product-button"
                    >
                      {editingProduct ? 'تحديث' : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                      data-testid="cancel-product-button"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden" data-testid={`seller-product-${product.id}`}>
                <div className="h-32 bg-gradient-to-br from-ocean-200 to-ocean-400 flex items-center justify-center">
                  <span className="text-5xl">{product.image_url || '📦'}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-ocean-600">${product.price}</span>
                    <span className="text-sm text-gray-500">مخزون: {product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-ocean-600 text-white py-2 rounded-lg text-sm hover:bg-ocean-700"
                      data-testid={`edit-${product.id}`}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
                      data-testid={`delete-${product.id}`}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="text-center text-gray-600 py-12">لا توجد منتجات. ابدأ بإضافة منتجك الأول!</p>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">طلباتي</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-md" data-testid={`order-${order.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">رقم الطلب: {order.id}</p>
                    <p className="text-sm text-gray-500">التاريخ: {new Date(order.created_at).toLocaleDateString('ar')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ocean-600">${order.total}</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {order.status === 'pending' ? 'قيد المعالجة' : order.status}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">المنتجات:</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{item.title} x{item.quantity}</span>
                      <span>${item.item_total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <p className="text-center text-gray-600 py-12">لا توجد طلبات</p>
          )}
        </div>
      )}
    </div>
  );
};

// Auth Pages
const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.detail || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-400 to-ocean-600 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800" data-testid="login-title">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="login-email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="login-password"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700 disabled:bg-gray-400"
            data-testid="login-submit"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-ocean-600 hover:underline font-semibold">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'buyer' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.detail || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-400 to-ocean-600 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800" data-testid="register-title">إنشاء حساب جديد</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="register-name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="register-email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="register-password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">نوع الحساب</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500"
                data-testid="register-role"
              >
                <option value="buyer">مشتري</option>
                <option value="seller">بائع</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-ocean-600 text-white py-3 rounded-lg font-semibold hover:bg-ocean-700 disabled:bg-gray-400"
            data-testid="register-submit"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          لديك حساب؟{' '}
          <Link to="/login" className="text-ocean-600 hover:underline font-semibold">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
