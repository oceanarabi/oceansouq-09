import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Security = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [blockedEntities, setBlockedEntities] = useState({ blocked_users: [], blocked_ips: [], blocked_devices: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [fraudRules, setFraudRules] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [alertsRes, blockedRes, logsRes, rulesRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/security/fraud-alerts`, { headers }),
        axios.get(`${API_URL}/api/security/blocked-entities`, { headers }),
        axios.get(`${API_URL}/api/security/audit-logs`, { headers }),
        axios.get(`${API_URL}/api/security/fraud-rules`, { headers }),
        axios.get(`${API_URL}/api/security/dashboard`, { headers })
      ]);
      
      setFraudAlerts(alertsRes.data.alerts || []);
      setBlockedEntities(blockedRes.data || {});
      setAuditLogs(logsRes.data.logs || []);
      setFraudRules(rulesRes.data.rules || []);
      setDashboard(dashRes.data || {});
    } catch (err) {
      // Demo data
      setFraudAlerts([
        { id: 'FA-001', type: 'multiple_accounts', user_name: 'محمد أحمد', description: 'إنشاء حسابات متعددة', severity: 'high', risk_score: 85, status: 'pending', detected_at: '2024-01-15T10:30:00' },
        { id: 'FA-002', type: 'payment_fraud', user_name: 'فاطمة أحمد', description: 'بطاقة مسروقة', severity: 'critical', risk_score: 95, status: 'blocked', detected_at: '2024-01-15T07:45:00' },
        { id: 'FA-003', type: 'refund_abuse', user_name: 'نورة سعود', description: 'طلبات استرداد متكررة', severity: 'high', risk_score: 80, status: 'investigating', detected_at: '2024-01-14T14:20:00' },
      ]);
      setBlockedEntities({
        blocked_users: [{ user_id: 'user-321', name: 'فاطمة أحمد', reason: 'احتيال', blocked_at: '2024-01-15' }],
        blocked_ips: [{ ip: '192.168.1.50', reason: 'هجوم', blocked_at: '2024-01-15' }],
        blocked_devices: [{ device_id: 'dev-123', reason: 'حسابات متعددة', blocked_at: '2024-01-15' }]
      });
      setDashboard({ overview: { threat_level: 'medium', active_threats: 3, blocked_today: 45 }, stats_24h: { blocked_requests: 1250, fraud_alerts: 12 } });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      investigating: 'bg-blue-100 text-blue-700',
      blocked: 'bg-red-100 text-red-700',
      resolved: 'bg-green-100 text-green-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🛡️</span> الأمان والحماية
          </h1>
          <p className="text-gray-500">مراقبة الاحتيال والتهديدات الأمنية</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold ${
          dashboard.overview?.threat_level === 'high' ? 'bg-red-100 text-red-700' :
          dashboard.overview?.threat_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          مستوى التهديد: {dashboard.overview?.threat_level === 'high' ? 'عالي' : dashboard.overview?.threat_level === 'medium' ? 'متوسط' : 'منخفض'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">تهديدات نشطة</p>
              <p className="text-3xl font-bold mt-1">{dashboard.overview?.active_threats || 0}</p>
            </div>
            <span className="text-4xl">⚠️</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">تنبيهات احتيال</p>
              <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.fraud_alerts || 0}</p>
            </div>
            <span className="text-4xl">🚨</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">طلبات محظورة اليوم</p>
              <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.blocked_requests || 0}</p>
            </div>
            <span className="text-4xl">🚫</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">تم الحظر اليوم</p>
              <p className="text-3xl font-bold mt-1">{dashboard.overview?.blocked_today || 0}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'alerts', label: 'تنبيهات الاحتيال', icon: '🚨' },
          { id: 'blocked', label: 'العناصر المحظورة', icon: '🚫' },
          { id: 'rules', label: 'قواعد الكشف', icon: '⚙️' },
          { id: 'audit', label: 'سجل التدقيق', icon: '📋' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">تنبيهات الاحتيال</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(alert.severity)}`}></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-800 dark:text-white">{alert.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                          {alert.status === 'pending' ? 'بانتظار' : alert.status === 'investigating' ? 'تحقيق' : alert.status === 'blocked' ? 'محظور' : 'محلول'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">{alert.user_name}</p>
                      <p className="text-gray-500 text-sm">{alert.description}</p>
                      <p className="text-gray-400 text-xs mt-1">{alert.detected_at}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{alert.risk_score}</div>
                    <div className="text-xs text-gray-500">نقاط الخطر</div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">حظر</button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">تحقيق</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>👤</span> مستخدمون محظورون
            </h3>
            <div className="space-y-3">
              {blockedEntities.blocked_users?.map((user, idx) => (
                <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.reason}</p>
                  <p className="text-xs text-gray-400">{user.blocked_at}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>🌐</span> IP محظور
            </h3>
            <div className="space-y-3">
              {blockedEntities.blocked_ips?.map((ip, idx) => (
                <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <p className="font-mono font-medium text-gray-800 dark:text-white">{ip.ip}</p>
                  <p className="text-sm text-gray-500">{ip.reason}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>📱</span> أجهزة محظورة
            </h3>
            <div className="space-y-3">
              {blockedEntities.blocked_devices?.map((device, idx) => (
                <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="font-mono font-medium text-gray-800 dark:text-white">{device.device_id}</p>
                  <p className="text-sm text-gray-500">{device.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">قواعد كشف الاحتيال</h2>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">+ قاعدة جديدة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {fraudRules.map((rule) => (
              <div key={rule.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{rule.name}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{rule.condition}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)} text-white`}>
                    {rule.severity}
                  </span>
                  <span className="text-sm text-gray-500">{rule.triggers_24h} تفعيل</span>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${rule.enabled ? 'right-0.5' : 'left-0.5'}`}></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">سجل التدقيق</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الوقت</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المستخدم</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراء</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">التفاصيل</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 text-sm text-gray-500">{log.timestamp?.split('T')[1]?.split(':').slice(0,2).join(':')}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-white">{log.user_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{log.action}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{log.details}</td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
