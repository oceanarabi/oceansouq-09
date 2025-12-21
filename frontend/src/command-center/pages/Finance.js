import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [revenue, setRevenue] = useState({});
  const [gateways, setGateways] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [revRes, gatewaysRes, settlementsRes, refundsRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/finance/revenue?period=month`, { headers }),
        axios.get(`${API_URL}/api/finance/gateways`, { headers }),
        axios.get(`${API_URL}/api/finance/settlements`, { headers }),
        axios.get(`${API_URL}/api/finance/refunds`, { headers }),
        axios.get(`${API_URL}/api/finance/dashboard`, { headers })
      ]);
      
      setRevenue(revRes.data || {});
      setGateways(gatewaysRes.data.gateways || []);
      setSettlements(settlementsRes.data.settlements || []);
      setRefunds(refundsRes.data.refunds || []);
      setDashboard(dashRes.data || {});
    } catch (err) {
      // Demo data
      setRevenue({
        total_revenue: 2850000,
        streams: [
          { name: 'التسوق', amount: 1282500, percentage: 45, growth: 12.5, icon: '🛒' },
          { name: 'الطعام', amount: 712500, percentage: 25, growth: 18.3, icon: '🍔' },
          { name: 'المشاوير', amount: 427500, percentage: 15, growth: 8.7, icon: '🚗' },
          { name: 'الفنادق', amount: 285000, percentage: 10, growth: 22.1, icon: '🏨' },
        ],
        commission_earned: 342000
      });
      setGateways([
        { id: 'mada', name: 'مدى', status: 'active', health: 99.8, transactions_24h: 2100, volume_24h: 315000, success_rate: 99.2 },
        { id: 'stripe', name: 'Stripe', status: 'active', health: 99.9, transactions_24h: 1250, volume_24h: 185000, success_rate: 98.5 },
        { id: 'stc_pay', name: 'STC Pay', status: 'active', health: 98.5, transactions_24h: 850, volume_24h: 127500, success_rate: 96.5 },
      ]);
      setSettlements([
        { id: 'SET-001', seller_name: 'متجر الأناقة', net_amount: 13878, status: 'pending', due_date: '2024-01-20' },
        { id: 'SET-002', seller_name: 'إلكترونيات المستقبل', net_amount: 40500, status: 'processing', due_date: '2024-01-20' },
      ]);
      setRefunds([
        { id: 'REF-001', customer: 'أحمد محمد', amount: 450, reason: 'منتج تالف', status: 'pending' },
        { id: 'REF-002', customer: 'سارة علي', amount: 1200, reason: 'لم يصل', status: 'approved' },
      ]);
      setDashboard({
        overview: {
          total_revenue_today: 125000,
          total_revenue_month: 2850000,
          pending_payouts: 185000,
          commission_earned_month: 342000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">💰</span> المالية والمدفوعات
        </h1>
        <p className="text-gray-500">إدارة الإيرادات والتسويات وبوابات الدفع</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">إيرادات اليوم</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.total_revenue_today || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">إيرادات الشهر</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.total_revenue_month || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">عمولات الشهر</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.commission_earned_month || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">تسويات معلقة</p>
          <p className="text-3xl font-bold mt-1">{(dashboard.overview?.pending_payouts || 0).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: '📊' },
          { id: 'gateways', label: 'بوابات الدفع', icon: '💳' },
          { id: 'settlements', label: 'التسويات', icon: '💸' },
          { id: 'refunds', label: 'الاستردادات', icon: '↩️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Revenue Streams */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">مصادر الإيرادات</h2>
            <div className="space-y-4">
              {revenue.streams?.map((stream, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-3xl">{stream.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-800 dark:text-white">{stream.name}</span>
                      <span className="text-green-600 font-bold">{stream.amount?.toLocaleString()} ر.س</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${stream.percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{stream.percentage}%</span>
                      <span className="text-xs text-green-500">+{stream.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 transition text-right">
                <span className="text-2xl">💸</span>
                <p className="font-medium text-gray-800 dark:text-white mt-2">إرسال تسويات</p>
              </button>
              <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition text-right">
                <span className="text-2xl">📊</span>
                <p className="font-medium text-gray-800 dark:text-white mt-2">تقرير مالي</p>
              </button>
              <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 transition text-right">
                <span className="text-2xl">🧾</span>
                <p className="font-medium text-gray-800 dark:text-white mt-2">فواتير ضريبية</p>
              </button>
              <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 transition text-right">
                <span className="text-2xl">↩️</span>
                <p className="font-medium text-gray-800 dark:text-white mt-2">معالجة استرداد</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gateways' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">بوابات الدفع</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">البوابة</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الصحة</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">معاملات 24س</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">حجم 24س</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نسبة النجاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {gateways.map((gateway) => (
                  <tr key={gateway.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{gateway.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${gateway.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {gateway.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${gateway.health}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{gateway.health}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{gateway.transactions_24h?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{gateway.volume_24h?.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{gateway.success_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">تسويات البائعين</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">معالجة الكل</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{settlement.seller_name}</p>
                  <p className="text-sm text-gray-500">{settlement.id} • استحقاق: {settlement.due_date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    settlement.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {settlement.status === 'pending' ? 'بانتظار' : settlement.status === 'processing' ? 'جاري' : 'مكتمل'}
                  </span>
                  <span className="text-xl font-bold text-green-600">{settlement.net_amount?.toLocaleString()} ر.س</span>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">إرسال</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">طلبات الاسترداد</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {refunds.map((refund) => (
              <div key={refund.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{refund.customer}</p>
                  <p className="text-sm text-gray-500">{refund.id} • {refund.reason}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    refund.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    refund.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {refund.status === 'pending' ? 'بانتظار' : refund.status === 'approved' ? 'موافق' : 'مرفوض'}
                  </span>
                  <span className="text-xl font-bold text-red-600">{refund.amount} ر.س</span>
                  {refund.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">موافقة</button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">رفض</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
