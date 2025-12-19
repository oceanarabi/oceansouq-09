import React, { useState } from 'react';
import { useDriver } from '../contexts/DriverContext';

const Deliveries = () => {
  const { isOnline } = useDriver();
  const [filter, setFilter] = useState('all');

  const deliveries = [
    { id: 'DEL-001', restaurant: 'البيك', customer: 'أحمد محمد', status: 'delivered', amount: 45, date: '2024-01-15', time: '14:30', distance: '3.2 كم', tip: 5 },
    { id: 'DEL-002', restaurant: 'كودو', customer: 'سارة علي', status: 'delivered', amount: 38, date: '2024-01-15', time: '13:15', distance: '2.1 كم', tip: 0 },
    { id: 'DEL-003', restaurant: 'ماما نورة', customer: 'محمد خالد', status: 'cancelled', amount: 65, date: '2024-01-15', time: '12:00', distance: '4.5 كم', tip: 0 },
    { id: 'DEL-004', restaurant: 'هرفي', customer: 'فاطمة أحمد', status: 'delivered', amount: 28, date: '2024-01-14', time: '20:45', distance: '1.8 كم', tip: 3 },
    { id: 'DEL-005', restaurant: 'ماكدونالدز', customer: 'عبدالله سعود', status: 'delivered', amount: 52, date: '2024-01-14', time: '19:30', distance: '2.9 كم', tip: 10 },
  ];

  const filteredDeliveries = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);

  const statusColors = {
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const statusLabels = {
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    in_progress: 'جاري',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التوصيلات</h1>
          <p className="text-gray-500">سجل جميع توصيلاتك</p>
        </div>
        <div className="flex gap-2">
          {['all', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'الكل' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المطعم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المسافة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إكرامية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{delivery.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍔</span>
                      <span className="text-gray-800 dark:text-white">{delivery.restaurant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{delivery.customer}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{delivery.distance}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{delivery.amount} ر.س</td>
                  <td className="px-6 py-4">
                    {delivery.tip > 0 ? (
                      <span className="text-yellow-600 font-bold">+{delivery.tip} ر.س</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[delivery.status]}`}>
                      {statusLabels[delivery.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{delivery.date} - {delivery.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
