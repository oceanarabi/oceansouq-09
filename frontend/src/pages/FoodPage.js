import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Food Home Page
export const FoodPage = () => {
  const [cuisines, setCuisines] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cuisinesRes, restaurantsRes] = await Promise.all([
        axios.get(`${API_URL}/api/food/cuisines`),
        axios.get(`${API_URL}/api/food/restaurants`)
      ]);
      setCuisines(cuisinesRes.data || []);
      setRestaurants(restaurantsRes.data || []);
      setFeaturedRestaurants((restaurantsRes.data || []).filter(r => r.is_featured));
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/food/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🍔</div>
          <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل المطاعم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">اطلب طعامك المفضل</h1>
            <p className="text-lg text-white/90 mb-8">
              اكتشف أفضل المطاعم والمقاهي بالقرب منك
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مطعم أو نوع طعام..."
                className="w-full px-6 py-4 pr-14 rounded-full text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button 
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition"
              >
                🔍
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cuisines */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">تصفح حسب النوع</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {cuisines.map((cuisine) => (
            <Link
              key={cuisine.id}
              to={`/food/cuisine/${cuisine.id}`}
              className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-4 text-center min-w-[100px] hover:shadow-lg transition group"
            >
              <span className="text-4xl block mb-2 group-hover:scale-110 transition">{cuisine.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cuisine.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Restaurants */}
      {featuredRestaurants.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">مطاعم مميزة ⭐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}

      {/* All Restaurants */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">جميع المطاعم</h2>
        {restaurants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <span className="text-6xl block mb-4">🍽️</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد مطاعم حالياً</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              كن أول من يسجل مطعمه على المنصة!
            </p>
            <Link 
              to="/join/restaurant"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              سجل مطعمك الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      {/* CTA for Restaurants */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-12 mt-8">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">هل لديك مطعم؟</h2>
          <p className="mb-6 text-white/90">انضم إلى منصتنا وابدأ في استقبال الطلبات</p>
          <Link 
            to="/join/restaurant"
            className="inline-block bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition"
          >
            سجل مطعمك مجاناً
          </Link>
        </div>
      </div>
    </div>
  );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group"
    >
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
        {restaurant.cover_image ? (
          <img 
            src={restaurant.cover_image} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
        {restaurant.is_featured && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
            ⭐ مميز
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
          {restaurant.name_ar || restaurant.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {restaurant.description?.substring(0, 60) || 'مطعم متميز'}...
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-yellow-500">
            <span>⭐</span>
            <span className="font-semibold">{restaurant.rating || 'جديد'}</span>
            {restaurant.review_count > 0 && (
              <span className="text-gray-400">({restaurant.review_count})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span>🕐 {restaurant.delivery_time || '30-45 د'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <span>🚚 توصيل: {restaurant.delivery_fee || 0} ر.س</span>
          <span>الحد الأدنى: {restaurant.min_order || 0} ر.س</span>
        </div>
      </div>
    </div>
  );
};

// Restaurant Detail Page
export const RestaurantDetailPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/food/restaurants/${restaurantId}`);
      setRestaurant(res.data);
      const categories = Object.keys(res.data.menu || {});
      if (categories.length > 0) setSelectedCategory(categories[0]);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    }
    setLoading(false);
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find(c => c.id === itemId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.id === itemId ? {...c, quantity: c.quantity - 1} : c));
    } else {
      setCart(cart.filter(c => c.id !== itemId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin text-6xl">🍕</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😔</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">المطعم غير موجود</h2>
          <Link to="/food" className="text-orange-500 hover:underline mt-4 block">
            العودة للمطاعم
          </Link>
        </div>
      </div>
    );
  }

  const menuCategories = Object.keys(restaurant.menu || {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Cover Image */}
      <div className="h-64 bg-gradient-to-br from-orange-200 to-red-200 dark:from-gray-700 dark:to-gray-600 relative">
        {restaurant.cover_image && (
          <img src={restaurant.cover_image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button 
          onClick={() => navigate('/food')}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full"
        >
          ➡️
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : '🍽️'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {restaurant.name_ar || restaurant.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {restaurant.description || 'مطعم متميز يقدم أشهى المأكولات'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-yellow-500">
                  ⭐ {restaurant.rating || 'جديد'}
                </span>
                <span className="text-gray-500">🕐 {restaurant.delivery_time}</span>
                <span className="text-gray-500">🚚 {restaurant.delivery_fee} ر.س توصيل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Items */}
          <div className="flex-1">
            {/* Category Tabs */}
            {menuCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                {menuCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                      ${selectedCategory === category 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Items */}
            {menuCategories.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
                <span className="text-5xl block mb-4">📋</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">القائمة فارغة</h3>
                <p className="text-gray-500">لم يتم إضافة أصناف بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(restaurant.menu[selectedCategory] || []).map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 flex gap-4">
                    <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {item.name_ar || item.name}
                        {item.is_popular && <span className="text-orange-500 text-xs mr-2">🔥 الأكثر طلباً</span>}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.description?.substring(0, 80)}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-orange-500">{item.price} ر.س</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          + أضف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🛒 سلة الطلب</h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🛒</span>
                  <p>السلة فارغة</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name_ar || item.name}</p>
                          <p className="text-xs text-gray-500">{item.price} ر.س × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 bg-orange-500 text-white rounded-full text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-500">المجموع الفرعي</span>
                      <span>{cartTotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm">
                      <span className="text-gray-500">رسوم التوصيل</span>
                      <span>{restaurant.delivery_fee || 0} ر.س</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>الإجمالي</span>
                      <span className="text-orange-500">{(cartTotal + (restaurant.delivery_fee || 0)).toFixed(2)} ر.س</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        localStorage.setItem('foodCart', JSON.stringify({
                          restaurant_id: restaurant.id,
                          restaurant_name: restaurant.name,
                          items: cart,
                          delivery_fee: restaurant.delivery_fee || 0
                        }));
                        navigate('/food/checkout');
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition"
                    >
                      إتمام الطلب
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Food Checkout Page
export const FoodCheckoutPage = () => {
  const [cartData, setCartData] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('foodCart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    } else {
      navigate('/food');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/food/checkout');
      return;
    }

    try {
      const orderData = {
        restaurant_id: cartData.restaurant_id,
        items: cartData.items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          special_instructions: ''
        })),
        delivery_address: address,
        payment_method: paymentMethod,
        notes: notes
      };

      const res = await axios.post(`${API_URL}/api/food/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem('foodCart');
      navigate(`/food/order/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'حدث خطأ أثناء إنشاء الطلب');
    }
    setLoading(false);
  };

  if (!cartData) return null;

  const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + cartData.delivery_fee;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إتمام الطلب</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4">
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 p-4 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    عنوان التوصيل *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    placeholder="المدينة، الحي، الشارع، رقم المبنى..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    رقم الجوال *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    طريقة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'cash', label: '💵 نقداً عند الاستلام' },
                      { id: 'card', label: '💳 بطاقة ائتمان' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition
                          ${paymentMethod === method.id 
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'}`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    placeholder="أي تعليمات خاصة للسائق أو المطعم..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition"
                >
                  {loading ? 'جارٍ إنشاء الطلب...' : `تأكيد الطلب (${total.toFixed(2)} ر.س)`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">ملخص الطلب</h3>
                <p className="text-sm text-gray-500 mb-4">من: {cartData.restaurant_name}</p>
                
                <div className="space-y-2 border-b dark:border-gray-700 pb-4 mb-4">
                  {cartData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.name_ar || item.name}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">المجموع الفرعي</span>
                    <span>{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">رسوم التوصيل</span>
                    <span>{cartData.delivery_fee} ر.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
                    <span>الإجمالي</span>
                    <span className="text-orange-500">{total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPage;
