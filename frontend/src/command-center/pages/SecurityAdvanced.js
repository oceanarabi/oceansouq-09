import React, { useState, useEffect } from 'react';

const SecurityAdvanced = () => {
  const [activeTab, setActiveTab] = useState('2fa');
  const [twoFAStatus, setTwoFAStatus] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [ddosStatus, setDdosStatus] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === '2fa') {
        const res = await fetch(`${API_URL}/api/security-advanced/2fa/status`, { headers });
        setTwoFAStatus(await res.json());
      } else if (activeTab === 'audit') {
        const res = await fetch(`${API_URL}/api/security-advanced/audit-log`, { headers });
        const data = await res.json();
        setAuditLog(data.logs || []);
      } else if (activeTab === 'ddos') {
        const res = await fetch(`${API_URL}/api/security-advanced/ddos/status`, { headers });
        setDdosStatus(await res.json());
      } else if (activeTab === 'compliance') {
        const res = await fetch(`${API_URL}/api/security-advanced/compliance/status`, { headers });
        setCompliance(await res.json());
      } else if (activeTab === 'sessions') {
        const res = await fetch(`${API_URL}/api/security-advanced/sessions/active`, { headers });
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: '2fa', label: 'المصادقة الثنائية', icon: '🔐' },
    { id: 'audit', label: 'سجل المراجعة', icon: '📜' },
    { id: 'ddos', label: 'حماية DDoS', icon: '🛡️' },
    { id: 'compliance', label: 'الامتثال', icon: '✅' },
    { id: 'sessions', label: 'الجلسات', icon: '💻' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔒 الأمان المتقدم</h1>
        <p className="text-gray-400">إعدادات الأمان والخصوصية والامتثال</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>
          {/* 2FA Tab */}
          {activeTab === '2fa' && twoFAStatus && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-900 to-teal-900 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">المصادقة الثنائية</h2>
                    <p className="text-green-200">{twoFAStatus.stats?.total_2fa_users?.toLocaleString()} مستخدم ({twoFAStatus.stats?.percentage}%)</p>
                  </div>
                  <div className="text-4xl">{twoFAStatus.enabled ? '✅' : '❌'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {twoFAStatus.methods?.map((method, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${method.enabled ? 'bg-green-900/30' : 'bg-gray-800'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">
                        {method.type === 'sms' ? '📱 SMS' :
                         method.type === 'email' ? '📧 البريد' :
                         method.type === 'authenticator' ? '🔑 التطبيق' : '👆 البصمة'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${method.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {method.enabled ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{method.users_count?.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">مستخدم</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">إلزامية 2FA حسب الدور</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(twoFAStatus.enforcement || {}).map(([role, status]) => (
                    <div key={role} className="bg-gray-700 p-3 rounded-lg">
                      <div className="font-bold capitalize">{role === 'admin' ? 'المدير' : role === 'seller' ? 'البائع' : role === 'driver' ? 'السائق' : 'العميل'}</div>
                      <div className={`text-sm ${status === 'required' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {status === 'required' ? 'إلزامي' : 'اختياري'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-3 text-right">الوقت</th>
                      <th className="p-3 text-right">المستخدم</th>
                      <th className="p-3 text-right">الإجراء</th>
                      <th className="p-3 text-right">المورد</th>
                      <th className="p-3 text-right">IP</th>
                      <th className="p-3 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.slice(0, 30).map(log => (
                      <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleString('ar')}</td>
                        <td className="p-3">{log.user}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${log.action === 'login' ? 'bg-green-600' : log.action === 'delete' ? 'bg-red-600' : log.action === 'update' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">{log.resource}</td>
                        <td className="p-3 font-mono text-xs">{log.ip_address}</td>
                        <td className="p-3">
                          <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {log.status === 'success' ? '✓' : '✗'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DDoS Tab */}
          {activeTab === 'ddos' && ddosStatus && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${ddosStatus.current_status === 'normal' ? 'bg-gradient-to-r from-green-900 to-teal-900' : 'bg-gradient-to-r from-red-900 to-orange-900'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">حالة النظام</h2>
                    <p>{ddosStatus.current_status === 'normal' ? '🟢 طبيعي' : '🔴 تحت الهجوم'}</p>
                  </div>
                  <div className="text-4xl">{ddosStatus.protection_enabled ? '🛡️' : '⚠️'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-400">{ddosStatus.traffic?.requests_per_second}</div>
                  <div className="text-gray-400 text-sm">طلب/ثانية</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-yellow-400">{ddosStatus.traffic?.peak_today}</div>
                  <div className="text-gray-400 text-sm">الذروة اليوم</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-red-400">{ddosStatus.traffic?.blocked_today}</div>
                  <div className="text-gray-400 text-sm">محظورة اليوم</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-400">{ddosStatus.blocked_ips_count}</div>
                  <div className="text-gray-400 text-sm">IPs محظورة</div>
                </div>
              </div>

              {ddosStatus.last_attack && (
                <div className="bg-red-900/30 border border-red-800 p-6 rounded-xl">
                  <h3 className="font-bold mb-4">⚠️ آخر هجوم</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><span className="text-gray-400">التاريخ:</span> <span>{ddosStatus.last_attack.date}</span></div>
                    <div><span className="text-gray-400">النوع:</span> <span>{ddosStatus.last_attack.type}</span></div>
                    <div><span className="text-gray-400">الذروة:</span> <span>{ddosStatus.last_attack.peak_rps} req/s</span></div>
                    <div><span className="text-gray-400">المدة:</span> <span>{ddosStatus.last_attack.duration}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && compliance && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">GDPR</h3>
                    <span className={`px-3 py-1 rounded ${compliance.gdpr?.compliant ? 'bg-green-600' : 'bg-red-600'}`}>
                      {compliance.gdpr?.compliant ? 'ممتثل' : 'غير ممتثل'}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-center text-green-400 mb-2">{compliance.gdpr?.score}%</div>
                  <div className="text-gray-400 text-sm text-center">آخر تدقيق: {compliance.gdpr?.last_audit}</div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">PDPL السعودي</h3>
                    <span className={`px-3 py-1 rounded ${compliance.pdpl?.compliant ? 'bg-green-600' : 'bg-red-600'}`}>
                      {compliance.pdpl?.compliant ? 'ممتثل' : 'غير ممتثل'}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-center text-green-400 mb-2">{compliance.pdpl?.score}%</div>
                  <div className="text-gray-400 text-sm text-center">إقامة البيانات: {compliance.pdpl?.saudi_data_residency ? 'داخل السعودية ✓' : 'خارجية'}</div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">PCI DSS</h3>
                    <span className={`px-3 py-1 rounded ${compliance.pci_dss?.compliant ? 'bg-green-600' : 'bg-red-600'}`}>
                      Level {compliance.pci_dss?.level}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-center text-green-400 mb-2">✓</div>
                  <div className="text-gray-400 text-sm text-center">آخر تدقيق: {compliance.pci_dss?.last_audit}</div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="font-bold mb-4">🗑️ سياسة الاحتفاظ بالبيانات</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-400">المدة</div>
                    <div className="text-xl font-bold">{compliance.data_retention?.policy}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-400">الحذف التلقائي</div>
                    <div className="text-xl font-bold">{compliance.data_retention?.auto_deletion ? 'مفعل' : 'معطل'}</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-400">بانتظار الحذف</div>
                    <div className="text-xl font-bold">{compliance.data_retention?.records_pending_deletion?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className={`bg-gray-800 p-4 rounded-xl ${session.current ? 'border-2 border-green-500' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{session.device}</span>
                        {session.current && <span className="bg-green-600 px-2 py-1 rounded text-xs">الجلسة الحالية</span>}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">📍 {session.location}</p>
                      <p className="text-gray-400 text-sm">IP: {session.ip}</p>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-400">آخر نشاط</div>
                      <div>{new Date(session.last_activity).toLocaleString('ar')}</div>
                      {!session.current && (
                        <button className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">إنهاء</button>
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

export default SecurityAdvanced;