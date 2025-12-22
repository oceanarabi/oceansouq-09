import React, { useState, useEffect } from 'react';

const AutonomousMode = () => {
  const [status, setStatus] = useState(null);
  const [pricingDecisions, setPricingDecisions] = useState([]);
  const [inventoryDecisions, setInventoryDecisions] = useState([]);
  const [dispatchOptimizations, setDispatchOptimizations] = useState(null);
  const [supportTickets, setSupportTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('status');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'status') {
        const res = await fetch(`${API_URL}/api/autonomous/status`, { headers });
        setStatus(await res.json());
      } else if (activeTab === 'pricing') {
        const res = await fetch(`${API_URL}/api/autonomous/pricing/decisions`, { headers });
        const data = await res.json();
        setPricingDecisions(data.decisions || []);
      } else if (activeTab === 'inventory') {
        const res = await fetch(`${API_URL}/api/autonomous/inventory/decisions`, { headers });
        const data = await res.json();
        setInventoryDecisions(data.decisions || []);
      } else if (activeTab === 'dispatch') {
        const res = await fetch(`${API_URL}/api/autonomous/dispatch/optimizations`, { headers });
        setDispatchOptimizations(await res.json());
      } else if (activeTab === 'support') {
        const res = await fetch(`${API_URL}/api/autonomous/support/resolved`, { headers });
        const data = await res.json();
        setSupportTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'status', label: 'الحالة', icon: '🤖' },
    { id: 'pricing', label: 'التسعير الآلي', icon: '💰' },
    { id: 'inventory', label: 'المخزون الآلي', icon: '📦' },
    { id: 'dispatch', label: 'التوزيع الآلي', icon: '🚚' },
    { id: 'support', label: 'الدعم الآلي', icon: '💬' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🤖 الوضع الذاتي</h1>
        <p className="text-gray-400">قرارات آلية ذكية لتشغيل النظام</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Status Tab */}
          {activeTab === 'status' && status && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">الوضع: {status.mode}</h2>
                    <p className="text-gray-300 mt-1">مستوى المخاطر: {status.risk_level}</p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status.enabled ? 'bg-green-500' : 'bg-red-500'}`}>
                    <span className="text-3xl">{status.enabled ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(status.settings || {}).map(([key, value]) => (
                  <div key={key} className="bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold">
                        {key === 'auto_pricing' ? '💰 التسعير' : 
                         key === 'auto_inventory' ? '📦 المخزون' :
                         key === 'auto_dispatch' ? '🚚 التوزيع' :
                         key === 'auto_marketing' ? '📢 التسويق' :
                         key === 'auto_support' ? '💬 الدعم' : key}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${value.enabled ? 'bg-green-600' : 'bg-red-600'}`}>
                        {value.enabled ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                    {value.decisions_today !== undefined && (
                      <div className="text-sm text-gray-400">القرارات اليوم: <span className="text-white">{value.decisions_today}</span></div>
                    )}
                    {value.savings !== undefined && (
                      <div className="text-sm text-green-400">التوفير: {value.savings} ر.س</div>
                    )}
                    {value.reason && (
                      <div className="text-sm text-yellow-400">{value.reason}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span>التجاوزات اليدوية اليوم</span>
                  <span className="text-yellow-400 font-bold">{status.human_overrides_today}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              {pricingDecisions.map(decision => (
                <div key={decision.id} className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{decision.product}</h3>
                      <p className="text-gray-400 text-sm">{decision.reason}</p>
                      {decision.competitor && (
                        <p className="text-sm text-blue-400">المنافس: {decision.competitor}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded ${decision.status === 'applied' ? 'bg-green-600' : decision.status === 'pending_approval' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                      {decision.status === 'applied' ? 'تم التطبيق' : decision.status === 'pending_approval' ? 'بانتظار الموافقة' : 'مرفوض'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <span className="text-gray-400">السعر القديم:</span>
                      <span className="line-through text-red-400 mr-2">{decision.original_price} ر.س</span>
                    </div>
                    <div>
                      <span className="text-gray-400">السعر الجديد:</span>
                      <span className="text-green-400 font-bold mr-2">{decision.new_price} ر.س</span>
                    </div>
                    <div className={`${decision.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ({decision.change > 0 ? '+' : ''}{decision.change}%)
                    </div>
                  </div>
                  <div className="text-sm text-purple-400 mt-2">التأثير المتوقع: {decision.expected_impact}</div>
                  {decision.status === 'pending_approval' && (
                    <div className="mt-4 flex gap-2">
                      <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">✓ موافقة</button>
                      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">✗ رفض</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {inventoryDecisions.map(decision => (
                <div key={decision.id} className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs mb-2 inline-block ${decision.type === 'reorder' ? 'bg-blue-600' : decision.type === 'transfer' ? 'bg-purple-600' : 'bg-orange-600'}`}>
                        {decision.type === 'reorder' ? 'إعادة طلب' : decision.type === 'transfer' ? 'نقل' : 'تخفيض'}
                      </span>
                      <h3 className="font-bold text-lg">{decision.product}</h3>
                      {decision.reason && <p className="text-gray-400 text-sm">{decision.reason}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded ${decision.status === 'applied' || decision.status === 'in_progress' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                      {decision.status === 'applied' ? 'تم' : decision.status === 'in_progress' ? 'جاري' : 'بانتظار'}
                    </span>
                  </div>
                  {decision.type === 'reorder' && (
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div><span className="text-gray-400">المخزون الحالي:</span> <span className="text-red-400">{decision.current_stock}</span></div>
                      <div><span className="text-gray-400">الكمية المقترحة:</span> <span className="text-green-400">{decision.suggested_quantity}</span></div>
                      <div><span className="text-gray-400">التكلفة:</span> <span>{decision.estimated_cost?.toLocaleString()} ر.س</span></div>
                    </div>
                  )}
                  {decision.type === 'transfer' && (
                    <div className="mt-3 text-sm">
                      <span>نقل {decision.quantity} وحدة من </span>
                      <span className="text-blue-400">{decision.from_warehouse}</span>
                      <span> إلى </span>
                      <span className="text-green-400">{decision.to_warehouse}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dispatch Tab */}
          {activeTab === 'dispatch' && dispatchOptimizations && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-900 to-red-900 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">📊 الدفعة الحالية</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-gray-300">الطلبات:</span> <span className="font-bold">{dispatchOptimizations.current_batch?.orders}</span></div>
                  <div><span className="text-gray-300">السائقون:</span> <span className="font-bold">{dispatchOptimizations.current_batch?.drivers_available}</span></div>
                  <div><span className="text-gray-300">درجة التحسين:</span> <span className="font-bold text-green-400">{dispatchOptimizations.current_batch?.optimization_score}%</span></div>
                  <div><span className="text-gray-300">الوقت الموفر:</span> <span className="font-bold text-blue-400">{dispatchOptimizations.current_batch?.estimated_time_savings}</span></div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">✨ التحسينات الأخيرة</h3>
                <div className="space-y-3">
                  {dispatchOptimizations.recent_optimizations?.map(opt => (
                    <div key={opt.id} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`px-2 py-1 rounded text-xs ${opt.type === 'route_optimization' ? 'bg-blue-600' : opt.type === 'driver_reassignment' ? 'bg-purple-600' : 'bg-green-600'}`}>
                            {opt.type === 'route_optimization' ? 'تحسين مسار' : opt.type === 'driver_reassignment' ? 'إعادة تعيين' : 'تجميع'}
                          </span>
                          <p className="mt-2">
                            {opt.type === 'route_optimization' && `تحسين مسار ${opt.driver} - ${opt.orders_affected} طلبات`}
                            {opt.type === 'driver_reassignment' && `نقل الطلب ${opt.order} من ${opt.original_driver} إلى ${opt.new_driver}`}
                            {opt.type === 'batch_grouping' && `تجميع ${opt.orders_grouped} طلبات للسائق ${opt.driver}`}
                          </p>
                        </div>
                        <div className="text-green-400 font-bold">
                          {opt.savings || opt.time_saved || opt.efficiency_gain}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{dispatchOptimizations.today_summary?.total_optimizations}</div>
                  <div className="text-green-300 text-sm">تحسينات اليوم</div>
                </div>
                <div className="bg-blue-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{dispatchOptimizations.today_summary?.total_time_saved}</div>
                  <div className="text-blue-300 text-sm">وقت موفر</div>
                </div>
                <div className="bg-purple-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{dispatchOptimizations.today_summary?.fuel_saved}</div>
                  <div className="text-purple-300 text-sm">وقود موفر</div>
                </div>
                <div className="bg-orange-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{dispatchOptimizations.today_summary?.cost_saved} ر.س</div>
                  <div className="text-orange-300 text-sm">تكلفة موفرة</div>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{ticket.customer}</h3>
                      <p className="text-gray-400">المشكلة: {ticket.issue}</p>
                      <p className="text-green-400 mt-2">الحل: {ticket.resolution}</p>
                    </div>
                    <div className="text-left">
                      <div className={`px-3 py-1 rounded ${ticket.escalated ? 'bg-yellow-600' : ticket.customer_satisfied ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {ticket.escalated ? 'تم التصعيد' : ticket.customer_satisfied ? 'راضٍ' : 'معلق'}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">ثقة AI: {ticket.ai_confidence}%</div>
                      {ticket.time_to_resolve && (
                        <div className="text-sm text-blue-400">وقت الحل: {ticket.time_to_resolve}</div>
                      )}
                    </div>
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

export default AutonomousMode;