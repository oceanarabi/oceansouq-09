import React, { useState, useEffect } from 'react';
import { useCaptain } from '../contexts/CaptainContext';
import axios from 'axios';

const Dashboard = () => {
  const { captain, isOnline, toggleOnline, currentRide, setCurrentRide, API_URL } = useCaptain();
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    rating: 4.8,
    pendingRides: []
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('captainToken');
      const res = await axios.get(`${API_URL}/api/captain/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      if (res.data.currentRide) setCurrentRide(res.data.currentRide);
    } catch (err) {
      // Demo data
      setStats({
        todayRides: 6,
        todayEarnings: 320,
        weekEarnings: 2150,
        rating: 4.9,
        pendingRides: [
          { id: 'RIDE-001', passenger: 'أحمد محمد', pickup: 'حي الملقا', destination: 'مطار الرياض', distance: '25 كم', fare: 85, time: '2 دقيقة' },
          { id: 'RIDE-002', passenger: 'سارة علي', pickup: 'جامعة الملك سعود', destination: 'حي النخيل', distance: '12 كم', fare: 45, time: '5 دقائق' },
        ]
      });
    }
  };

  const acceptRide = (rideId) => {
    const ride = stats.pendingRides.find(r => r.id === rideId);
    setCurrentRide(ride);
    setStats(prev => ({
      ...prev,
      pendingRides: prev.pendingRides.filter(r => r.id !== rideId)
    }));
  };

  const completeRide = () => {
    setStats(prev => ({
      ...prev,
      todayRides: prev.todayRides + 1,
      todayEarnings: prev.todayEarnings + (currentRide?.fare || 0)
    }));
    setCurrentRide(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً، {captain?.name || 'كابتن'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">لوحة تحكم الرحلات</p>
        </div>
        <button
          onClick={toggleOnline}
          className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isOnline
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
          {isOnline ? 'متصل' : 'غير متصل'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">رحلات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayRides}</p>
            </div>
            <span className="text-4xl">🚗</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">أرباح اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayEarnings} <span className="text-lg">ر.س</span></p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">أرباح الأسبوع</p>
              <p className="text-3xl font-bold mt-1">{stats.weekEarnings} <span className="text-lg">ر.س</span></p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">تقييمك</p>
              <p className="text-3xl font-bold mt-1">⭐ {stats.rating}</p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Current Ride */}
      {currentRide && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-500 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">رحلة جارية</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600">📍</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">نقطة الانطلاق</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentRide.pickup}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-red-600">🎯</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الوجهة</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentRide.destination}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-500">الراكب</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentRide.passenger}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="text-sm text-gray-500">الأجرة</p>
                  <p className="font-bold text-green-600">{currentRide.fare} ر.س</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={completeRide}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              ✅ إنهاء الرحلة
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
              📞 اتصال بالراكب
            </button>
            <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
              🗺️ الملاحة
            </button>
          </div>
        </div>
      )}

      {/* Pending Rides */}
      {isOnline && !currentRide && stats.pendingRides.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            رحلات متاحة
          </h2>
          <div className="space-y-4">
            {stats.pendingRides.map((ride) => (
              <div key={ride.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">{ride.time}</span>
                      <span className="text-sm text-gray-500">{ride.distance}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-green-600">📍</span> {ride.pickup}</p>
                      <p className="text-sm"><span className="text-red-600">🎯</span> {ride.destination}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-green-600">{ride.fare} ر.س</p>
                    <button
                      onClick={() => acceptRide(ride.id)}
                      className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                    >
                      قبول
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-12 text-center">
          <span className="text-6xl">😴</span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">أنت غير متصل</h3>
          <p className="text-gray-500 mt-2">اضغط على زر "متصل" لبدء استقبال طلبات الرحلات</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
