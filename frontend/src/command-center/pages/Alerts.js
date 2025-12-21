import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [alertsRes, rulesRes, incidentsRes, dashRes] = await Promise.all([
        axios.get(`${API_URL}/api/alerts/active`, { headers }),
        axios.get(`${API_URL}/api/alerts/rules`, { headers }),
        axios.get(`${API_URL}/api/alerts/incidents`, { headers }),
        axios.get(`${API_URL}/api/alerts/dashboard`, { headers })
      ]);
      
      setAlerts(alertsRes.data.alerts || []);
      setRules(rulesRes.data.rules || []);
      setIncidents(incidentsRes.data.incidents || []);
      setDashboard(dashRes.data || {});
    } catch (err) {
      // Demo data
      setAlerts([
        { id: 'ALT-001', type: 'system', title: 'ارتفاع استخدام الخادم', message: 'CPU وصل إلى 85%', severity: 'warning', source: 'monitoring', created_at: '2024-01-15T11:30:00', acknowledged: false },
        { id: 'ALT-002', type: 'security', title: 'محاولات تسجيل دخول فاشلة', message: '15 محاولة فاشلة', severity: 'high', source: 'security', created_at: '2024-01-15T11:25:00', acknowledged: false },
        { id: 'ALT-003', type: 'payment', title: 'فشل بوابة الدفع', message: 'معدل فشل 5%', severity: 'critical', source: 'payments', created_at: '2024-01-15T10:30:00', acknowledged: false },
        { id: 'ALT-004', type: 'operations', title: 'تأخر التوصيل', message: '25 طلب متأخر', severity: 'medium', source: 'logistics', created_at: '2024-01-15T10:45:00', acknowledged: true },
      ]);
      setRules([
        { id: 'AR-001', name: 'ارتفاع CPU', condition: 'cpu_usage > 80%', severity: 'warning', enabled: true, triggers_24h: 3 },
        { id: 'AR-002', name: 'فشل المدفوعات', condition: 'payment_failure > 3%', severity: 'critical', enabled: true, triggers_24h: 1 },
      ]);
      setIncidents([
        { id: 'INC-001', title: 'انقطاع بوابة مدى', severity: 'critical', status: 'resolved', started_at: '2024-01-14T14:30:00', duration: '15 دقيقة' },
        { id: 'INC-002', title: 'مشكلة الإشعارات', severity: 'medium', status: 'investigating', started_at: '2024-01-15T10:00:00' },
      ]);
      setDashboard({
        status: { overall: 'warning', systems: 'healthy', security: 'warning' },
        stats_24h: { total_alerts: 45, critical: 2, high: 5, resolved: 38 }
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    const styles = {
      critical: { bg: 'bg-red-500', light: 'bg-red-100 text-red-700', icon: '🚨' },
      high: { bg: 'bg-orange-500', light: 'bg-orange-100 text-orange-700', icon: '⚠️' },
      warning: { bg: 'bg-yellow-500', light: 'bg-yellow-100 text-yellow-700', icon: '⚡' },
      medium: { bg: 'bg-blue-500', light: 'bg-blue-100 text-blue-700', icon: 'ℹ️' },
      low: { bg: 'bg-gray-500', light: 'bg-gray-100 text-gray-700', icon: '📝' }
    };
    return styles[severity] || styles.low;
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🔔</span> التنبيهات الفورية
          </h1>
          <p className="text-gray-500">مراقبة وإدارة التنبيهات والحوادث</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
          dashboard.status?.overall === 'critical' ? 'bg-red-100 text-red-700 animate-pulse' :
          dashboard.status?.overall === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          <span className={`w-3 h-3 rounded-full ${
            dashboard.status?.overall === 'critical' ? 'bg-red-500' :
            dashboard.status?.overall === 'warning' ? 'bg-yellow-500' :
            'bg-green-500'
          } animate-pulse`}></span>
          {dashboard.status?.overall === 'critical' ? 'حرج' : dashboard.status?.overall === 'warning' ? 'تحذير' : 'طبيعي'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <p className="text-red-100 text-sm">حرجة</p>
          <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.critical || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">عالية</p>
          <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.high || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">إجمالي 24س</p>
          <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.total_alerts || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">تم حلها</p>
          <p className="text-3xl font-bold mt-1">{dashboard.stats_24h?.resolved || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'active', label: 'تنبيهات نشطة', icon: '🚨', count: alerts.filter(a => !a.acknowledged).length },
          { id: 'rules', label: 'قواعد التنبيه', icon: '⚙️' },
          { id: 'incidents', label: 'الحوادث', icon: '📅' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div key={alert.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-r-4 ${style.bg} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{style.icon}</span>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.light}`}>
                            {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : alert.severity === 'warning' ? 'تحذير' : 'متوسط'}
                          </span>
                          <span className="text-sm text-gray-500">{alert.id}</span>
                          <span className="text-sm text-gray-400">{new Date(alert.created_at).toLocaleTimeString('ar-SA')}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{alert.title}</h3>
                        <p className="text-gray-500">{alert.message}</p>
                        <p className="text-sm text-gray-400 mt-1">المصدر: {alert.source}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          إقرار
                        </button>
                      )}
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        حل
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        تفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">قواعد التنبيه</h2>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">+ قاعدة جديدة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {rules.map((rule) => {
              const style = getSeverityStyle(rule.severity);
              return (
                <div key={rule.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{rule.name}</p>
                    <p className="text-sm text-gray-500 font-mono mt-1">{rule.condition}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.light}`}>
                      {rule.severity}
                    </span>
                    <span className="text-sm text-gray-500">{rule.triggers_24h} تفعيل</span>
                    <button className={`w-12 h-6 rounded-full transition-all relative ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${rule.enabled ? 'right-0.5' : 'left-0.5'}`}></span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">سجل الحوادث</h2>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">إعلان حادثة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {incidents.map((incident) => {
              const style = getSeverityStyle(incident.severity);
              return (
                <div key={incident.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className={`w-3 h-3 rounded-full mt-2 ${style.bg}`}></span>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-800 dark:text-white">{incident.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {incident.status === 'resolved' ? 'محلولة' : incident.status === 'investigating' ? 'تحقيق' : 'نشطة'}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">{incident.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          بدأت: {new Date(incident.started_at).toLocaleString('ar-SA')}
                          {incident.duration && ` • المدة: ${incident.duration}`}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
