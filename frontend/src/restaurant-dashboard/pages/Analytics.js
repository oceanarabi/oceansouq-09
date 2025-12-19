import React, { useState } from 'react';

const Analytics = () => {
  const [period, setPeriod] = useState('week');

  const stats = {
    totalOrders: 324,
    totalRevenue: 24500,
    avgOrderValue: 75,
    cancelRate: 3.2
  };

  const topItems = [
    { name: 'برجر دجاج', orders: 85, revenue: 2125 },
    { name: 'بيتزا بيبروني', orders: 62, revenue: 3410 },
    { name: 'شاورما لحم', orders: 58, revenue: 1044 },
    { name: 'وجبة عائلية', orders: 45, revenue: 8100 },
  ];

  const hourlyData = [
    { hour: '10:00', orders: 5 },
    { hour: '11:00', orders: 12 },
    { hour: '12:00', orders: 28 },
    { hour: '13:00', orders: 35 },
    { hour: '14:00', orders: 22 },
    { hour: '15:00', orders: 15 },
    { hour: '16:00', orders: 8 },
    { hour: '17:00', orders: 12 },
    { hour: '18:00', orders: 25 },
    { hour: '19:00', orders: 42 },
    { hour: '20:00', orders: 48 },
    { hour: '21:00', orders: 38 },
    { hour: '22:00', orders: 22 },
    { hour: '23:00', orders: 12 },
  ];

  const maxOrders = Math.max(...hourlyData.map(d => d.orders));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التحليلات</h1>
          <p className="text-gray-500">إحصائيات المطعم</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {[{ id: 'today', label: 'اليوم' }, { id: 'week', label: 'الأسبوع' }, { id: 'month', label: 'الشهر' }].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p.id
                  ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalOrders}</p>
          <p className="text-green-500 text-sm mt-1">↑ 12% من الأسبوع الماضي</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalRevenue} ر.س</p>
          <p className="text-green-500 text-sm mt-1">↑ 8% من الأسبوع الماضي</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">متوسط قيمة الطلب</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgOrderValue} ر.س</p>
          <p className="text-green-500 text-sm mt-1">↑ 5% من الأسبوع الماضي</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">نسبة الإلغاء</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.cancelRate}%</p>
          <p className="text-red-500 text-sm mt-1">↓ 2% من الأسبوع الماضي</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">الطلبات حسب الساعة</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {hourlyData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t transition-all"
                  style={{ height: `${(item.orders / maxOrders) * 150}px` }}
                ></div>
                <p className="text-xs text-gray-500 mt-2 -rotate-45">{item.hour}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">أكثر الأصناف مبيعاً</h2>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center font-bold text-orange-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.orders} طلب</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{item.revenue} ر.س</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
