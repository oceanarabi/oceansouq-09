import React, { useState } from 'react';

const Analytics = () => {
  const [period, setPeriod] = useState('month');

  const stats = {
    totalRevenue: 485000,
    avgOccupancy: 76,
    totalBookings: 342,
    avgStay: 2.8,
    repeatGuests: 45
  };

  const monthlyData = [
    { month: 'يناير', revenue: 85000, occupancy: 82 },
    { month: 'فبراير', revenue: 72000, occupancy: 75 },
    { month: 'مارس', revenue: 95000, occupancy: 88 },
    { month: 'أبريل', revenue: 68000, occupancy: 70 },
    { month: 'مايو', revenue: 78000, occupancy: 72 },
    { month: 'يونيو', revenue: 87000, occupancy: 78 },
  ];

  const roomTypeRevenue = [
    { type: 'جناح ملكي', revenue: 125000, bookings: 50, percentage: 26 },
    { type: 'جناح', revenue: 98000, bookings: 82, percentage: 20 },
    { type: 'إطلالة بحر', revenue: 85000, bookings: 95, percentage: 18 },
    { type: 'مزدوجة', revenue: 102000, bookings: 170, percentage: 21 },
    { type: 'قياسية', revenue: 75000, bookings: 188, percentage: 15 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التحليلات</h1>
          <p className="text-gray-500">إحصائيات الفندق</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {[{ id: 'week', label: 'الأسبوع' }, { id: 'month', label: 'الشهر' }, { id: 'year', label: 'السنة' }].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p.id
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
          <p className="text-2xl font-bold mt-1">{stats.totalRevenue.toLocaleString()} ر.س</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">متوسط الإشغال</p>
          <p className="text-2xl font-bold mt-1">{stats.avgOccupancy}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm">إجمالي الحجوزات</p>
          <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <p className="text-yellow-100 text-sm">متوسط الإقامة</p>
          <p className="text-2xl font-bold mt-1">{stats.avgStay} ليلة</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <p className="text-pink-100 text-sm">ضيوف عائدون</p>
          <p className="text-2xl font-bold mt-1">{stats.repeatGuests}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">الإيرادات الشهرية</h2>
          <div className="flex items-end justify-between gap-4 h-48">
            {monthlyData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all"
                  style={{ height: `${(item.revenue / maxRevenue) * 150}px` }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{item.month}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">إيرادات حسب نوع الغرفة</h2>
          <div className="space-y-4">
            {roomTypeRevenue.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-800 dark:text-white font-medium">{item.type}</span>
                  <span className="text-green-600 font-bold">{item.revenue.toLocaleString()} ر.س</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.bookings} حجز</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
