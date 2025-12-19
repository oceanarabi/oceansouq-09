import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import axios from 'axios';

const Analytics = () => {
  const { API_URL } = useHotel();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    avgOccupancy: 0,
    avgDailyRate: 0,
    revPAR: 0,
    topRoomTypes: [],
    weeklyOccupancy: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const res = await axios.get(`${API_URL}/api/hotel/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      // Demo data
      const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : 30;
      setData({
        totalBookings: 35 * (multiplier / 7),
        totalRevenue: 85000 * (multiplier / 7),
        avgOccupancy: 78,
        avgDailyRate: 850,
        revPAR: 663,
        topRoomTypes: [
          { type: 'جناح ديلوكس', bookings: 45, revenue: 58500 },
          { type: 'غرفة مزدوجة', bookings: 62, revenue: 43400 },
          { type: 'جناح ملكي', bookings: 18, revenue: 52000 },
        ],
        weeklyOccupancy: [
          { day: 'السبت', rate: 82 },
          { day: 'الأحد', rate: 75 },
          { day: 'الإثنين', rate: 68 },
          { day: 'الثلاثاء', rate: 72 },
          { day: 'الأربعاء', rate: 78 },
          { day: 'الخميس', rate: 92 },
          { day: 'الجمعة', rate: 95 },
        ]
      });
    }
  };

  const maxOccupancy = Math.max(...data.weeklyOccupancy.map(d => d.rate), 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التحليلات</h1>
          <p className="text-gray-500">إحصائيات وتقارير الفندق</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {[{ id: 'today', label: 'اليوم' }, { id: 'week', label: 'الأسبوع' }, { id: 'month', label: 'الشهر' }].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p.id
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">إجمالي الحجوزات</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{Math.round(data.totalBookings)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{Math.round(data.totalRevenue).toLocaleString()} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">متوسط الإشغال</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.avgOccupancy}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">ADR</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{data.avgDailyRate} <span className="text-lg">ر.س</span></p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">RevPAR</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{data.revPAR} <span className="text-lg">ر.س</span></p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Occupancy Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">نسبة الإشغال الأسبوعية</h2>
          <div className="flex items-end justify-between gap-4 h-48">
            {data.weeklyOccupancy.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex justify-center mb-2">
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                      day.rate > 85 ? 'bg-gradient-to-t from-green-600 to-green-400' :
                      day.rate > 70 ? 'bg-gradient-to-t from-blue-600 to-blue-400' :
                      'bg-gradient-to-t from-orange-600 to-orange-400'
                    }`}
                    style={{ height: `${(day.rate / maxOccupancy) * 150}px` }}
                  ></div>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{day.rate}%</p>
                <p className="text-xs text-gray-500 mt-1">{day.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Room Types */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">أفضل أنواع الغرف</h2>
          <div className="space-y-4">
            {data.topRoomTypes.map((room, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">{room.type}</p>
                  <p className="text-sm text-gray-500">{room.bookings} حجز</p>
                </div>
                <p className="font-bold text-green-600">{room.revenue.toLocaleString()} ر.س</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
