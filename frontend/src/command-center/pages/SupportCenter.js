import React, { useState, useEffect } from 'react';

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [callQueue, setCallQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`${API_URL}/api/support-center/dashboard`, { headers });
        setDashboard(await res.json());
      } else if (activeTab === 'tickets') {
        const res = await fetch(`${API_URL}/api/support-center/tickets`, { headers });
        const data = await res.json();
        setTickets(data.tickets || []);
      } else if (activeTab === 'chat') {
        const res = await fetch(`${API_URL}/api/support-center/chat/active`, { headers });
        const data = await res.json();
        setActiveChats(data.active_chats || []);
      } else if (activeTab === 'calls') {
        const res = await fetch(`${API_URL}/api/support-center/calls/queue`, { headers });
        setCallQueue(await res.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'tickets', label: 'التذاكر', icon: '🎫' },
    { id: 'chat', label: 'الدردشة الحية', icon: '💬' },
    { id: 'calls', label: 'المكالمات', icon: '📞' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🏢 مركز الدعم</h1>
        <p className="text-gray-400">إدارة خدمة العملاء والدعم الفني</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl">
                  <div className="text-blue-200 text-sm">التذاكر اليوم</div>
                  <div className="text-3xl font-bold mt-1">{dashboard.overview?.total_tickets_today}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-4 rounded-xl">
                  <div className="text-orange-200 text-sm">مفتوحة</div>
                  <div className="text-3xl font-bold mt-1">{dashboard.overview?.open_tickets}</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl">
                  <div className="text-green-200 text-sm">تم حلها</div>
                  <div className="text-3xl font-bold mt-1">{dashboard.overview?.resolved_today}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl">
                  <div className="text-purple-200 text-sm">رضا العملاء</div>
                  <div className="text-3xl font-bold mt-1">⭐ {dashboard.overview?.customer_satisfaction}</div>
                </div>
              </div>

              {/* By Channel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4">📡 حسب القناة</h3>
                  <div className="space-y-3">
                    {Object.entries(dashboard.by_channel || {}).map(([channel, data]) => (
                      <div key={channel} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                        <span className="flex items-center gap-2">
                          <span>{channel === 'chat' ? '💬' : channel === 'phone' ? '📞' : channel === 'email' ? '📧' : '📱'}</span>
                          <span>{channel === 'chat' ? 'الدردشة' : channel === 'phone' ? 'الهاتف' : channel === 'email' ? 'البريد' : 'السوشيال'}</span>
                        </span>
                        <div className="text-left">
                          <span className="font-bold">{data.total}</span>
                          <span className="text-yellow-400 text-sm mr-2">({data.waiting || data.in_queue || data.pending} بانتظار)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4">📊 حسب التصنيف</h3>
                  <div className="space-y-2">
                    {dashboard.by_category?.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.category}</span>
                          <span>{cat.count} ({cat.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: `${cat.percentage}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agents Status */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">👥 فريق الدعم</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">{dashboard.agents?.online}</div>
                    <div className="text-gray-400">متصلون</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400">{dashboard.agents?.busy}</div>
                    <div className="text-gray-400">مشغولون</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400">{dashboard.agents?.available}</div>
                    <div className="text-gray-400">متاحون</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-gray-400">{dashboard.agents?.offline}</div>
                    <div className="text-gray-400">غير متصلين</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-right">رقم التذكرة</th>
                      <th className="p-3 text-right">العميل</th>
                      <th className="p-3 text-right">الموضوع</th>
                      <th className="p-3 text-right">التصنيف</th>
                      <th className="p-3 text-right">الأولوية</th>
                      <th className="p-3 text-right">الحالة</th>
                      <th className="p-3 text-right">المعين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 20).map(ticket => (
                      <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-mono text-blue-400">{ticket.id}</td>
                        <td className="p-3">{ticket.customer}</td>
                        <td className="p-3">{ticket.subject}</td>
                        <td className="p-3">{ticket.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${ticket.priority === 'urgent' ? 'bg-red-600' : ticket.priority === 'high' ? 'bg-orange-600' : ticket.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                            {ticket.priority === 'urgent' ? 'عاجل' : ticket.priority === 'high' ? 'عالي' : ticket.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'open' ? 'bg-blue-600' : ticket.status === 'in_progress' ? 'bg-yellow-600' : ticket.status === 'resolved' ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {ticket.status === 'open' ? 'مفتوح' : ticket.status === 'in_progress' ? 'جاري' : ticket.status === 'resolved' ? 'محلول' : 'مغلق'}
                          </span>
                        </td>
                        <td className="p-3">{ticket.assigned_to || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {activeChats.map(chat => (
                <div key={chat.id} className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{chat.customer}</h3>
                      <p className="text-gray-400">{chat.topic}</p>
                    </div>
                    <span className={`px-3 py-1 rounded ${chat.sentiment === 'positive' ? 'bg-green-600' : chat.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'}`}>
                      {chat.sentiment === 'positive' ? '😊 إيجابي' : chat.sentiment === 'negative' ? '😟 سلبي' : '😐 محايد'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-400">
                    <span>👤 {chat.agent}</span>
                    <span>⏱️ {chat.duration}</span>
                    <span>💬 {chat.messages_count} رسائل</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calls Tab */}
          {activeTab === 'calls' && callQueue && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{callQueue.active_calls}</div>
                  <div className="text-blue-300 text-sm">مكالمات نشطة</div>
                </div>
                <div className="bg-orange-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{callQueue.queue?.length || 0}</div>
                  <div className="text-orange-300 text-sm">في الانتظار</div>
                </div>
                <div className="bg-green-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{callQueue.available_agents}</div>
                  <div className="text-green-300 text-sm">موظفون متاحون</div>
                </div>
                <div className="bg-purple-900 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold">{callQueue.service_level}</div>
                  <div className="text-purple-300 text-sm">مستوى الخدمة</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">📞 طابور الانتظار</h3>
                <div className="space-y-3">
                  {callQueue.queue?.map((call, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center font-bold">{call.position}</span>
                        <div>
                          <div className="font-bold">{call.customer}</div>
                          <div className="text-sm text-gray-400">{call.reason}</div>
                        </div>
                      </div>
                      <div className="text-yellow-400">⏱️ {call.wait_time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupportCenter;