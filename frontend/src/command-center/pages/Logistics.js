import React, { useState, useEffect } from 'react';

const Logistics = () => {
  const [activeTab, setActiveTab] = useState('routes');
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [deliverySlots, setDeliverySlots] = useState(null);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'routes') {
        const [optRes, trafficRes] = await Promise.all([
          fetch(`${API_URL}/api/logistics/routes/optimize`, { headers }),
          fetch(`${API_URL}/api/logistics/routes/traffic`, { headers })
        ]);
        setRouteOptimization(await optRes.json());
        setTraffic(await trafficRes.json());
      } else if (activeTab === 'tracking') {
        const res = await fetch(`${API_URL}/api/logistics/tracking/fleet`, { headers });
        const data = await res.json();
        setFleet(data.vehicles || []);
      } else if (activeTab === 'inventory') {
        const res = await fetch(`${API_URL}/api/logistics/inventory/status`, { headers });
        setInventory(await res.json());
      } else if (activeTab === 'scheduling') {
        const res = await fetch(`${API_URL}/api/logistics/scheduling/slots`, { headers });
        setDeliverySlots(await res.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'routes', label: 'تحسين المسارات', icon: '🗝' },
    { id: 'tracking', label: 'تتبع الأسطول', icon: '🚚' },
    { id: 'inventory', label: 'المخزون الذكي', icon: '📦' },
    { id: 'scheduling', label: 'جدولة التوصيل', icon: '📅' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🚚 اللوجستيات الذكية</h1>
        <p className="text-gray-400">تحسين المسارات وإدارة الشحن</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {/* Routes Tab */}
          {activeTab === 'routes' && routeOptimization && (
            <div className="space-y-6">
              {/* Savings Summary */}
              <div className="bg-gradient-to-r from-green-900 to-teal-900 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">✨ نتائج التحسين</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-green-200 text-sm">المسافة الموفرة</div>
                    <div className="text-2xl font-bold">{routeOptimization.savings?.distance}</div>
                  </div>
                  <div>
                    <div className="text-green-200 text-sm">الوقت الموفر</div>
                    <div className="text-2xl font-bold">{routeOptimization.savings?.time}</div>
                  </div>
                  <div>
                    <div className="text-green-200 text-sm">الوقود الموفر</div>
                    <div className="text-2xl font-bold">{routeOptimization.savings?.fuel}</div>
                  </div>
                  <div>
                    <div className="text-green-200 text-sm">التكلفة الموفرة</div>
                    <div className="text-2xl font-bold">{routeOptimization.savings?.cost}</div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4 text-red-400">❌ قبل التحسين</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>المسافة:</span><span>{routeOptimization.before?.total_distance} كم</span></div>
                    <div className="flex justify-between"><span>الوقت:</span><span>{routeOptimization.before?.total_time}</span></div>
                    <div className="flex justify-between"><span>الوقود:</span><span>{routeOptimization.before?.fuel_estimate} لتر</span></div>
                  </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4 text-green-400">✓ بعد التحسين</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>المسافة:</span><span>{routeOptimization.after?.total_distance} كم</span></div>
                    <div className="flex justify-between"><span>الوقت:</span><span>{routeOptimization.after?.total_time}</span></div>
                    <div className="flex justify-between"><span>الوقود:</span><span>{routeOptimization.after?.fuel_estimate} لتر</span></div>
                  </div>
                </div>
              </div>

              {/* Optimized Route */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">📍 المسار المحسّن</h3>
                <div className="flex flex-wrap gap-2">
                  {routeOptimization.optimized_route?.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">{stop.stop}</div>
                      <div className="bg-gray-700 p-2 rounded text-sm">
                        <div>{stop.address}</div>
                        <div className="text-gray-400 text-xs">{stop.order_id} - ETA: {stop.eta}</div>
                      </div>
                      {idx < routeOptimization.optimized_route.length - 1 && <span className="text-gray-500">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic */}
              {traffic && (
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4">🚦 حالة المرور</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {traffic.zones?.map((zone, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${zone.status === 'light' ? 'bg-green-900/50' : zone.status === 'moderate' ? 'bg-yellow-900/50' : 'bg-red-900/50'}`}>
                        <div className="font-bold">{zone.name}</div>
                        <div className={`text-sm ${zone.status === 'light' ? 'text-green-400' : zone.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                          {zone.status === 'light' ? 'سلس' : zone.status === 'moderate' ? 'متوسط' : 'مزدحم'}
                        </div>
                        {zone.delay !== '0' && <div className="text-xs text-gray-400">تأخير: {zone.delay}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-right">المركبة</th>
                      <th className="p-3 text-right">السائق</th>
                      <th className="p-3 text-right">الحالة</th>
                      <th className="p-3 text-right">الطلب الحالي</th>
                      <th className="p-3 text-right">السرعة</th>
                      <th className="p-3 text-right">البطارية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.slice(0, 15).map(v => (
                      <tr key={v.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-mono">{v.id}</td>
                        <td className="p-3">{v.driver}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${v.status === 'delivering' ? 'bg-green-600' : v.status === 'idle' ? 'bg-blue-600' : 'bg-yellow-600'}`}>
                            {v.status === 'delivering' ? 'يوصل' : v.status === 'idle' ? 'متاح' : 'عائد'}
                          </span>
                        </td>
                        <td className="p-3">{v.current_order || '-'}</td>
                        <td className="p-3">{v.speed} كم/س</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div className={`h-2 rounded-full ${v.battery > 50 ? 'bg-green-500' : v.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${v.battery}%`}}></div>
                            </div>
                            <span className="text-xs">{v.battery}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && inventory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-green-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{inventory.summary?.healthy}</div>
                  <div className="text-green-300 text-sm">سليم</div>
                </div>
                <div className="bg-yellow-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{inventory.summary?.low_stock}</div>
                  <div className="text-yellow-300 text-sm">منخفض</div>
                </div>
                <div className="bg-red-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{inventory.summary?.out_of_stock}</div>
                  <div className="text-red-300 text-sm">نافد</div>
                </div>
                <div className="bg-purple-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{inventory.summary?.overstock}</div>
                  <div className="text-purple-300 text-sm">فائض</div>
                </div>
                <div className="bg-blue-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{inventory.summary?.total_skus}</div>
                  <div className="text-blue-300 text-sm">إجمالي SKU</div>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🚨 تنبيهات المخزون</h3>
                <div className="space-y-3">
                  {inventory.alerts?.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-r-4 ${alert.status === 'critical' ? 'bg-red-900/30 border-red-500' : alert.status === 'low' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-purple-900/30 border-purple-500'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{alert.product}</div>
                          <div className="text-sm text-gray-400">SKU: {alert.sku}</div>
                        </div>
                        <div className="text-left">
                          <div className={`font-bold ${alert.status === 'overstock' ? 'text-purple-400' : 'text-red-400'}`}>
                            {alert.status === 'overstock' ? `فائض: ${alert.current}/${alert.max}` : `الحالي: ${alert.current} / الحد: ${alert.min}`}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${alert.status === 'critical' ? 'bg-red-600' : alert.status === 'low' ? 'bg-yellow-600' : 'bg-purple-600'}`}>
                            {alert.status === 'critical' ? 'حرج' : alert.status === 'low' ? 'منخفض' : 'فائض'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warehouse Utilization */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🏭 استخدام المستودعات</h3>
                <div className="space-y-3">
                  {Object.entries(inventory.warehouse_utilization || {}).map(([wh, util]) => (
                    <div key={wh}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{wh}</span>
                        <span>{util}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className={`h-3 rounded-full ${util > 90 ? 'bg-red-500' : util > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${util}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && deliverySlots && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">📅 فترات التوصيل - {deliverySlots.date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliverySlots.slots?.map((slot, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${slot.available === 0 ? 'bg-red-900/30' : slot.available < 10 ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{slot.time}</span>
                        {slot.price > 0 && <span className="text-yellow-400 text-sm">+{slot.price} ر.س</span>}
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className={`${slot.available === 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {slot.available === 0 ? 'ممتلئ' : `${slot.available} متاح`}
                        </span>
                        <span className="text-gray-400">{slot.booked} محجوز</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(slot.booked / (slot.booked + slot.available)) * 100}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {deliverySlots.express_available && (
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">⚡ التوصيل السريع</h3>
                      <p className="text-orange-200">{deliverySlots.express_time}</p>
                    </div>
                    <div className="text-3xl font-bold">{deliverySlots.express_price} ر.س</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Logistics;