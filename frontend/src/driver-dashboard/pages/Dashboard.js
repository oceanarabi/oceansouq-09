import React, { useState, useEffect } from 'react';
import { useDriver } from '../contexts/DriverContext';
import axios from 'axios';

const Dashboard = () => {
  const { driver, isOnline, toggleOnline, API_URL } = useDriver();
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    rating: 4.8,
    pendingOrders: []
  });
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('driverToken');
      const res = await axios.get(`${API_URL}/api/driver/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      if (res.data.currentOrder) setCurrentOrder(res.data.currentOrder);
    } catch (err) {
      // Use demo data
      setStats({
        todayDeliveries: 8,
        todayEarnings: 245,
        weekEarnings: 1580,
        rating: 4.9,
        pendingOrders: [
          { id: 'ORD-001', restaurant: 'البيك', customer: 'أحمد محمد', distance: '3.2 كم', amount: 45, time: '15 دقيقة' },
          { id: 'ORD-002', restaurant: 'كودو', customer: 'سارة علي', distance: '2.1 كم', amount: 38, time: '10 دقائق' },
        ]
      });
    }
  };

  const acceptOrder = async (orderId) => {
    const order = stats.pendingOrders.find(o => o.id === orderId);
    setCurrentOrder(order);
    setStats(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders.filter(o => o.id !== orderId)
    }));
  };

  const completeDelivery = () => {
    setStats(prev => ({
      ...prev,
      todayDeliveries: prev.todayDeliveries + 1,
      todayEarnings: prev.todayEarnings + (currentOrder?.amount || 0) * 0.2
    }));
    setCurrentOrder(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً، {driver?.name || 'سائق'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">لوحة تحكم التوصيل</p>
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
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">توصيلات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayDeliveries}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">أرباح اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayEarnings} <span className="text-lg">ر.س</span></p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">أرباح الأسبوع</p>
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

      {/* Current Order */}
      {currentOrder && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-green-500 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">طلب جاري</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍔</span>
                <div>
                  <p className="text-sm text-gray-500">المطعم</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentOrder.restaurant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-sm text-gray-500">العميل</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentOrder.customer}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-gray-500">المسافة</p>
                  <p className="font-bold text-gray-800 dark:text-white">{currentOrder.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="text-sm text-gray-500">قيمة الطلب</p>
                  <p className="font-bold text-green-600">{currentOrder.amount} ر.س</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={completeDelivery}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              ✅ تم التوصيل
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
              📞 اتصال بالعميل
            </button>
            <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
              🗺️ الخريطة
            </button>
          </div>
        </div>
      )}

      {/* Pending Orders */}
      {isOnline && stats.pendingOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            طلبات متاحة
          </h2>
          <div className="space-y-4">
            {stats.pendingOrders.map((order) => (
              <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🍔</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{order.restaurant}</p>
                    <p className="text-sm text-gray-500">📍 {order.distance} • ⏱️ {order.time}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-green-600">{order.amount} ر.س</p>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition"
                  >
                    قبول
                  </button>
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
          <p className="text-gray-500 mt-2">اضغط على زر "متصل" لبدء استقبال الطلبات</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
