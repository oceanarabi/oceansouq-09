import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';

const Dashboard = () => {
  const { hotel, isAcceptingBookings, toggleBookings } = useHotel();
  const [stats, setStats] = useState({
    occupancy: 78,
    todayCheckIns: 12,
    todayCheckOuts: 8,
    totalRooms: 150,
    availableRooms: 33,
    todayRevenue: 45000,
    pendingBookings: [],
    todayArrivals: []
  });

  useEffect(() => {
    // Demo data
    setStats({
      occupancy: 78,
      todayCheckIns: 12,
      todayCheckOuts: 8,
      totalRooms: 150,
      availableRooms: 33,
      todayRevenue: 45000,
      rating: 4.7,
      pendingBookings: [
        { id: 'BK-001', guest: 'أحمد السعيد', room: 'جناح ملكي', checkIn: '2024-01-16', nights: 3, total: 4500, time: '5 دقائق' },
        { id: 'BK-002', guest: 'سارة العلي', room: 'غرفة مزدوجة', checkIn: '2024-01-16', nights: 2, total: 1200, time: '10 دقائق' },
      ],
      todayArrivals: [
        { id: 'BK-003', guest: 'محمد القحطاني', room: '302', type: 'إطلالة بحر', status: 'confirmed', time: '14:00' },
        { id: 'BK-004', guest: 'نورة الشمري', room: '415', type: 'جناح عائلي', status: 'confirmed', time: '16:00' },
        { id: 'BK-005', guest: 'خالد العتيبي', room: '208', type: 'إقامة عمل', status: 'pending', time: '18:00' },
      ]
    });
  }, []);

  const confirmBooking = (bookingId) => {
    setStats(prev => ({
      ...prev,
      pendingBookings: prev.pendingBookings.filter(b => b.id !== bookingId)
    }));
  };

  const checkInGuest = (bookingId) => {
    setStats(prev => ({
      ...prev,
      todayArrivals: prev.todayArrivals.map(a => 
        a.id === bookingId ? { ...a, status: 'checked_in' } : a
      )
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً، {hotel?.name || 'فندق Ocean'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">لوحة تحكم الفندق</p>
        </div>
        <button
          onClick={toggleBookings}
          className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isAcceptingBookings
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isAcceptingBookings ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
          {isAcceptingBookings ? 'نستقبل الحجوزات' : 'الحجز مغلق'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">نسبة الإشغال</p>
              <p className="text-3xl font-bold mt-1">{stats.occupancy}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="8" fill="none" 
                  strokeDasharray={`${stats.occupancy * 1.76} 176`} />
              </svg>
            </div>
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
              <p className="text-blue-100 text-sm">وصول / مغادرة</p>
              <p className="text-3xl font-bold mt-1">{stats.todayCheckIns} / {stats.todayCheckOuts}</p>
            </div>
            <span className="text-4xl">🛌</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">غرف متاحة</p>
              <p className="text-3xl font-bold mt-1">{stats.availableRooms} / {stats.totalRooms}</p>
            </div>
            <span className="text-4xl">🛏️</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">حجوزات جديدة ({stats.pendingBookings.length})</h2>
          </div>
          <div className="space-y-4">
            {stats.pendingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl">📅</span>
                <p className="mt-2">لا توجد حجوزات جديدة</p>
              </div>
            ) : (
              stats.pendingBookings.map((booking) => (
                <div key={booking.id} className="border-2 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{booking.guest}</p>
                      <p className="text-sm text-gray-500">{booking.room} • {booking.nights} ليالي</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      جديد • {booking.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">تاريخ الوصول: {booking.checkIn}</p>
                      <p className="font-bold text-green-600">{booking.total.toLocaleString()} ر.س</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                        رفض
                      </button>
                      <button 
                        onClick={() => confirmBooking(booking.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                      >
                        ✓ تأكيد
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Arrivals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">وصول اليوم ({stats.todayArrivals.length})</h2>
          </div>
          <div className="space-y-3">
            {stats.todayArrivals.map((arrival) => (
              <div key={arrival.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{arrival.guest}</p>
                    <p className="text-sm text-gray-500">غرفة {arrival.room} • {arrival.type}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">⏰ {arrival.time}</p>
                  {arrival.status === 'checked_in' ? (
                    <span className="text-green-600 font-bold text-sm">✓ تم التسجيل</span>
                  ) : (
                    <button
                      onClick={() => checkInGuest(arrival.id)}
                      className="mt-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                    >
                      تسجيل وصول
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">حالة الغرف</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { type: 'قياسية', total: 50, occupied: 42, color: 'blue' },
            { type: 'مزدوجة', total: 40, occupied: 35, color: 'green' },
            { type: 'جناح', total: 30, occupied: 22, color: 'purple' },
            { type: 'جناح ملكي', total: 15, occupied: 10, color: 'yellow' },
            { type: 'عائلية', total: 10, occupied: 6, color: 'pink' },
            { type: 'إطلالة بحر', total: 5, occupied: 2, color: 'cyan' },
          ].map((room, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">{room.type}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{room.occupied}/{room.total}</p>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full bg-${room.color}-500 rounded-full`}
                  style={{ width: `${(room.occupied / room.total) * 100}%`, backgroundColor: `var(--color-${room.color})` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
