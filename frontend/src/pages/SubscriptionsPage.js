import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const SubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [mySubscription, setMySubscription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const plansRes = await axios.get(`${API_URL}/api/subscriptions/plans`);
      setPlans(plansRes.data || []);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const subRes = await axios.get(`${API_URL}/api/subscriptions/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMySubscription(subRes.data);
        } catch {}
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleSubscribe = async (plan) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/subscriptions');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/subscriptions/subscribe`, {
        subscription_id: plan.id,
        billing_cycle: billingCycle,
        payment_method: 'card'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`تم الاشتراك في ${plan.name_ar} بنجاح!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-bounce text-6xl">⭐</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">⭐ اشتراكات Ocean</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            وفر أكثر مع اشتراكاتنا الحصرية واستمتع بمزايا لا تُضاهى
          </p>
        </div>
      </div>

      {/* Current Subscription */}
      {mySubscription && (
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div>
                <h3 className="font-bold text-lg">اشتراكك الحالي: {mySubscription.plan_name}</h3>
                <p className="text-white/80">
                  ينتهي في: {new Date(mySubscription.end_date).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full font-medium transition
              ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2
              ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            سنوي
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">وفر 30%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const isPopular = idx === 1;
            
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl relative
                  ${isPopular ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name_ar}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-indigo-600">{price}</span>
                  <span className="text-gray-500"> ر.س/{billingCycle === 'yearly' ? 'سنة' : 'شهر'}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.benefits?.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={mySubscription?.plan_id === plan.id}
                  className={`w-full py-3 rounded-xl font-bold transition
                    ${mySubscription?.plan_id === plan.id 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isPopular 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}`}
                >
                  {mySubscription?.plan_id === plan.id ? 'اشتراكك الحالي' : 'اشترك الآن'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            لماذا تشترك في Ocean؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '🚚', title: 'توصيل مجاني', desc: 'توصيل غير محدود لجميع طلباتك' },
              { icon: '💰', title: 'خصومات حصرية', desc: 'خصم على جميع الخدمات' },
              { icon: '⚡', title: 'أولوية الخدمة', desc: 'خدمة عملاء VIP' },
              { icon: '🎁', title: 'عروض خاصة', desc: 'عروض حصرية للمشتركين' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <span className="text-4xl block mb-3">{feature.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
