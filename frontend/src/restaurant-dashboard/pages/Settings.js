import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';

const Settings = () => {
  const { restaurant } = useRestaurant();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'معلومات المطعم', icon: '🍔' },
    { id: 'hours', label: 'ساعات العمل', icon: '🕒' },
    { id: 'delivery', label: 'إعدادات التوصيل', icon: '🚚' },
    { id: 'payments', label: 'المدفوعات', icon: '💳' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
        <p className="text-gray-500">إدارة إعدادات المطعم</p>
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
                  ? 'bg-orange-600 text-white'
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
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">معلومات المطعم</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🍔</span>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg">تغيير الشعار</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">اسم المطعم</label>
                  <input type="text" defaultValue={restaurant?.name || 'مطعم Ocean'} className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رقم التواصل</label>
                  <input type="tel" defaultValue="+966 50 123 4567" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">العنوان</label>
                  <input type="text" defaultValue="شارع الملك فهد، الرياض" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">وصف المطعم</label>
                  <textarea rows="3" defaultValue="مطعم متخصص في البرجر والبيتزا والمشويات" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">ساعات العمل</h2>
              <div className="space-y-4">
                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="w-24 font-medium text-gray-800 dark:text-white">{day}</span>
                    <select className="px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                    <span className="text-gray-500">إلى</span>
                    <select className="px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 mr-auto">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">مفتوح</span>
                    </label>
                  </div>
                ))}
              </div>
              <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعدادات التوصيل</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">الحد الأدنى للطلب</label>
                  <input type="number" defaultValue="25" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رسوم التوصيل</label>
                  <input type="number" defaultValue="10" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">نطاق التوصيل (كم)</label>
                  <input type="number" defaultValue="10" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">وقت التحضير (دقيقة)</label>
                  <input type="number" defaultValue="20" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعدادات المدفوعات</h2>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300">💡 سيتم تحويل أرباحك أسبوعياً إلى حسابك البنكي</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">اسم البنك</label>
                  <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                    <option>الراجحي</option>
                    <option>الأهلي</option>
                    <option>الرياض</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">رقم الآيبان</label>
                  <input type="text" placeholder="SA00 0000 0000 0000 0000 0000" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl">حفظ الحساب</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
