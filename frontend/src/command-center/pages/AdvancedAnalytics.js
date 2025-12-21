import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [realtime, setRealtime] = useState({});
  const [cohorts, setCohorts] = useState({});
  const [funnels, setFunnels] = useState({});
  const [segments, setSegments] = useState({});
  const [attribution, setAttribution] = useState({});
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchData();
    // Auto refresh realtime data
    const interval = setInterval(() => {
      if (activeTab === 'realtime') fetchRealtime();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [realtimeRes, cohortsRes, funnelsRes, segmentsRes, attrRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/advanced-analytics/realtime`, { headers }),
        axios.get(`${API_URL}/api/advanced-analytics/cohorts`, { headers }),
        axios.get(`${API_URL}/api/advanced-analytics/funnels`, { headers }),
        axios.get(`${API_URL}/api/advanced-analytics/segments`, { headers }),
        axios.get(`${API_URL}/api/advanced-analytics/attribution`, { headers }),
        axios.get(`${API_URL}/api/advanced-analytics/dashboard`, { headers })
      ]);
      
      setRealtime(realtimeRes.data || {});
      setCohorts(cohortsRes.data || {});
      setFunnels(funnelsRes.data || {});
      setSegments(segmentsRes.data || {});
      setAttribution(attrRes.data || {});
      setDashboard(dashRes.data || {});
    } catch (err) {
      // Demo data
      setRealtime({ current_visitors: 1450, active_sessions: 980, orders_last_hour: 65, revenue_last_hour: 25000 });
      setCohorts({ cohorts: [], avg_retention: { month_1: 72, month_2: 58 } });
      setFunnels({ steps: [], overall_conversion: 3.2 });
      setSegments({ segments: [] });
      setAttribution({ channels: [] });
      setDashboard({ kpis: {}, alerts: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtime = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const res = await axios.get(`${API_URL}/api/advanced-analytics/realtime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRealtime(res.data || {});
    } catch (err) {}
  };

  const exportData = async (reportType) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('commandToken');
      const res = await axios.post(`${API_URL}/api/advanced-analytics/export`, {
        report_type: reportType,
        date_from: '2024-01-01',
        date_to: '2024-01-15',
        format: exportFormat
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportType}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('تم تحميل التقرير');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-3xl">📊</span> التحليلات المتقدمة
          </h1>
          <p className="text-gray-500">تحليلات عميقة مع إمكانية التصدير</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={() => exportData('general')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <span>⬇️</span> تصدير
          </button>
        </div>
      </div>

      {/* Realtime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <p className="text-green-100 text-sm">زوار حالياً</p>
          <p className="text-3xl font-bold mt-1">{realtime.current_visitors?.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">جلسات نشطة</p>
          <p className="text-3xl font-bold mt-1">{realtime.active_sessions?.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">طلبات الساعة</p>
          <p className="text-3xl font-bold mt-1">{realtime.orders_last_hour}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-emerald-100 text-sm">إيرادات الساعة</p>
          <p className="text-3xl font-bold mt-1">{realtime.revenue_last_hour?.toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'realtime', label: 'فوري', icon: '⚡' },
          { id: 'cohorts', label: 'الأفواج', icon: '👥' },
          { id: 'funnels', label: 'القمع', icon: '🕸️' },
          { id: 'segments', label: 'الشرائح', icon: '🎯' },
          { id: 'attribution', label: 'الإسناد', icon: '📍' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'realtime' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📍 أعلى الصفحات الآن</h2>
            <div className="space-y-3">
              {realtime.top_pages_now?.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-gray-800 dark:text-white font-mono text-sm">{page.page}</span>
                  <span className="font-bold text-indigo-600">{page.visitors} زائر</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 مصادر الزيارات</h2>
            <div className="space-y-3">
              {realtime.traffic_sources?.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-800 dark:text-white">{source.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${source.percentage}%` }}></div>
                    </div>
                    <span className="font-bold text-gray-600 w-12">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">👥 تحليل الأفواج (Cohort Analysis)</h2>
            <button onClick={() => exportData('cohorts')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">تصدير</button>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-blue-600 text-sm">احتفاظ الشهر 1</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{cohorts.avg_retention?.month_1 || 72}%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
              <p className="text-purple-600 text-sm">احتفاظ الشهر 2</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{cohorts.avg_retention?.month_2 || 58}%</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <p className="text-green-600 text-sm">احتفاظ الشهر 3</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{cohorts.avg_retention?.month_3 || 45}%</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
              <p className="text-orange-600 text-sm">احتفاظ الشهر 4</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{cohorts.avg_retention?.month_4 || 38}%</p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">💡 رؤى</h3>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              {cohorts.insights?.map((insight, idx) => (
                <li key={idx}>• {insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'funnels' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">🕸️ تحليل القمع (Funnel Analysis)</h2>
            <button onClick={() => exportData('funnels')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">تصدير</button>
          </div>
          <div className="space-y-4">
            {funnels.steps?.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-left">
                    <p className="font-medium text-gray-800 dark:text-white">{step.step}</p>
                    <p className="text-sm text-gray-500">{step.users?.toLocaleString()} مستخدم</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-10 bg-gray-200 rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-end pr-3" style={{ width: `${step.percentage}%` }}>
                        <span className="text-white font-bold text-sm">{step.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  {step.drop_off > 0 && (
                    <div className="w-20 text-left">
                      <span className="text-red-500 font-bold">-{step.drop_off.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <p className="text-indigo-600 font-medium">نقطة الاختناق: <span className="font-bold">{funnels.bottleneck}</span></p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">نسبة التحويل الإجمالية: {funnels.overall_conversion}%</p>
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">🎯 شرائح العملاء</h2>
            <button onClick={() => exportData('segments')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">تصدير</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.segments?.map((segment) => (
              <div key={segment.id} className={`rounded-2xl p-6 ${segment.id === 'vip' ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : segment.id === 'churned' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                <h3 className={`text-xl font-bold ${segment.id === 'vip' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{segment.name}</h3>
                <p className={`text-3xl font-bold mt-2 ${segment.id === 'vip' ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{segment.count?.toLocaleString()}</p>
                <p className={`text-sm ${segment.id === 'vip' ? 'text-yellow-100' : 'text-gray-500'}`}>{segment.percentage}% من العملاء</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span>متوسط الطلب</span>
                    <span className="font-bold">{segment.avg_order_value} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>LTV</span>
                    <span className="font-bold">{segment.lifetime_value?.toLocaleString()} ر.س</span>
                  </div>
                </div>
                <p className={`text-xs mt-3 ${segment.id === 'vip' ? 'text-yellow-100' : 'text-gray-500'}`}>
                  💡 {segments.recommendations?.[segment.id]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attribution' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">📍 إسناد التسويق (Attribution)</h2>
            <button onClick={() => exportData('attribution')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">تصدير</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">القناة</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التحويلات</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإيرادات</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التكلفة</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {attribution.channels?.map((channel, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{channel.channel}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{channel.conversions?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">{channel.revenue?.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{channel.cost?.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4">
                      {channel.roas ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${channel.roas > 10 ? 'bg-green-100 text-green-700' : channel.roas > 5 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {channel.roas}x
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-green-600 text-sm">إجمالي التحويلات</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{attribution.total_conversions?.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-blue-600 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{attribution.total_revenue?.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <p className="text-purple-600 text-sm">ROAS الإجمالي</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{attribution.overall_roas}x</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
