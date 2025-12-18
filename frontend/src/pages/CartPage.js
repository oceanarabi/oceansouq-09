import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, useLanguage, useAuth } from '../contexts';

const CartPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, newQuantity);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-6 block">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please Log In'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'يجب تسجيل الدخول لعرض سلة التسوق' : 'You need to log in to view your cart'}
          </p>
          <Link to="/login" className="inline-block bg-ocean-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-ocean-700">
            {t('login')}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <span className="text-6xl mb-6 block">🛒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'سلة التسوق فارغة' : 'Your Cart is Empty'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'ابدأ بإضافة منتجات لسلة التسوق' : 'Start adding products to your cart'}
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
        {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
        <span className="text-lg font-normal text-gray-500 ml-2">({cart.items.length} {language === 'ar' ? 'منتج' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.product_id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 md:p-6">
              <div className="flex gap-4">
                {/* Product Image */}
                <div
                  onClick={() => navigate(`/products/${item.product_id}`)}
                  className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 cursor-pointer"
                >
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/products/${item.product_id}`)}
                    className="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-2 cursor-pointer hover:text-ocean-600"
                  >
                    {item.product?.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{item.product?.category}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                        className="px-3 py-1 text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        className="px-3 py-1 text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg md:text-xl font-bold text-ocean-600">
                        ${(item.product?.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">${item.product?.price} × {item.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-700 p-2 self-start"
                  title={language === 'ar' ? 'حذف' : 'Remove'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-4">
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
              
              {shipping > 0 && (
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  {language === 'ar' 
                    ? `أضف $${(50 - subtotal).toFixed(2)} للحصول على شحن مجاني!` 
                    : `Add $${(50 - subtotal).toFixed(2)} more for free shipping!`}
                </p>
              )}

              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-ocean-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 bg-ocean-600 hover:bg-ocean-700 text-white py-4 rounded-xl font-semibold text-lg transition"
            >
              {language === 'ar' ? 'المتابعة للدفع' : 'Proceed to Checkout'}
            </button>

            <button
              onClick={() => navigate('/products')}
              className="w-full mt-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-xl font-medium transition"
            >
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <span title="Secure Payment">🔒</span>
                <span title="Fast Delivery">🚚</span>
                <span title="Money Back Guarantee">💰</span>
                <span title="24/7 Support">📞</span>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                {language === 'ar' ? 'دفع آمن ومشفر' : 'Secure & encrypted payment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
