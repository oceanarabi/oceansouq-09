import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';

const Dashboard = () => {
  const { restaurant, isOpen, toggleOpen } = useRestaurant();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: [],
    preparingOrders: []
  });
  const [newOrderSound] = useState(new Audio('/notification.mp3'));

  useEffect(() => {
    // Simulate loading stats
    setStats({
      todayOrders: 45,
      todayRevenue: 3250,
      avgPrepTime: 18,
      rating: 4.7,
      pendingOrders: [
        { id: 'FO-001', customer: 'أحمد محمد', items: ['برجر دجاج', 'بطاطس', 'كولا'], total: 45, time: '2 دقيقة' },
        { id: 'FO-002', customer: 'سارة علي', items: ['بيتزا كبيرة', 'سلطة'], total: 65, time: '5 دقائق' },
      ],
      preparingOrders: [
        { id: 'FO-003', customer: 'محمد خالد', items: ['شاورما لحم', 'عصير'], total: 38, prepTime: '10 دقائق' },
      ]
    });
  }, []);

  const acceptOrder = (orderId) => {
    const order = stats.pendingOrders.find(o => o.id === orderId);
    setStats(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders.filter(o => o.id !== orderId),
      preparingOrders: [...prev.preparingOrders, { ...order, prepTime: '15 دقيقة' }]
    }));
  };

  const markReady = (orderId) => {
    setStats(prev => ({
      ...prev,
      preparingOrders: prev.preparingOrders.filter(o => o.id !== orderId),
      todayOrders: prev.todayOrders + 1
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرحباً، {restaurant?.name || 'المطعم'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">لوحة تحكم المطعم</p>
        </div>
        <button
          onClick={toggleOpen}
          className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            isOpen
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
          {isOpen ? 'مفتوح' : 'مغلق'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">طلبات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayOrders}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إيرادات اليوم</p>
              <p className="text-3xl font-bold mt-1">{stats.todayRevenue} <span className="text-lg">ر.س</span></p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">متوسط التحضير</p>
              <p className="text-3xl font-bold mt-1">{stats.avgPrepTime} <span className="text-lg">دقيقة</span></p>
            </div>
            <span className="text-4xl">⏱️</span>
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

      {/* Orders Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">طلبات جديدة ({stats.pendingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            {stats.pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl">📋</span>
                <p className="mt-2">لا توجد طلبات جديدة</p>
              </div>
            ) : (
              stats.pendingOrders.map((order) => (
                <div key={order.id} className="border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      جديد • {order.time}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.items.join(' • ')}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-600">{order.total} ر.س</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                        رفض
                      </button>
                      <button 
                        onClick={() => acceptOrder(order.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                      >
                        ✓ قبول
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">قيد التحضير ({stats.preparingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            {stats.preparingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl">🍳</span>
                <p className="mt-2">لا توجد طلبات قيد التحضير</p>
              </div>
            ) : (
              stats.preparingOrders.map((order) => (
                <div key={order.id} className="border-2 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      ⏱️ {order.prepTime}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.items?.join(' • ')}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-600">{order.total} ر.س</p>
                    <button 
                      onClick={() => markReady(order.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                      ✅ جاهز للتسليم
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Not Open Warning */}
      {!isOpen && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-2xl p-6 text-center">
          <span className="text-4xl">🛑</span>
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mt-2">المطعم مغلق</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">لن تستقبل طلبات جديدة حتى تفتح المطعم</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
