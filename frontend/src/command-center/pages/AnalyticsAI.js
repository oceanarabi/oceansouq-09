import React, { useState, useEffect } from 'react';

const AnalyticsAI = () => {
  const [activeTab, setActiveTab] = useState('prediction');
  const [salesPrediction, setSalesPrediction] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [abTests, setAbTests] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'prediction') {
        const res = await fetch(`${API_URL}/api/analytics-advanced/sales-prediction?period=7d`, { headers });
        setSalesPrediction(await res.json());
      } else if (activeTab === 'competitors') {
        const res = await fetch(`${API_URL}/api/analytics-advanced/competitor-analysis`, { headers });
        setCompetitors(await res.json());
      } else if (activeTab === 'marketing') {
        const res = await fetch(`${API_URL}/api/analytics-advanced/marketing/campaigns`, { headers });
        setCampaigns(await res.json());
      } else if (activeTab === 'abtests') {
        const res = await fetch(`${API_URL}/api/analytics-advanced/ab-tests`, { headers });
        setAbTests(await res.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'prediction', label: 'التنبؤ بالمبيعات', icon: '🔮' },
    { id: 'competitors', label: 'تحليل المنافسين', icon: '🎯' },
    { id: 'marketing', label: 'التسويق الذكي', icon: '📢' },
    { id: 'abtests', label: 'اختبارات A/B', icon: '🧪' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧠 التحليلات الذكية</h1>
        <p className="text-gray-400">تنبؤات وتحليلات مدعومة بالذكاء الاصطناعي</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Sales Prediction Tab */}
          {activeTab === 'prediction' && salesPrediction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-xl">
                  <div className="text-indigo-200 text-sm">إجمالي المتوقع</div>
                  <div className="text-2xl font-bold">{salesPrediction.summary?.total_predicted?.toLocaleString()} ر.س</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-xl">
                  <div className="text-blue-200 text-sm">متوسط يومي</div>
                  <div className="text-2xl font-bold">{salesPrediction.summary?.average_daily?.toLocaleString()} ر.س</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-teal-600 p-4 rounded-xl">
                  <div className="text-green-200 text-sm">يوم الذروة</div>
                  <div className="text-2xl font-bold">{salesPrediction.summary?.peak_day}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-4 rounded-xl">
                  <div className="text-yellow-200 text-sm">دقة النموذج</div>
                  <div className="text-2xl font-bold">{salesPrediction.summary?.model_accuracy}%</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">📈 توقعات الأيام القادمة</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4">
                    {salesPrediction.predictions?.slice(0, 7).map((p, idx) => (
                      <div key={idx} className={`flex-shrink-0 w-32 p-4 rounded-lg text-center ${p.is_weekend ? 'bg-purple-900/50' : 'bg-gray-700'}`}>
                        <div className="text-sm text-gray-400">{p.date}</div>
                        <div className="text-xl font-bold mt-2">{(p.predicted_sales / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(p.confidence_low / 1000).toFixed(0)}K - {(p.confidence_high / 1000).toFixed(0)}K
                        </div>
                        {p.is_weekend && <span className="text-xs text-purple-400">عطلة</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🎯 العوامل المؤثرة</h3>
                <div className="flex flex-wrap gap-4">
                  {salesPrediction.factors?.map((f, idx) => (
                    <div key={idx} className="bg-gray-700 p-3 rounded-lg">
                      <span className="text-gray-400">{f.name}:</span>
                      <span className={`mr-2 font-bold ${f.impact.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{f.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Competitors Tab */}
          {activeTab === 'competitors' && competitors && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🏆 موقعنا في السوق</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400">{competitors.our_position?.market_share}%</div>
                    <div className="text-gray-400">حصة السوق</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400">#{competitors.our_position?.rank}</div>
                    <div className="text-gray-400">الترتيب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400">{competitors.our_position?.growth}</div>
                    <div className="text-gray-400">النمو</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {competitors.competitors?.map((c, idx) => (
                  <div key={idx} className="bg-gray-800 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">{c.name}</h3>
                    <div className="text-3xl font-bold text-gray-400 mb-4">{c.market_share}%</div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-green-400">+</span> {c.strengths?.join('، ')}
                      </div>
                      <div className="text-sm">
                        <span className="text-red-400">-</span> {c.weaknesses?.join('، ')}
                      </div>
                    </div>

                    {c.recent_moves?.length > 0 && (
                      <div className="mt-4 p-2 bg-yellow-900/30 rounded text-xs text-yellow-400">
                        ⚠️ {c.recent_moves[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {competitors.price_alerts?.length > 0 && (
                <div className="bg-red-900/30 border border-red-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4">🚨 تنبيهات الأسعار</h3>
                  <div className="space-y-2">
                    {competitors.price_alerts.map((alert, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                        <span>{alert.product}</span>
                        <span className="text-gray-400">{alert.competitor}: {alert.their_price} ر.س</span>
                        <span className="text-red-400">نحن: {alert.our_price} ر.س ({alert.diff})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && campaigns && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-900 to-purple-900 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">ROI إجمالي</h2>
                    <p className="text-pink-200">إيرادات الحملات: {campaigns.total_revenue_from_campaigns?.toLocaleString()} ر.س</p>
                  </div>
                  <div className="text-4xl font-bold">{campaigns.total_roi}</div>
                </div>
              </div>

              <div className="space-y-4">
                {campaigns.campaigns?.map(campaign => (
                  <div key={campaign.id} className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{campaign.name}</h3>
                          {campaign.ai_generated && <span className="bg-purple-600 px-2 py-1 rounded text-xs">🤖 AI</span>}
                        </div>
                        <p className="text-gray-400">{campaign.target_segment}</p>
                      </div>
                      <span className={`px-3 py-1 rounded ${campaign.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {campaign.status === 'active' ? 'نشطة' : 'منتهية'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-gray-400 text-sm">مرسل</div>
                        <div className="font-bold">{campaign.performance?.sent?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">مفتوح</div>
                        <div className="font-bold">{campaign.performance?.opened?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">نقر</div>
                        <div className="font-bold">{campaign.performance?.clicked?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">تحويل</div>
                        <div className="font-bold text-green-400">{campaign.performance?.converted?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">إيراد</div>
                        <div className="font-bold text-green-400">{campaign.performance?.revenue?.toLocaleString()} ر.س</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* A/B Tests Tab */}
          {activeTab === 'abtests' && abTests && (
            <div className="space-y-6">
              {abTests.tests?.map(test => (
                <div key={test.id} className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{test.name}</h3>
                      <p className="text-gray-400">بدأ: {test.started}</p>
                    </div>
                    <span className={`px-3 py-1 rounded ${test.status === 'running' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {test.status === 'running' ? 'جاري' : 'مكتمل'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {test.variants?.map((variant, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${test.winner === variant.name.split(' ')[0] ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">{variant.name}</span>
                          {test.winner === variant.name.split(' ')[0] && <span className="text-green-400">🏆 الفائز</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="text-gray-400">زوار</div>
                            <div>{variant.visitors?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">تحويلات</div>
                            <div>{variant.conversions}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">معدل</div>
                            <div className="font-bold text-green-400">{variant.rate}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400">ثقة إحصائية: </span>
                      <span className={`font-bold ${test.confidence >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>{test.confidence}%</span>
                    </div>
                    <div className="text-sm text-blue-400">{test.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsAI;