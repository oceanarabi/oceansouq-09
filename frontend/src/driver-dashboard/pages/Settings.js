import React, { useState } from 'react';
import { useDriver } from '../contexts/DriverContext';

const Settings = () => {
  const { driver } = useDriver();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: '👤' },
    { id: 'vehicle', label: 'المركبة', icon: '🚗' },
    { id: 'documents', label: 'الوثائق', icon: '📄' },
    { id: 'bank', label: 'الحساب البنكي', icon: '🏦' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
        <p className="text-gray-500">إدارة حسابك ومعلوماتك</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">الملف الشخصي</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg">تغيير الصورة</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">الاسم الكامل</label>
                  <input type="text" defaultValue={driver?.name || 'محمد أحمد'} className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رقم الجوال</label>
                  <input type="tel" defaultValue="+966 50 123 4567" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">البريد الإلكتروني</label>
                  <input type="email" defaultValue={driver?.email || 'driver@ocean.com'} className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">المدينة</label>
                  <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                    <option>الرياض</option>
                    <option>جدة</option>
                    <option>الدمام</option>
                  </select>
                </div>
              </div>
              <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">معلومات المركبة</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">نوع المركبة</label>
                  <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                    <option>سيارة</option>
                    <option>دراجة نارية</option>
                    <option>دراجة هوائية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">الماركة والموديل</label>
                  <input type="text" defaultValue="تويوتا كورولا 2022" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رقم اللوحة</label>
                  <input type="text" defaultValue="أ ب ت 1234" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">لون المركبة</label>
                  <input type="text" defaultValue="أبيض" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">الوثائق المطلوبة</h2>
              <div className="space-y-4">
                {[
                  { name: 'رخصة القيادة', status: 'verified', expiry: '2025-06-15' },
                  { name: 'استمارة السيارة', status: 'verified', expiry: '2024-12-01' },
                  { name: 'التأمين', status: 'pending', expiry: '-' },
                  { name: 'الهوية الوطنية', status: 'verified', expiry: '2028-03-20' },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{doc.name}</p>
                        <p className="text-sm text-gray-500">انتهاء: {doc.expiry}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status === 'verified' ? '✓ موثق' : '⏳ قيد المراجعة'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">الحساب البنكي</h2>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300">💡 سيتم تحويل أرباحك أسبوعياً إلى هذا الحساب</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">اسم البنك</label>
                  <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                    <option>الراجحي</option>
                    <option>الأهلي</option>
                    <option>الرياض</option>
                    <option>سامبا</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رقم الآيبان</label>
                  <input type="text" placeholder="SA00 0000 0000 0000 0000 0000" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl">حفظ الحساب</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعدادات الإشعارات</h2>
              <div className="space-y-4">
                {[
                  { label: 'طلبات جديدة', desc: 'إشعار عند توفر طلب جديد', enabled: true },
                  { label: 'تحديثات الأرباح', desc: 'إشعار أسبوعي بملخص الأرباح', enabled: true },
                  { label: 'العروض والمكافآت', desc: 'إشعارات عن العروض الخاصة', enabled: false },
                  { label: 'تحديثات التطبيق', desc: 'إشعارات عن الميزات الجديدة', enabled: false },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
