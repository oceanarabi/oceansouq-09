import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const getTranslation = (lang, key) => {
  const translations = {
    en: { login: 'Login', shopNow: 'Shop Now' },
    ar: { login: 'تسجيل الدخول', shopNow: 'تسوق الآن' }
  };
  return translations[lang]?.[key] || key;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const t = (key) => getTranslation(language, key);
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [pageLoading, setPageLoading] = useState(true);

  const fetchCart = async () => {
    if (!token) { setPageLoading(false); return; }
    try {
      const [userRes, cartRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(userRes.data);
      setCart(cartRes.data);
    } catch (err) { console.error(err); }
    finally { setPageLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [token]);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price
        })),
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      };

      const res = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrderId(res.data.order_id);
      setOrderComplete(true);
      
      // Clear cart
      await fetchCart();
      
      // Add loyalty points
      const pointsToAdd = Math.floor(total * 10);
      await axios.post(`${API_URL}/api/loyalty/add-points?points_to_add=${pointsToAdd}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error(err));

    } catch (error) {
      alert(error.response?.data?.detail || 'Error placing order');
    } finally {
      setLoading(false);
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
          <button onClick={() => navigate('/login')} className="bg-ocean-600 text-white px-8 py-3 rounded-xl font-semibold">
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-6 block">🛒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'سلة التسوق فارغة' : 'Your Cart is Empty'}
          </h2>
          <button onClick={() => navigate('/products')} className="bg-ocean-600 text-white px-8 py-3 rounded-xl font-semibold">
            {t('shopNow')}
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'تم الطلب بنجاح!' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar' ? 'شكراً لك على طلبك' : 'Thank you for your order'}
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">{language === 'ar' ? 'رقم الطلب' : 'Order Number'}</p>
            <p className="text-lg font-bold text-ocean-600">#{orderId}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {language === 'ar' 
              ? 'ستصلك رسالة تأكيد على بريدك الإلكتروني' 
              : 'A confirmation email will be sent to your email address'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/account')} className="flex-1 bg-ocean-600 text-white py-3 rounded-xl font-semibold">
              {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            </button>
            <button onClick={() => navigate('/products')} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-semibold">
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
      </h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-ocean-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-ocean-600 text-white' : 'bg-gray-200'}`}>1</div>
          <span className="ml-2 hidden sm:block font-medium">{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
        </div>
        <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-ocean-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-ocean-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-ocean-600 text-white' : 'bg-gray-200'}`}>2</div>
          <span className="ml-2 hidden sm:block font-medium">{language === 'ar' ? 'الدفع' : 'Payment'}</span>
        </div>
        <div className={`w-16 h-1 mx-2 ${step >= 3 ? 'bg-ocean-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-ocean-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-ocean-600 text-white' : 'bg-gray-200'}`}>3</div>
          <span className="ml-2 hidden sm:block font-medium">{language === 'ar' ? 'تأكيد' : 'Confirm'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    placeholder="+966 5XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'العنوان' : 'Address'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'المدينة' : 'City'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الدولة' : 'Country'}
                    </label>
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="Saudi Arabia">{language === 'ar' ? 'السعودية' : 'Saudi Arabia'}</option>
                      <option value="UAE">{language === 'ar' ? 'الإمارات' : 'UAE'}</option>
                      <option value="Kuwait">{language === 'ar' ? 'الكويت' : 'Kuwait'}</option>
                      <option value="Bahrain">{language === 'ar' ? 'البحرين' : 'Bahrain'}</option>
                      <option value="Oman">{language === 'ar' ? 'عمان' : 'Oman'}</option>
                      <option value="Qatar">{language === 'ar' ? 'قطر' : 'Qatar'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-6 bg-ocean-600 hover:bg-ocean-700 text-white py-4 rounded-xl font-semibold text-lg transition"
                >
                  {language === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </h2>
              <div className="space-y-4">
                {/* Payment Options */}
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'card' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <span className="text-2xl mr-3">💳</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, Mada</p>
                  </div>
                  {paymentMethod === 'card' && <span className="text-ocean-600 text-xl">✓</span>}
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'apple_pay' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="payment" value="apple_pay" checked={paymentMethod === 'apple_pay'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <span className="text-2xl mr-3">🍎</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Apple Pay</p>
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'دفع سريع وآمن' : 'Fast & secure payment'}</p>
                  </div>
                  {paymentMethod === 'apple_pay' && <span className="text-ocean-600 text-xl">✓</span>}
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <span className="text-2xl mr-3">💵</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</p>
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'رسوم إضافية $5' : 'Additional $5 fee'}</p>
                  </div>
                  {paymentMethod === 'cod' && <span className="text-ocean-600 text-xl">✓</span>}
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${paymentMethod === 'tabby' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="payment" value="tabby" checked={paymentMethod === 'tabby'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <span className="text-2xl mr-3">📅</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Tabby - {language === 'ar' ? 'تقسيط' : 'Pay in 4'}</p>
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'قسّم المبلغ على 4 دفعات' : 'Split into 4 payments'}</p>
                  </div>
                  {paymentMethod === 'tabby' && <span className="text-ocean-600 text-xl">✓</span>}
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-4 rounded-xl font-semibold"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white py-4 rounded-xl font-semibold transition"
                >
                  {language === 'ar' ? 'مراجعة الطلب' : 'Review Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'ar' ? 'مراجعة الطلب' : 'Review Your Order'}
              </h2>
              
              {/* Shipping Details */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{shippingInfo.fullName}</p>
                <p className="text-gray-600 dark:text-gray-300">{shippingInfo.address}</p>
                <p className="text-gray-600 dark:text-gray-300">{shippingInfo.city}, {shippingInfo.country}</p>
                <p className="text-gray-600 dark:text-gray-300">{shippingInfo.phone}</p>
              </div>

              {/* Payment Method */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {paymentMethod === 'card' && '💳 Credit Card'}
                  {paymentMethod === 'apple_pay' && '🍎 Apple Pay'}
                  {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                  {paymentMethod === 'tabby' && '📅 Tabby - Pay in 4'}
                </p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'ar' ? 'المنتجات' : 'Items'} ({cart.items.length})
                </h3>
                <div className="space-y-3">
                  {cart.items.map(item => (
                    <div key={item.product_id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <img src={item.product?.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.product?.title}</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-ocean-600">${(item.product?.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-4 rounded-xl font-semibold"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loading-spinner"></span>
                      {language === 'ar' ? 'جاري الطلب...' : 'Processing...'}
                    </span>
                  ) : (
                    language === 'ar' ? 'تأكيد الطلب' : 'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3 mb-6">
              {cart.items.slice(0, 3).map(item => (
                <div key={item.product_id} className="flex items-center gap-2">
                  <img src={item.product?.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.title}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-ocean-600">${(item.product?.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-sm text-gray-500 text-center">+{cart.items.length - 3} {language === 'ar' ? 'منتجات أخرى' : 'more items'}</p>
              )}
            </div>

            <div className="space-y-3 border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                <span>{shipping === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{language === 'ar' ? 'الضريبة (15%)' : 'Tax (15%)'}</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{language === 'ar' ? 'رسوم الدفع عند الاستلام' : 'COD Fee'}</span>
                  <span>$5.00</span>
                </div>
              )}
              <div className="border-t dark:border-gray-700 pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-ocean-600">${(total + (paymentMethod === 'cod' ? 5 : 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
