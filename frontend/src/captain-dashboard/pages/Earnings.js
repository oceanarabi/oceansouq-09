import React, { useState } from 'react';

const Earnings = () => {
  const [period, setPeriod] = useState('week');

  const earningsData = {
    today: { rides: 6, base: 280, tips: 40, bonus: 0, total: 320 },
    week: { rides: 38, base: 1800, tips: 250, bonus: 100, total: 2150 },
    month: { rides: 152, base: 7200, tips: 980, bonus: 400, total: 8580 },
  };

  const data = earningsData[period];

  const weeklyBreakdown = [
    { day: 'السبت', rides: 5, earnings: 245 },
    { day: 'الأحد', rides: 7, earnings: 385 },
    { day: 'الإثنين', rides: 4, earnings: 180 },
    { day: 'الثلاثاء', rides: 6, earnings: 320 },
    { day: 'الأربعاء', rides: 5, earnings: 275 },
    { day: 'الخميس', rides: 5, earnings: 290 },
    { day: 'الجمعة', rides: 6, earnings: 455 },
  ];

  const maxEarnings = Math.max(...weeklyBreakdown.map(d => d.earnings));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الأرباح</h1>
          <p className="text-gray-500">تتبع أرباحك ودخلك</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {[{ id: 'today', label: 'اليوم' }, { id: 'week', label: 'الأسبوع' }, { id: 'month', label: 'الشهر' }].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
        <p className="text-blue-100">إجمالي الأرباح</p>
        <p className="text-5xl font-bold mt-2">{data.total} <span className="text-2xl">ر.س</span></p>
        <p className="text-blue-200 mt-2">{data.rides} رحلة</p>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💵</span>
            <span className="text-gray-500">الأساسي</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{data.base} ر.س</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎁</span>
            <span className="text-gray-500">الإكراميات</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{data.tips} ر.س</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏆</span>
            <span className="text-gray-500">المكافآت</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.bonus} ر.س</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">أرباح الأسبوع</h2>
        <div className="flex items-end justify-between gap-4 h-48">
          {weeklyBreakdown.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex justify-center mb-2">
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                  style={{ height: `${(day.earnings / maxEarnings) * 150}px` }}
                ></div>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{day.earnings}</p>
              <p className="text-xs text-gray-500 mt-1">{day.day}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
