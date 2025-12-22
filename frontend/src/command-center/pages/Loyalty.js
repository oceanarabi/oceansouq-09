import React, { useState, useEffect } from 'react';

const Loyalty = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [members, setMembers] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${API_URL}/api/loyalty/program/overview`, { headers });
        setOverview(await res.json());
      } else if (activeTab === 'members') {
        const res = await fetch(`${API_URL}/api/loyalty/members`, { headers });
        const data = await res.json();
        setMembers(data.members || []);
      } else if (activeTab === 'installments') {
        const res = await fetch(`${API_URL}/api/loyalty/installments/active`, { headers });
        const data = await res.json();
        setInstallments(data.installments || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '🏆' },
    { id: 'members', label: 'الأعضاء', icon: '👥' },
    { id: 'installments', label: 'التقسيط', icon: '💳' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🏆 برنامج الولاء والتقسيط</h1>
        <p className="text-gray-400">إدارة النقاط والمكافآت والتقسيط</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-2">{overview.program_name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-yellow-200 text-sm">إجمالي الأعضاء</div>
                    <div className="text-2xl font-bold">{overview.total_members?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-yellow-200 text-sm">الأعضاء النشطون</div>
                    <div className="text-2xl font-bold">{overview.active_members?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-yellow-200 text-sm">نقاط اليوم</div>
                    <div className="text-2xl font-bold">{overview.points_issued_today?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-yellow-200 text-sm">مستبدلة اليوم</div>
                    <div className="text-2xl font-bold">{overview.points_redeemed_today?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Tiers */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🏅 مستويات العضوية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {overview.tiers?.map((tier, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${tier.name === 'بلاتيني' ? 'bg-gradient-to-br from-gray-600 to-gray-800' : tier.name === 'ذهبي' ? 'bg-gradient-to-br from-yellow-700 to-yellow-900' : tier.name === 'فضي' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-amber-700 to-amber-900'}`}>
                      <h4 className="font-bold text-lg mb-2">{tier.name}</h4>
                      <div className="text-2xl font-bold">{tier.members?.toLocaleString()}</div>
                      <div className="text-sm opacity-75 mt-1">من {tier.min_points?.toLocaleString()} نقطة</div>
                      <div className="mt-3 text-xs">
                        {tier.benefits?.map((b, i) => <div key={i}>✓ {b}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redemption Options */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🎁 خيارات الاستبدال</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overview.redemption_options?.map((opt, idx) => (
                    <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-bold">{opt.type}</h4>
                      <p className="text-gray-400 text-sm mt-1">{opt.conversion || `${opt.points_required} نقطة`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-right">الاسم</th>
                      <th className="p-3 text-right">البريد</th>
                      <th className="p-3 text-right">المستوى</th>
                      <th className="p-3 text-right">الرصيد</th>
                      <th className="p-3 text-right">إجمالي النقاط</th>
                      <th className="p-3 text-right">تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.slice(0, 20).map(member => (
                      <tr key={member.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-bold">{member.name}</td>
                        <td className="p-3 text-gray-400">{member.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${member.tier === 'بلاتيني' ? 'bg-gray-500' : member.tier === 'ذهبي' ? 'bg-yellow-600' : member.tier === 'فضي' ? 'bg-gray-400 text-gray-900' : 'bg-amber-700'}`}>
                            {member.tier}
                          </span>
                        </td>
                        <td className="p-3 text-green-400 font-bold">{member.points_balance?.toLocaleString()}</td>
                        <td className="p-3">{member.lifetime_points?.toLocaleString()}</td>
                        <td className="p-3 text-gray-400">{member.joined_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Installments Tab */}
          {activeTab === 'installments' && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-right">رقم التقسيط</th>
                      <th className="p-3 text-right">العميل</th>
                      <th className="p-3 text-right">المبلغ الكلي</th>
                      <th className="p-3 text-right">المدفوع</th>
                      <th className="p-3 text-right">المتبقي</th>
                      <th className="p-3 text-right">القسط الشهري</th>
                      <th className="p-3 text-right">الدفعة القادمة</th>
                      <th className="p-3 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.slice(0, 20).map(inst => (
                      <tr key={inst.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-mono text-blue-400">{inst.id}</td>
                        <td className="p-3">{inst.customer}</td>
                        <td className="p-3">{inst.total_amount?.toLocaleString()} ر.س</td>
                        <td className="p-3 text-green-400">{inst.paid_amount?.toLocaleString()} ر.س</td>
                        <td className="p-3 text-yellow-400">{inst.remaining?.toLocaleString()} ر.س</td>
                        <td className="p-3">{inst.monthly_payment?.toLocaleString()} ر.س</td>
                        <td className="p-3">{inst.next_payment_date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${inst.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {inst.status === 'active' ? 'نشط' : 'مكتمل'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Loyalty;