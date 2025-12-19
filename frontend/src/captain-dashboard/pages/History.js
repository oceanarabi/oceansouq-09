import React from 'react';

const History = () => {
  const history = [
    { date: '2024-01-15', rides: 6, earnings: 320, hours: 5.5, distance: 85 },
    { date: '2024-01-14', rides: 7, earnings: 385, hours: 6.0, distance: 102 },
    { date: '2024-01-13', rides: 5, earnings: 275, hours: 4.5, distance: 68 },
    { date: '2024-01-12', rides: 8, earnings: 420, hours: 7.0, distance: 125 },
    { date: '2024-01-11', rides: 4, earnings: 180, hours: 3.5, distance: 45 },
    { date: '2024-01-10', rides: 6, earnings: 320, hours: 5.0, distance: 78 },
    { date: '2024-01-09', rides: 5, earnings: 250, hours: 4.0, distance: 62 },
  ];

  const totalRides = history.reduce((sum, d) => sum + d.rides, 0);
  const totalEarnings = history.reduce((sum, d) => sum + d.earnings, 0);
  const totalHours = history.reduce((sum, d) => sum + d.hours, 0);
  const totalDistance = history.reduce((sum, d) => sum + d.distance, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">السجل</h1>
        <p className="text-gray-500">سجل عملك اليومي</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">إجمالي الرحلات (7 أيام)</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{totalRides}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">إجمالي الأرباح</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalEarnings} ر.س</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">ساعات العمل</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalHours.toFixed(1)} ساعة</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">المسافة المقطوعة</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{totalDistance} كم</p>
        </div>
      </div>

      {/* Daily History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">السجل اليومي</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الرحلات</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المسافة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">ساعات العمل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الأرباح</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المتوسط/رحلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                    {new Date(day.date).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {day.rides} رحلة
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{day.distance} كم</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{day.hours} ساعة</td>
                  <td className="px-6 py-4 font-bold text-green-600">{day.earnings} ر.س</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {(day.earnings / day.rides).toFixed(0)} ر.س/رحلة
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
