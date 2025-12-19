import React, { useState } from 'react';

const Orders = () => {
  const [filter, setFilter] = useState('all');

  const orders = [
    { id: 'FO-001', customer: 'أحمد محمد', items: ['برجر دجاج', 'بطاطس'], status: 'completed', total: 45, date: '2024-01-15 14:30' },
    { id: 'FO-002', customer: 'سارة علي', items: ['بيتزا كبيرة'], status: 'preparing', total: 65, date: '2024-01-15 14:25' },
    { id: 'FO-003', customer: 'محمد خالد', items: ['شاورما لحم', 'عصير'], status: 'ready', total: 38, date: '2024-01-15 14:20' },
    { id: 'FO-004', customer: 'فاطمة أحمد', items: ['مشاوي مشكلة'], status: 'cancelled', total: 120, date: '2024-01-15 14:15' },
    { id: 'FO-005', customer: 'عبدالله سعود', items: ['وجبة عائلية'], status: 'completed', total: 180, date: '2024-01-15 13:45' },
  ];

  const statusConfig = {
    pending: { label: 'جديد', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    preparing: { label: 'قيد التحضير', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    ready: { label: 'جاهز', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' },
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة الطلبات</h1>
          <p className="text-gray-500">جميع طلبات المطعم</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'preparing', 'ready', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'الكل' : statusConfig[f]?.label}
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الأصناف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الوقت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{order.items.join(', ')}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{order.total} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.color}`}>
                      {statusConfig[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">عرض التفاصيل</button>
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

export default Orders;
