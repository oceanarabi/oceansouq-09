import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import axios from 'axios';

const Bookings = () => {
  const { API_URL } = useHotel();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const res = await axios.get(`${API_URL}/api/hotel/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings);
    } catch (err) {
      // Demo data
      setBookings([
        { id: 'BK-0001', guest: 'أحمد محمد', room_type: 'جناح ديلوكس', room_number: '305', check_in: '2024-01-20', check_out: '2024-01-23', nights: 3, price_per_night: 900, total: 2700, status: 'confirmed', special_requests: 'إطلالة على المدينة' },
        { id: 'BK-0002', guest: 'سارة علي', room_type: 'غرفة مزدوجة', room_number: '412', check_in: '2024-01-21', check_out: '2024-01-24', nights: 3, price_per_night: 500, total: 1500, status: 'pending', special_requests: '' },
        { id: 'BK-0003', guest: 'محمد خالد', room_type: 'جناح ملكي', room_number: '501', check_in: '2024-01-18', check_out: '2024-01-22', nights: 4, price_per_night: 2500, total: 10000, status: 'checked_in', special_requests: 'طابق عالي' },
        { id: 'BK-0004', guest: 'فاطمة أحمد', room_type: 'غرفة فردية', room_number: '203', check_in: '2024-01-15', check_out: '2024-01-17', nights: 2, price_per_night: 350, total: 700, status: 'checked_out', special_requests: '' },
        { id: 'BK-0005', guest: 'علي حسن', room_type: 'غرفة عائلية', room_number: '408', check_in: '2024-01-19', check_out: '2024-01-21', nights: 2, price_per_night: 750, total: 1500, status: 'cancelled', special_requests: 'سرير إضافي' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColors = {
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    checked_in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    checked_out: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    confirmed: 'مؤكد',
    pending: 'بانتظار',
    checked_in: 'في الفندق',
    checked_out: 'غادر',
    cancelled: 'ملغي',
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الحجوزات</h1>
          <p className="text-gray-500">إدارة جميع حجوزات الفندق</p>
        </div>
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الحجز</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الضيف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الغرفة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التواريخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الإجمالي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{booking.id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{booking.guest}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{booking.room_type}</p>
                    <p className="text-sm text-gray-500">غرفة #{booking.room_number}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    <p>✅ {booking.check_in}</p>
                    <p>🚪 {booking.check_out}</p>
                    <p className="text-gray-400">{booking.nights} ليالي</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">{booking.total.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">تأكيد</button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Check-in</button>
                      )}
                      {booking.status === 'checked_in' && (
                        <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">Check-out</button>
                      )}
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg">تفاصيل</button>
                    </div>
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
