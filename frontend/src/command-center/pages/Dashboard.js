import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useServices, ALL_SERVICES } from '../CommandCenterApp';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Dashboard = () => {
  const { services } = useServices();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeDrivers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const activeServices = services.filter(s => s.enabled);
  const token = localStorage.getItem('commandToken');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/command/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats || stats);
      setRecentActivity(res.data.activity || []);
    } catch (err) {
      // Mock data
      setStats({
        totalRevenue: 1250000,
        totalOrders: 8543,
        totalUsers: 25400,
        activeDrivers: 342
      });
      setRecentActivity([
        { id: 1, type: 'order', message: 'طلب جديد #8544 - تسوق', time: 'منذ دقيقتين', icon: '🛒' },
        { id: 2, type: 'delivery', message: 'تم تسليم طلب #8540', time: 'منذ 5 دقائق', icon: '✅' },
        { id: 3, type: 'user', message: 'مستخدم جديد سجل في المنصة', time: 'منذ 10 دقائق', icon: '👤' },
        { id: 4, type: 'food', message: 'طلب طعام جديد من مطعم الريف', time: 'منذ 15 دقيقة', icon: '🍔' },
      ]);
    }
  };

  const statCards = [
    { label: 'إجمالي الإيرادات', value: `${(stats.totalRevenue / 1000).toFixed(0)}K SAR`, icon: '💰', color: 'from-green-500 to-emerald-600', change: '+12.5%' },
    { label: 'إجمالي الطلبات', value: stats.totalOrders.toLocaleString(), icon: '📦', color: 'from-ocean-500 to-blue-600', change: '+8.2%' },
    { label: 'المستخدمين', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'from-purple-500 to-violet-600', change: '+15.3%' },
    { label: 'السائقين النشطين', value: stats.activeDrivers, icon: '🚗', color: 'from-orange-500 to-red-500', change: '+5.1%' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مركز التحكم المركزي</h1>
        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في لوحة تحكم Ocean - إدارة جميع الخدمات من مكان واحد</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
                <span className="text-green-500 text-sm font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Services */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">الخدمات النشطة</h2>
            <Link to="/command/services" className="text-ocean-600 hover:text-ocean-700 text-sm font-semibold">إدارة الخدمات →</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ALL_SERVICES.map((service) => {
              const isActive = services.find(s => s.id === service.id)?.enabled;
              return (
                <div 
                  key={service.id}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                    isActive 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{service.name}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {isActive ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">النشاط الأخير</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🤖 مساعد AI الشخصي</h2>
            <p className="text-white/80">اسأل الذكاء الاصطناعي عن أي شيء يخص إدارة المنصة</p>
          </div>
          <Link 
            to="/command/ai"
            className="bg-white text-ocean-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            افتح مركز AI
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
