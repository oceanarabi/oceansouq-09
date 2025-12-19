import React from 'react';

const History = () => {
  const history = [
    { date: '2024-01-15', deliveries: 8, earnings: 245, hours: 6.5 },
    { date: '2024-01-14', deliveries: 6, earnings: 195, hours: 5.0 },
    { date: '2024-01-13', deliveries: 10, earnings: 320, hours: 8.0 },
    { date: '2024-01-12', deliveries: 5, earnings: 145, hours: 4.0 },
    { date: '2024-01-11', deliveries: 7, earnings: 210, hours: 5.5 },
    { date: '2024-01-10', deliveries: 9, earnings: 285, hours: 7.0 },
    { date: '2024-01-09', deliveries: 4, earnings: 120, hours: 3.5 },
  ];

  const totalDeliveries = history.reduce((sum, d) => sum + d.deliveries, 0);
  const totalEarnings = history.reduce((sum, d) => sum + d.earnings, 0);
  const totalHours = history.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">السجل</h1>
        <p className="text-gray-500">سجل عملك اليومي</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">إجمالي التوصيلات (7 أيام)</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{totalDeliveries}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">إجمالي الأرباح</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalEarnings} ر.س</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500">ساعات العمل</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalHours.toFixed(1)} ساعة</p>
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التوصيلات</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">ساعات العمل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الأرباح</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المتوسط/ساعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                    {new Date(day.date).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      {day.deliveries} توصيلة
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{day.hours} ساعة</td>
                  <td className="px-6 py-4 font-bold text-green-600">{day.earnings} ر.س</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {(day.earnings / day.hours).toFixed(0)} ر.س/ساعة
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
