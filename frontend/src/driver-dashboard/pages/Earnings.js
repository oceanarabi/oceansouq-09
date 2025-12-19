import React, { useState } from 'react';

const Earnings = () => {
  const [period, setPeriod] = useState('week');

  const earningsData = {
    today: { deliveries: 8, base: 180, tips: 45, bonus: 20, total: 245 },
    week: { deliveries: 42, base: 840, tips: 235, bonus: 100, total: 1175 },
    month: { deliveries: 168, base: 3360, tips: 890, bonus: 400, total: 4650 },
  };

  const data = earningsData[period];

  const weeklyBreakdown = [
    { day: 'السبت', deliveries: 6, earnings: 145 },
    { day: 'الأحد', deliveries: 8, earnings: 195 },
    { day: 'الإثنين', deliveries: 5, earnings: 120 },
    { day: 'الثلاثاء', deliveries: 7, earnings: 175 },
    { day: 'الأربعاء', deliveries: 4, earnings: 95 },
    { day: 'الخميس', deliveries: 6, earnings: 150 },
    { day: 'الجمعة', deliveries: 6, earnings: 295 },
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
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-8 text-white">
        <p className="text-green-100">إجمالي الأرباح</p>
        <p className="text-5xl font-bold mt-2">{data.total} <span className="text-2xl">ر.س</span></p>
        <p className="text-green-200 mt-2">{data.deliveries} توصيلة</p>
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
          {weeklyBreakdown.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex justify-center mb-2">
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all"
                  style={{ height: `${(day.earnings / maxEarnings) * 150}px` }}
                ></div>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{day.earnings}</p>
              <p className="text-xs text-gray-500 mt-1">{day.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🏦</span>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">التحويل الأسبوعي</h3>
            <p className="text-gray-600 dark:text-gray-300">سيتم تحويل أرباحك كل يوم أحد إلى حسابك البنكي</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
