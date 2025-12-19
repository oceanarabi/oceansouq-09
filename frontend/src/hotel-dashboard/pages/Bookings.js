import React, { useState } from 'react';

const Bookings = () => {
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 'BK-001', guest: 'أحمد السعيد', room: '501', type: 'جناح ملكي', checkIn: '2024-01-15', checkOut: '2024-01-18', nights: 3, status: 'checked_in', total: 4500 },
    { id: 'BK-002', guest: 'سارة العلي', room: '302', type: 'غرفة مزدوجة', checkIn: '2024-01-16', checkOut: '2024-01-18', nights: 2, status: 'confirmed', total: 1200 },
    { id: 'BK-003', guest: 'محمد القحطاني', room: '205', type: 'إطلالة بحر', checkIn: '2024-01-17', checkOut: '2024-01-20', nights: 3, status: 'pending', total: 2700 },
    { id: 'BK-004', guest: 'نورة الشمري', room: '415', type: 'جناح عائلي', checkIn: '2024-01-14', checkOut: '2024-01-15', nights: 1, status: 'checked_out', total: 1800 },
    { id: 'BK-005', guest: 'خالد العتيبي', room: '108', type: 'قياسية', checkIn: '2024-01-18', checkOut: '2024-01-19', nights: 1, status: 'cancelled', total: 400 },
  ];

  const statusConfig = {
    pending: { label: 'بانتظار التأكيد', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    checked_in: { label: 'مسجل دخول', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    checked_out: { label: 'غادر', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة الحجوزات</h1>
          <p className="text-gray-500">جميع حجوزات الفندق</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2">
          <span>+</span> حجز جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'الكل' : statusConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الحجز</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">النزيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الغرفة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الوصول</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المغادرة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الليالي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span className="text-gray-800 dark:text-white">{booking.guest}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <span className="font-bold">{booking.room}</span> - {booking.type}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.checkIn}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.checkOut}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.nights}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{booking.total.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status]?.color}`}>
                      {statusConfig[booking.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-600 hover:underline text-sm">عرض</button>
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

export default Bookings;
