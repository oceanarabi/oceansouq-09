import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AIAdvanced = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [fraudDashboard, setFraudDashboard] = useState(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [demandInsights, setDemandInsights] = useState(null);
  const [segmentOverview, setSegmentOverview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('iphone-15-pro');
  const [reviewText, setReviewText] = useState('');

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('commandToken');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai-advanced/recommendations/personalized`, {
        user_id: 'USR-001',
        current_page: 'homepage',
        cart_items: [],
        browsing_history: []
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchFraudDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/ai-advanced/fraud/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setFraudDashboard(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchSentimentAnalysis = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/ai-advanced/sentiment/reviews-analysis?period=30d`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSentimentAnalysis(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchDemandInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/ai-advanced/demand/insights`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setDemandInsights(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchSegmentOverview = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/ai-advanced/segmentation/overview`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSegmentOverview(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const analyzeText = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai-advanced/sentiment/analyze`, {
        text: reviewText,
        language: 'ar',
        context: 'review'
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      alert(`المشاعر: ${res.data.sentiment.label_ar} (${(res.data.sentiment.score * 100).toFixed(0)}%)`);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'recommendations') fetchRecommendations();
    if (activeTab === 'fraud') fetchFraudDashboard();
    if (activeTab === 'sentiment') fetchSentimentAnalysis();
    if (activeTab === 'demand') fetchDemandInsights();
    if (activeTab === 'segments') fetchSegmentOverview();
  }, [activeTab]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">🚀</span> محركات AI المتقدمة - المرحلة 3
        </h1>
        <p className="text-gray-500">محركات ذكاء اصطناعي متقدمة للتوصيات وكشف الاحتيال وتحليل المشاعر والتنبؤ بالطلب</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'recommendations', label: 'التوصيات الذكية', icon: '🎯' },
          { id: 'fraud', label: 'كشف الاحتيال', icon: '🛡️' },
          { id: 'sentiment', label: 'تحليل المشاعر', icon: '😊' },
          { id: 'demand', label: 'التنبؤ بالطلب', icon: '📈' },
          { id: 'segments', label: 'شرائح العملاء', icon: '👥' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && !loading && recommendations && (
        <div className="space-y-6">
          {/* User Profile */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">👤 ملف المستخدم المحلل</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-sm opacity-80">الشريحة</p>
                <p className="text-lg font-bold">{recommendations.user_profile?.user_segment}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-sm opacity-80">حساسية السعر</p>
                <p className="text-lg font-bold">{recommendations.user_profile?.price_sensitivity}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-sm opacity-80">متوسط الطلب</p>
                <p className="text-lg font-bold">{recommendations.user_profile?.avg_order_value} ر.س</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-sm opacity-80">درجة التخصيص</p>
                <p className="text-lg font-bold">{(recommendations.personalization_score * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.recommendations?.map((section, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{section.title}</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {section.products?.map((product, pidx) => (
                  <div key={pidx} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition">
                    <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg mb-3 flex items-center justify-center text-4xl">📦</div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{product.name}</p>
                    <p className="text-purple-600 font-bold">{product.price} ر.س</p>
                    {product.match_score && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">تطابق {(product.match_score * 100).toFixed(0)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Algorithms Used */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🧠 الخوارزميات المستخدمة</h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.algorithms_used?.map((algo, idx) => (
                <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-sm">{algo}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fraud Tab */}
      {activeTab === 'fraud' && !loading && fraudDashboard && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <p className="text-green-100 text-sm">معاملات محللة (24س)</p>
              <p className="text-3xl font-bold mt-1">{fraudDashboard.overview?.transactions_analyzed_24h?.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
              <p className="text-yellow-100 text-sm">مشبوهة</p>
              <p className="text-3xl font-bold mt-1">{fraudDashboard.overview?.flagged}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <p className="text-red-100 text-sm">محظورة</p>
              <p className="text-3xl font-bold mt-1">{fraudDashboard.overview?.blocked}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <p className="text-blue-100 text-sm">خسائر تم منعها (الشهر)</p>
              <p className="text-3xl font-bold mt-1">{fraudDashboard.prevented_losses?.this_month?.toLocaleString()} <span className="text-lg">ر.س</span></p>
            </div>
          </div>

          {/* Fraud Types */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 أنواع الاحتيال المكتشفة</h3>
            <div className="space-y-4">
              {fraudDashboard.fraud_types?.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">{type.type}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${type.percentage}%` }}></div>
                    </div>
                    <span className="text-sm font-bold w-12">{type.percentage}%</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${type.trend === 'up' ? 'bg-red-100 text-red-700' : type.trend === 'down' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {type.trend === 'up' ? '↑' : type.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎯 أداء النموذج</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{fraudDashboard.model_performance?.accuracy}%</p>
                <p className="text-sm text-gray-500">الدقة</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{fraudDashboard.model_performance?.precision}%</p>
                <p className="text-sm text-gray-500">Precision</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-3xl font-bold text-purple-600">{fraudDashboard.model_performance?.recall}%</p>
                <p className="text-sm text-gray-500">Recall</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600">{fraudDashboard.model_performance?.f1_score}%</p>
                <p className="text-sm text-gray-500">F1 Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Tab */}
      {activeTab === 'sentiment' && !loading && (
        <div className="space-y-6">
          {/* Text Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">✍️ تحليل نص جديد</h3>
            <div className="flex gap-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="اكتب نص المراجعة هنا..."
                className="flex-1 p-4 border rounded-xl bg-gray-50 dark:bg-gray-700 resize-none h-24"
              />
              <button onClick={analyzeText} className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 h-fit">تحليل</button>
            </div>
          </div>

          {sentimentAnalysis && (
            <>
              {/* Distribution */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
                  <p className="text-5xl font-bold">{sentimentAnalysis.sentiment_distribution?.positive}%</p>
                  <p className="text-green-100">إيجابي 😊</p>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white text-center">
                  <p className="text-5xl font-bold">{sentimentAnalysis.sentiment_distribution?.neutral}%</p>
                  <p className="text-gray-100">محايد 😐</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white text-center">
                  <p className="text-5xl font-bold">{sentimentAnalysis.sentiment_distribution?.negative}%</p>
                  <p className="text-red-100">سلبي 😞</p>
                </div>
              </div>

              {/* Aspects */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">👍 أكثر الجوانب إيجابية</h3>
                  <div className="space-y-3">
                    {sentimentAnalysis.top_positive_aspects?.map((aspect, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <span className="font-medium">{aspect.aspect}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{aspect.mentions} ذكر</span>
                          <span className="font-bold text-green-600">+{(aspect.sentiment * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">👎 أكثر الجوانب سلبية</h3>
                  <div className="space-y-3">
                    {sentimentAnalysis.top_negative_aspects?.map((aspect, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <span className="font-medium">{aspect.aspect}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{aspect.mentions} ذكر</span>
                          <span className="font-bold text-red-600">{(aspect.sentiment * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚡ إجراءات مطلوبة</h3>
                <div className="space-y-3">
                  {sentimentAnalysis.action_items?.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-r-4 ${item.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'}`}>
                      <p className="font-bold text-gray-800 dark:text-white">{item.issue}</p>
                      <p className="text-sm text-gray-500 mt-1">💡 {item.suggested_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Demand Tab */}
      {activeTab === 'demand' && !loading && demandInsights && (
        <div className="space-y-6">
          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🔮 رؤى الطلب والمخزون</h3>
            <div className="space-y-4">
              {demandInsights.insights?.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-r-4 ${insight.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : insight.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${insight.type === 'stockout_risk' ? 'bg-red-500 text-white' : insight.type === 'overstock' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {insight.type === 'stockout_risk' ? '⚠️ خطر نفاد' : insight.type === 'overstock' ? '📦 فائض مخزون' : '📈 ارتفاع الطلب'}
                      </span>
                      <p className="font-bold text-gray-800 dark:text-white mt-2">{insight.product}</p>
                      {insight.days_until_stockout && <p className="text-red-600 font-bold">ينفد خلال {insight.days_until_stockout} أيام!</p>}
                      {insight.demand_change && <p className="text-blue-600 font-bold">تغير الطلب: {insight.demand_change}</p>}
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Forecasts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 توقعات الفئات</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {demandInsights.category_forecasts?.map((cat, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="font-bold text-gray-800 dark:text-white">{cat.category}</p>
                  <p className="text-2xl font-bold text-green-600">{cat.growth}</p>
                  <p className="text-sm text-gray-500">الأعلى: {cat.top_product}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🗓️ المناسبات الموسمية القادمة</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {demandInsights.seasonal_events?.map((event, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
                  <p className="font-bold text-xl">{event.event}</p>
                  <p className="text-purple-100">يبدأ خلال {event.starts_in}</p>
                  <p className="text-2xl font-bold mt-2">{event.expected_impact}</p>
                  <p className="text-sm text-purple-100">تأثير متوقع</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && !loading && segmentOverview && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">👥 إجمالي العملاء: {segmentOverview.total_customers?.toLocaleString()}</h2>
          </div>

          {/* Segments */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {segmentOverview.segments?.map((segment, idx) => (
              <div key={idx} className={`rounded-2xl p-6 ${segment.name === 'VIP' ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : segment.name === 'Churned' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                <h3 className={`text-lg font-bold ${segment.name === 'VIP' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{segment.name_ar}</h3>
                <p className="text-3xl font-bold mt-2">{segment.count?.toLocaleString()}</p>
                <p className={`text-sm ${segment.name === 'VIP' ? 'text-yellow-100' : 'text-gray-500'}`}>{segment.percentage}% من العملاء</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span>حصة الإيرادات</span>
                    <span className="font-bold">{segment.revenue_share}%</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>متوسط LTV</span>
                    <span className="font-bold">{segment.avg_ltv?.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Migration Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📈 حركة العملاء بين الشرائح</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600">+{segmentOverview.migration_trends?.potential_to_loyal}</p>
                <p className="text-sm text-gray-500">محتمل ← مخلص</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-yellow-600">+{segmentOverview.migration_trends?.loyal_to_vip}</p>
                <p className="text-sm text-gray-500">مخلص ← VIP</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-600">-{segmentOverview.migration_trends?.at_risk_to_churned}</p>
                <p className="text-sm text-gray-500">معرض ← مفقود</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚡ إجراءات مقترحة</h3>
            <div className="space-y-3">
              {segmentOverview.actions?.map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div>
                    <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs">{action.segment}</span>
                    <p className="font-medium mt-2 text-gray-800 dark:text-white">{action.action}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">إيراد محتمل</p>
                    <p className="text-xl font-bold text-green-600">{action.potential_revenue?.toLocaleString()} ر.س</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvanced;
