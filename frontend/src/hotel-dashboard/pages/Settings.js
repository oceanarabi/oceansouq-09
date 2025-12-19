import React, { useState } from 'react';
import { useHotel } from '../contexts/HotelContext';

const Settings = () => {
  const { hotel } = useHotel();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'معلومات الفندق', icon: '🏨' },
    { id: 'rooms', label: 'إعدادات الغرف', icon: '🛏️' },
    { id: 'pricing', label: 'التسعير', icon: '💰' },
    { id: 'policies', label: 'السياسات', icon: '📄' },
    { id: 'bank', label: 'الحساب البنكي', icon: '🏦' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
        <p className="text-gray-500">إدارة إعدادات الفندق</p>
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
                  ? 'bg-purple-600 text-white'
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
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">معلومات الفندق</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🏨</span>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">تغيير الشعار</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">اسم الفندق</label>
                  <input type="text" defaultValue={hotel?.name || 'فندق Ocean'} className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">عدد النجوم</label>
                  <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                    <option>5 نجوم</option>
                    <option>4 نجوم</option>
                    <option>3 نجوم</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">العنوان</label>
                  <input type="text" defaultValue="شارع الكورنيش، جدة" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-500 mb-2">وصف الفندق</label>
                  <textarea rows="3" defaultValue="فندق 5 نجوم على البحر مباشرة مع إطلالات خلابة" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعدادات الغرف</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">وقت تسجيل الدخول</label>
                  <input type="time" defaultValue="14:00" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">وقت تسجيل الخروج</label>
                  <input type="time" defaultValue="12:00" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">الحد الأقصى للضيوف</label>
                  <input type="number" defaultValue="4" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">عمر الطفل (مجاني)</label>
                  <input type="number" defaultValue="6" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">إعدادات التسعير</h2>
              <div className="space-y-4">
                {[
                  { type: 'قياسية', basePrice: 400 },
                  { type: 'مزدوجة', basePrice: 600 },
                  { type: 'جناح', basePrice: 1200 },
                  { type: 'جناح ملكي', basePrice: 2500 },
                ].map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="font-medium text-gray-800 dark:text-white">{room.type}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue={room.basePrice} className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                      <span className="text-gray-500">ر.س / ليلة</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">حفظ الأسعار</button>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">سياسات الفندق</h2>
              <div className="space-y-4">
                {[
                  { label: 'سياسة الإلغاء', options: ['مرنة', 'متوسطة', 'صارمة'] },
                  { label: 'الدفع المسبق', options: ['كامل', '50%', 'عند الوصول'] },
                  { label: 'الحيوانات الأليفة', options: ['مسموح', 'غير مسموح'] },
                  { label: 'التدخين', options: ['مسموح', 'غير مسموح', 'غرف مخصصة'] },
                ].map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="font-medium text-gray-800 dark:text-white">{policy.label}</span>
                    <select className="px-4 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                      {policy.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">حفظ السياسات</button>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">الحساب البنكي</h2>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300">💡 سيتم تحويل إيراداتك أسبوعياً إلى هذا الحساب</p>
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
              <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl">حفظ الحساب</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
