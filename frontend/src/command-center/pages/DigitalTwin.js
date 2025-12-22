import React, { useState, useEffect } from 'react';

const DigitalTwin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [ordersFlow, setOrdersFlow] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${API_URL}/api/digital-twin/overview`, { headers });
        const data = await res.json();
        setOverview(data);
      } else if (activeTab === 'warehouses') {
        const res = await fetch(`${API_URL}/api/digital-twin/warehouses`, { headers });
        const data = await res.json();
        setWarehouses(data.warehouses || []);
      } else if (activeTab === 'vehicles') {
        const res = await fetch(`${API_URL}/api/digital-twin/vehicles`, { headers });
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_URL}/api/digital-twin/orders-flow`, { headers });
        const data = await res.json();
        setOrdersFlow(data);
      } else if (activeTab === 'alerts') {
        const res = await fetch(`${API_URL}/api/digital-twin/alerts`, { headers });
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '🔮' },
    { id: 'warehouses', label: 'المستودعات', icon: '🏭' },
    { id: 'vehicles', label: 'المركبات', icon: '🚚' },
    { id: 'orders', label: 'تدفق الطلبات', icon: '📦' },
    { id: 'alerts', label: 'التنبيهات', icon: '🚨' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔮 التوأم الرقمي</h1>
        <p className="text-gray-400">مراقبة حية وتمثيل رقمي للعمليات</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl">
                  <div className="text-green-200 text-sm">حالة النظام</div>
                  <div className="text-2xl font-bold mt-1">✅ يعمل</div>
                  <div className="text-xs text-green-200 mt-2">آخر مزامنة: الآن</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl">
                  <div className="text-blue-200 text-sm">المستودعات النشطة</div>
                  <div className="text-2xl font-bold mt-1">{overview.components?.warehouses?.active || 0}</div>
                  <div className="text-xs text-blue-200 mt-2">{overview.components?.warehouses?.alerts || 0} تنبيهات</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl">
                  <div className="text-purple-200 text-sm">المركبات النشطة</div>
                  <div className="text-2xl font-bold mt-1">{overview.components?.vehicles?.active || 0}</div>
                  <div className="text-xs text-purple-200 mt-2">من {overview.components?.vehicles?.total || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-4 rounded-xl">
                  <div className="text-orange-200 text-sm">الطلبات قيد المعالجة</div>
                  <div className="text-2xl font-bold mt-1">{overview.components?.orders?.processing || 0}</div>
                  <div className="text-xs text-orange-200 mt-2">{overview.components?.orders?.delivered_today || 0} تم تسليمها اليوم</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">📊 مؤشرات الأداء</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>معدل تنفيذ الطلبات</span>
                      <span className="text-green-400 font-bold">{overview.kpis?.order_fulfillment_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>متوسط وقت التوصيل</span>
                      <span className="text-blue-400 font-bold">{overview.kpis?.average_delivery_time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>رضا العملاء</span>
                      <span className="text-yellow-400 font-bold">⭐ {overview.kpis?.customer_satisfaction}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>وقت تشغيل النظام</span>
                      <span className="text-purple-400 font-bold">{overview.kpis?.system_uptime}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">🏪 المتاجر</h3>
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400">{overview.components?.stores?.online || 0}</div>
                      <div className="text-gray-400">متجر متصل</div>
                      <div className="text-sm text-red-400 mt-2">{overview.components?.stores?.offline || 0} غير متصل</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warehouses Tab */}
          {activeTab === 'warehouses' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {warehouses.map(wh => (
                <div key={wh.id} className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">🏭 {wh.name}</h3>
                      <p className="text-gray-400 text-sm">📍 {wh.location.city}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${wh.alerts?.length > 0 ? 'bg-red-600' : 'bg-green-600'}`}>
                      {wh.alerts?.length > 0 ? `${wh.alerts.length} تنبيه` : 'سليم'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>السعة</span>
                      <span>{wh.capacity.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${wh.capacity.utilization > 90 ? 'bg-red-500' : wh.capacity.utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${wh.capacity.utilization}%`}}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-gray-400">الموظفون</div>
                      <div className="font-bold">{wh.staff.on_duty}/{wh.staff.total}</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-gray-400">طلبات معلقة</div>
                      <div className="font-bold">{wh.orders_pending}</div>
                    </div>
                  </div>

                  {wh.zones && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-400 mb-2">المناطق:</div>
                      <div className="flex flex-wrap gap-2">
                        {wh.zones.map((zone, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs ${zone.status === 'normal' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                            {zone.name} ({zone.temp}°)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'delivering').length}</div>
                  <div className="text-green-300 text-sm">يوصلون</div>
                </div>
                <div className="bg-blue-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'idle').length}</div>
                  <div className="text-blue-300 text-sm">متاحون</div>
                </div>
                <div className="bg-yellow-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'returning').length}</div>
                  <div className="text-yellow-300 text-sm">عائدون</div>
                </div>
                <div className="bg-red-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</div>
                  <div className="text-red-300 text-sm">صيانة</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-3 text-right">المركبة</th>
                        <th className="p-3 text-right">السائق</th>
                        <th className="p-3 text-right">النوع</th>
                        <th className="p-3 text-right">الحالة</th>
                        <th className="p-3 text-right">السرعة</th>
                        <th className="p-3 text-right">الوقود</th>
                        <th className="p-3 text-right">التقييم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.slice(0, 15).map(v => (
                        <tr key={v.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="p-3 font-mono">{v.id}</td>
                          <td className="p-3">{v.driver}</td>
                          <td className="p-3">{v.type}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${v.status === 'delivering' ? 'bg-green-900 text-green-300' : v.status === 'idle' ? 'bg-blue-900 text-blue-300' : v.status === 'returning' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                              {v.status === 'delivering' ? 'يوصل' : v.status === 'idle' ? 'متاح' : v.status === 'returning' ? 'عائد' : 'صيانة'}
                            </span>
                          </td>
                          <td className="p-3">{v.speed} كم/س</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${v.fuel_level > 50 ? 'bg-green-500' : v.fuel_level > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${v.fuel_level}%`}}></div>
                              </div>
                              <span className="text-xs">{v.fuel_level}%</span>
                            </div>
                          </td>
                          <td className="p-3">⭐ {v.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Flow Tab */}
          {activeTab === 'orders' && ordersFlow && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400">{ordersFlow.realtime_flow?.new_orders_per_minute}</div>
                  <div className="text-gray-400 text-sm">طلبات جديدة/دقيقة</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400">{ordersFlow.realtime_flow?.processing_per_minute}</div>
                  <div className="text-gray-400 text-sm">معالجة/دقيقة</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-orange-400">{ordersFlow.realtime_flow?.dispatched_per_minute}</div>
                  <div className="text-gray-400 text-sm">إرسال/دقيقة</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-400">{ordersFlow.realtime_flow?.delivered_per_minute}</div>
                  <div className="text-gray-400 text-sm">تسليم/دقيقة</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">📊 خط الإنتاج</h3>
                <div className="flex flex-wrap gap-4">
                  {ordersFlow.pipeline?.map((stage, idx) => (
                    <div key={idx} className="flex-1 min-w-[150px]">
                      <div className="bg-gray-700 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{stage.count}</div>
                        <div className="text-sm text-gray-400">{stage.stage}</div>
                        <div className="text-xs text-blue-400 mt-1">{stage.avg_time}</div>
                      </div>
                      {idx < ordersFlow.pipeline.length - 1 && (
                        <div className="hidden md:block text-center text-2xl text-gray-600">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {ordersFlow.bottlenecks?.length > 0 && (
                <div className="bg-red-900/30 border border-red-800 p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-4 text-red-400">⚠️ نقاط الاختناق</h3>
                  <div className="space-y-3">
                    {ordersFlow.bottlenecks.map((bn, idx) => (
                      <div key={idx} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold">{bn.location}</div>
                          <div className="text-sm text-gray-400">{bn.orders_affected} طلبات متأثرة</div>
                        </div>
                        <div className="text-red-400 font-bold">تأخير {bn.delay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border-r-4 ${alert.severity === 'high' ? 'bg-red-900/30 border-red-500' : alert.severity === 'medium' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-blue-900/30 border-blue-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${alert.severity === 'high' ? 'bg-red-600' : alert.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                          {alert.severity === 'high' ? 'عاجل' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </span>
                        <span className="text-gray-400 text-sm">{alert.type}</span>
                      </div>
                      <p className="mt-2 font-bold">{alert.message}</p>
                      <p className="text-sm text-gray-400 mt-1">📍 {alert.location}</p>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
                      {alert.action_required}
                    </button>
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

export default DigitalTwin;