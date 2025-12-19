import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import axios from 'axios';

const Dashboard = () => {
  const { hotel, isAvailable, toggleAvailability, API_URL } = useHotel();
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    occupancyRate: 0,
    rating: 4.6,
    availableRooms: 40,
    totalRooms: 120,
    pendingBookings: [],
    todayCheckIns: [],
    todayCheckOuts: []
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const res = await axios.get(`${API_URL}/api/hotel/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      // Demo data
      setStats({
        todayBookings: 12,
        todayRevenue: 28500,
        occupancyRate: 78,
        rating: 4.7,
        availableRooms: 35,
        totalRooms: 120,
        pendingBookings: [
          { id: 'BK-0001', guest: 'أحمد محمد', room_type: 'جناح ديلوكس', check_in: '2024-01-20', check_out: '2024-01-23', nights: 3, total: 2700, status: 'pending' },
          { id: 'BK-0002', guest: 'سارة علي', room_type: 'غرفة مزدوجة', check_in: '2024-01-21', check_out: '2024-01-24', nights: 3, total: 1500, status: 'pending' },
        ],
        todayCheckIns: [
          { id: 'BK-0010', guest: 'علي حسن', room: '305', room_type: 'جناح ديلوكس', time: '14:00' },
          { id: 'BK-0011', guest: 'نورة محمد', room: '412', room_type: 'غرفة عائلية', time: '15:00' },
        ],
        todayCheckOuts: [
          { id: 'BK-0020', guest: 'محمد عبدالله', room: '201', time: '12:00' },
        ]
      });
    }
  };

  const confirmBooking = (bookingId) => {
    setStats(prev => ({
      ...prev,
      pendingBookings: prev.pendingBookings.filter(b => b.id !== bookingId)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً، {hotel?.name || 'فندق'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">لوحة تحكم الفندق</p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isAvailable
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
          {isAvailable ? 'متاح للحجز' : 'غير متاح'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">حجوزات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayBookings}</p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إيرادات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayRevenue.toLocaleString()} <span className="text-lg">ر.س</span></p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">نسبة الإشغال</p>
              <p className="text-3xl font-bold mt-1">{stats.occupancyRate}%</p>
            </div>
            <span className="text-4xl">🏨</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">التقييم</p>
              <p className="text-3xl font-bold mt-1">⭐ {stats.rating}</p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Room Availability */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الغرف المتاحة</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeDasharray={`${(stats.availableRooms / stats.totalRooms) * 100}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.availableRooms}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300"><span className="font-bold text-purple-600">{stats.availableRooms}</span> غرفة متاحة</p>
            <p className="text-gray-600 dark:text-gray-300"><span className="font-bold text-gray-800 dark:text-white">{stats.totalRooms - stats.availableRooms}</span> غرفة مشغولة</p>
            <p className="text-gray-600 dark:text-gray-300"><span className="font-bold text-gray-400">{stats.totalRooms}</span> إجمالي الغرف</p>
          </div>
        </div>
      </div>

      {/* Pending Bookings */}
      {stats.pendingBookings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            حجوزات تنتظر التأكيد
          </h2>
          <div className="space-y-4">
            {stats.pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">بانتظار التأكيد</span>
                      <span className="text-sm text-gray-500">{booking.id}</span>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white">{booking.guest}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{booking.room_type}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {booking.check_in} → {booking.check_out} ({booking.nights} ليالي)
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-green-600">{booking.total.toLocaleString()} ر.س</p>
                    <button
                      onClick={() => confirmBooking(booking.id)}
                      className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                    >
                      تأكيد
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Check-ins */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">✅</span>
            وصول اليوم
          </h2>
          <div className="space-y-3">
            {stats.todayCheckIns.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{item.guest}</p>
                    <p className="text-sm text-gray-500">غرفة {item.room} • {item.room_type}</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">{item.time}</span>
              </div>
            ))}
            {stats.todayCheckIns.length === 0 && (
              <p className="text-gray-500 text-center py-4">لا يوجد وصول اليوم</p>
            )}
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🚪</span>
            مغادرة اليوم
          </h2>
          <div className="space-y-3">
            {stats.todayCheckOuts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{item.guest}</p>
                    <p className="text-sm text-gray-500">غرفة {item.room}</p>
                  </div>
                </div>
                <span className="text-sm text-orange-600 font-medium">{item.time}</span>
              </div>
            ))}
            {stats.todayCheckOuts.length === 0 && (
              <p className="text-gray-500 text-center py-4">لا يوجد مغادرة اليوم</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
