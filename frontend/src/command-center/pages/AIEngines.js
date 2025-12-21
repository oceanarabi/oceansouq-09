import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AIEngines = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [engines, setEngines] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [competitorPrices, setCompetitorPrices] = useState(null);
  const [pricingAlerts, setPricingAlerts] = useState([]);
  const [autoRules, setAutoRules] = useState([]);
  const [seoLanguages, setSeoLanguages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('iphone-15-pro');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [enginesRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/ai-engines/list`, { headers }),
        axios.get(`${API_URL}/api/ai-engines/dashboard`, { headers })
      ]);
      
      setEngines(enginesRes.data.engines || []);
      setDashboard(dashRes.data || {});
    } catch (err) {
      // Demo data
      setEngines([
        { id: 'pricing_optimizer', name: 'محسّن الأسعار', icon: '💰', status: 'active', accuracy: 94.5, requests_today: 15420 },
        { id: 'seo_optimizer', name: 'محسّن SEO', icon: '🔍', status: 'active', accuracy: 89.2, requests_today: 8750 },
        { id: 'recommendation_engine', name: 'محرك التوصيات', icon: '🎯', status: 'active', accuracy: 91.8, requests_today: 45200 },
        { id: 'fraud_detector', name: 'كاشف الاحتيال', icon: '🛡️', status: 'active', accuracy: 97.3, requests_today: 28900 },
        { id: 'demand_forecaster', name: 'متنبئ الطلب', icon: '📈', status: 'active', accuracy: 86.4, requests_today: 3200 },
        { id: 'sentiment_analyzer', name: 'محلل المشاعر', icon: '😊', status: 'active', accuracy: 88.7, requests_today: 12500 },
        { id: 'image_classifier', name: 'مصنف الصور', icon: '🖼️', status: 'active', accuracy: 93.1, requests_today: 6800 },
        { id: 'chatbot_engine', name: 'محرك الدردشة', icon: '🤖', status: 'active', accuracy: 90.5, requests_today: 18700 },
      ]);
      setDashboard({
        overview: { total_requests_today: 139470, avg_accuracy: 91.4, active_engines: 8, cost_saved_today: 45000 },
        engines_status: [
          { engine: 'التوصيات', status: 'healthy', load: 65 },
          { engine: 'كشف الاحتيال', status: 'healthy', load: 42 },
        ],
        recent_insights: [
          { type: 'opportunity', message: '45 منتج يمكن زيادة سعره بنسبة 10%', impact: 'high' },
          { type: 'success', message: 'التوصيات حققت 125K ريال اليوم', impact: 'high' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === 'healthy') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">🧠</span> محركات الذكاء الاصطناعي
        </h1>
        <p className="text-gray-500">إدارة ومراقبة جميع محركات AI المتقدمة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">طلبات اليوم</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.total_requests_today || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">متوسط الدقة</p>
          <p className="text-3xl font-bold mt-1">{dashboard.overview?.avg_accuracy || 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">محركات نشطة</p>
          <p className="text-3xl font-bold mt-1">{dashboard.overview?.active_engines || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm">وفر اليوم</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.cost_saved_today || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'dashboard', label: 'نظرة عامة', icon: '📊' },
          { id: 'engines', label: 'المحركات', icon: '⚙️' },
          { id: 'pricing', label: 'تحسين الأسعار', icon: '💰' },
          { id: 'seo', label: 'تحسين SEO', icon: '🔍' },
          { id: 'fraud', label: 'كشف الاحتيال', icon: '🛡️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${activeTab === tab.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">💡 رؤى ذكية</h2>
            <div className="space-y-3">
              {dashboard.recent_insights?.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl ${insight.type === 'opportunity' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-r-4 border-yellow-500' : insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500' : 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500'}`}>
                  <p className="text-gray-800 dark:text-white">{insight.message}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${insight.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    تأثير {insight.impact === 'high' ? 'عالي' : 'متوسط'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">⚡ حالة المحركات</h2>
            <div className="space-y-4">
              {engines.slice(0, 5).map((engine) => (
                <div key={engine.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{engine.icon}</span>
                    <span className="font-medium text-gray-800 dark:text-white">{engine.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${engine.accuracy}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{engine.accuracy}%</span>
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(engine.status)}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engines' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engines.map((engine) => (
            <div key={engine.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer" onClick={() => setSelectedEngine(engine)}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{engine.icon}</span>
                <span className={`w-3 h-3 rounded-full ${getStatusColor(engine.status)}`}></span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{engine.name}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">الدقة</span>
                  <span className="font-bold text-green-600">{engine.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">طلبات اليوم</span>
                  <span className="font-bold text-gray-800 dark:text-white">{engine.requests_today?.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">إدارة</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">💰 تحسين الأسعار بالذكاء الاصطناعي</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-green-600 text-sm">منتجات يُنصح بزيادة سعرها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">45</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <p className="text-red-600 text-sm">منتجات يُنصح بتخفيض سعرها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">23</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-blue-600 text-sm">الزيادة المحتملة في الإيرادات</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">+12%</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'iPhone 15 Pro', current: 4999, suggested: 4799, action: 'reduce', potential: 12 },
              { name: 'Samsung Galaxy S24', current: 3499, suggested: 3699, action: 'increase', potential: 8 },
              { name: 'AirPods Pro', current: 999, suggested: 949, action: 'reduce', potential: 15 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-500">الحالي: {product.current} ر.س</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">المقترح</p>
                    <p className={`font-bold ${product.action === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {product.suggested} ر.س
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${product.action === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.action === 'increase' ? '↑ زيادة' : '↓ تخفيض'}
                  </span>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">تطبيق</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🔍 تحسين SEO بالذكاء الاصطناعي</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
              <p className="text-5xl font-bold text-indigo-600">72</p>
              <p className="text-sm text-gray-600">درجة SEO الحالية</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600">مشاكل حرجة</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">12</p>
              <p className="text-sm text-gray-600">تحذيرات</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">25</p>
              <p className="text-sm text-gray-600">ملاحظات</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-r-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">45 صفحة بدون meta description</p>
                  <p className="text-sm text-gray-500">تأثير عالي على الترتيب</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">إصلاح تلقائي</button>
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-r-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">128 صورة بدون alt text</p>
                  <p className="text-sm text-gray-500">يؤثر على الوصولية وSEO</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">إصلاح تلقائي</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🛡️ كشف الاحتيال بالذكاء الاصطناعي</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-green-600 text-sm">معاملات تم تحليلها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">15,420</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <p className="text-yellow-600 text-sm">مشبوهة</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">45</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <p className="text-red-600 text-sm">تم حظرها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">12</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-blue-600 text-sm">خسائر تم منعها</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">125K ر.س</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { type: 'بطاقات مسروقة', count: 23, trend: 'up' },
              { type: 'حسابات مزيفة', count: 15, trend: 'down' },
              { type: 'استرداد احتيالي', count: 8, trend: 'stable' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="font-medium text-gray-800 dark:text-white">{item.type}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-800 dark:text-white">{item.count}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${item.trend === 'up' ? 'bg-red-100 text-red-700' : item.trend === 'down' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEngines;
