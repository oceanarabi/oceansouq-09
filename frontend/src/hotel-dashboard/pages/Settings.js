import React, { useState } from 'react';
import { useHotel } from '../contexts/HotelContext';

const Settings = () => {
  const { hotel, logout } = useHotel();
  const [notifications, setNotifications] = useState({
    newBookings: true,
    cancellations: true,
    reviews: true,
    reports: false
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
        <p className="text-gray-500">إدارة حساب الفندق والتفضيلات</p>
      </div>

      {/* Hotel Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">معلومات الفندق</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl text-white">
              🏨
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{hotel?.name || 'فندق Ocean'}</h3>
              <p className="text-gray-500">{hotel?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">⭐ {hotel?.rating || '4.6'}</span>
                <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full">🏨 {hotel?.stars || 5} نجوم</span>
                <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">📍 {hotel?.city || 'الرياض'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">تفاصيل الفندق</h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">اسم الفندق</label>
            <input
              type="text"
              value={hotel?.name || 'فندق Ocean الرياض'}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">المدينة</label>
            <input
              type="text"
              value={hotel?.city || 'الرياض'}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">عدد الغرف</label>
            <input
              type="text"
              value={hotel?.rooms_count || '120'}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-2">التصنيف</label>
            <input
              type="text"
              value={`${hotel?.stars || 5} نجوم`}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">الإشعارات</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'newBookings', label: 'حجوزات جديدة', desc: 'تنبيه عند وصول حجز جديد' },
            { key: 'cancellations', label: 'إلغاءات', desc: 'تنبيه عند إلغاء حجز' },
            { key: 'reviews', label: 'تقييمات جديدة', desc: 'تنبيه عند وصول تقييم جديد' },
            { key: 'reports', label: 'التقارير', desc: 'تقارير يومية وأسبوعية' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  notifications[item.key] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow ${
                    notifications[item.key] ? 'right-1' : 'left-1'
                  }`}
                ></span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Support & Logout */}
      <div className="grid md:grid-cols-2 gap-4">
        <button className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4">
          <span className="text-3xl">📞</span>
          <div className="text-right">
            <p className="font-bold text-gray-800 dark:text-white">الدعم الفني</p>
            <p className="text-sm text-gray-500">تواصل معنا للمساعدة</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-4 border border-red-200 dark:border-red-800"
        >
          <span className="text-3xl">🚪</span>
          <div className="text-right">
            <p className="font-bold text-red-600">تسجيل الخروج</p>
            <p className="text-sm text-red-400">الخروج من الحساب</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Settings;
