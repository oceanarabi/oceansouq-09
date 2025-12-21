import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PaymentGateways = () => {
  const [activeTab, setActiveTab] = useState('configured');
  const [catalog, setCatalog] = useState([]);
  const [configured, setConfigured] = useState([]);
  const [routingRules, setRoutingRules] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [catalogRes, configuredRes, rulesRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/payment-gateways/catalog`, { headers }),
        axios.get(`${API_URL}/api/payment-gateways/configured`, { headers }),
        axios.get(`${API_URL}/api/payment-gateways/routing-rules`, { headers }),
        axios.get(`${API_URL}/api/payment-gateways/dashboard`, { headers })
      ]);
      
      setCatalog(catalogRes.data.gateways || []);
      setConfigured(configuredRes.data.gateways || []);
      setRoutingRules(rulesRes.data.rules || []);
      setDashboard(dashRes.data || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRegionLabel = (region) => {
    const labels = {
      saudi: '🇸🇦 السعودية',
      gulf: '🏝️ الخليج',
      egypt: '🇪🇬 مصر',
      international: '🌐 دولي',
      india: '🇮🇳 الهند',
      china: '🇨🇳 الصين',
      southeast_asia: '🌏 جنوب شرق آسيا',
      europe: '🇪🇺 أوروبا',
      usa: '🇺🇸 أمريكا',
      global: '🌍 عالمي'
    };
    return labels[region] || region;
  };

  const getTypeLabel = (type) => {
    const labels = {
      cards: '💳 بطاقات',
      wallet: '📱 محافظ',
      bnpl: '⏰ اشترِ الآن ادفع لاحقاً',
      aggregator: '🔗 مجمّع',
      crypto: '₿ عملات رقمية',
      pos: '🏪 نقاط بيع'
    };
    return labels[type] || type;
  };

  const filteredCatalog = catalog.filter(gw => {
    if (selectedRegion !== 'all' && gw.region !== selectedRegion) return false;
    if (selectedType !== 'all' && gw.type !== selectedType) return false;
    return true;
  });

  const isConfigured = (gatewayId) => {
    return configured.some(c => c.id === gatewayId);
  };

  const testGateway = async (gatewayId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const res = await axios.post(`${API_URL}/api/payment-gateways/test/${gatewayId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.success ? '✅ الاتصال ناجح!' : '❌ فشل الاتصال');
    } catch (err) {
      alert('❌ خطأ في الاختبار');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">💳</span> بوابات الدفع العالمية
        </h1>
        <p className="text-gray-500">إدارة وتكوين جميع بوابات الدفع المحلية والدولية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">بوابات نشطة</p>
          <p className="text-3xl font-bold mt-1">{dashboard.overview?.active_gateways || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">معاملات 24س</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.total_transactions_24h || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">حجم 24س</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.total_volume_24h || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm">نسبة النجاح</p>
          <p className="text-3xl font-bold mt-1">{dashboard.overview?.overall_success_rate || 0}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'configured', label: 'البوابات المفعلة', icon: '✅' },
          { id: 'catalog', label: 'كتالوج البوابات', icon: '📚' },
          { id: 'routing', label: 'قواعد التوجيه', icon: '🚦' },
          { id: 'performance', label: 'الأداء', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'configured' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">البوابات المفعلة</h2>
            <button onClick={() => setActiveTab('catalog')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ إضافة بوابة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {configured.map((gateway) => (
              <div key={gateway.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl text-white">
                    {catalog.find(c => c.id === gateway.id)?.icon || '💳'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{gateway.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${gateway.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {gateway.status === 'active' ? 'نشط' : 'اختبار'}
                      </span>
                      <span className="text-sm text-gray-500">{gateway.environment}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">معاملات اليوم</p>
                    <p className="font-bold text-gray-800 dark:text-white">{gateway.transactions_today?.toLocaleString()}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">الحجم</p>
                    <p className="font-bold text-green-600">{gateway.volume_today?.toLocaleString()} ر.س</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">نسبة النجاح</p>
                    <p className="font-bold text-gray-800 dark:text-white">{gateway.success_rate}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => testGateway(gateway.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">اختبار</button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">تعديل</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              <option value="all">جميع المناطق</option>
              <option value="saudi">🇸🇦 السعودية</option>
              <option value="gulf">🏝️ الخليج</option>
              <option value="egypt">🇪🇬 مصر</option>
              <option value="international">🌐 دولي</option>
              <option value="india">🇮🇳 الهند</option>
              <option value="china">🇨🇳 الصين</option>
              <option value="europe">🇪🇺 أوروبا</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="cards">💳 بطاقات</option>
              <option value="wallet">📱 محافظ</option>
              <option value="bnpl">⏰ اشترِ الآن ادفع لاحقاً</option>
              <option value="aggregator">🔗 مجمّع</option>
              <option value="crypto">₿ عملات رقمية</option>
            </select>
          </div>

          {/* Catalog Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCatalog.map((gateway) => (
              <div key={gateway.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition relative ${isConfigured(gateway.id) ? 'ring-2 ring-green-500' : ''}`}>
                {isConfigured(gateway.id) && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">مفعل</div>
                )}
                <div className="text-4xl mb-3">{gateway.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{gateway.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{gateway.name_en}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                    {getRegionLabel(gateway.region)}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-600 dark:text-blue-400">
                    {getTypeLabel(gateway.type)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {gateway.currencies?.slice(0, 3).map((cur, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-600">{cur}</span>
                  ))}
                  {gateway.currencies?.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">+{gateway.currencies.length - 3}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedGateway(gateway);
                    setShowConfigModal(true);
                  }}
                  className={`w-full py-2 rounded-lg font-medium transition ${isConfigured(gateway.id) ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isConfigured(gateway.id) ? 'إدارة' : 'تفعيل'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'routing' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">قواعد التوجيه الذكي</h2>
              <p className="text-sm text-gray-500">توجيه المدفوعات تلقائياً لأفضل بوابة</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ قاعدة جديدة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {routingRules.map((rule, idx) => (
              <div key={rule.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{idx + 1}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{rule.name}</h3>
                    <p className="text-sm font-mono text-gray-500 mt-1">{rule.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">→ {rule.gateway}</span>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${rule.enabled ? 'right-0.5' : 'left-0.5'}`}></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">أداء البوابات</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">البوابة</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحجم</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المعاملات</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نسبة النجاح</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">متوسط الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {dashboard.performance_by_gateway?.map((gw) => (
                    <tr key={gw.gateway} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{gw.name}</td>
                      <td className="px-6 py-4 text-green-600 font-bold">{gw.volume?.toLocaleString()} ر.س</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{gw.transactions?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${gw.success_rate}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{gw.success_rate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{gw.avg_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && selectedGateway && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{selectedGateway.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">تفعيل {selectedGateway.name}</h2>
                <p className="text-gray-500">{selectedGateway.name_en}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                <input type="password" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="أدخل API Key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Key</label>
                <input type="password" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="أدخل Secret Key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البيئة</label>
                <select className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700">
                  <option value="sandbox">اختبار (Sandbox)</option>
                  <option value="production">إنتاج (Production)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfigModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
              <button onClick={() => { setShowConfigModal(false); alert('تم التفعيل بنجاح!'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">تفعيل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGateways;
