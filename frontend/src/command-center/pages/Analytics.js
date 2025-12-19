import React, { useState } from 'react';

const Analytics = () => {
  const [period, setPeriod] = useState('week');

  const stats = [
    { label: 'إجمالي الإيرادات', value: '1.25M SAR', change: '+12.5%', icon: '💰', positive: true },
    { label: 'إجمالي الطلبات', value: '8,543', change: '+8.2%', icon: '📦', positive: true },
    { label: 'المستخدمين الجدد', value: '1,250', change: '+15.3%', icon: '👥', positive: true },
    { label: 'معدل التحويل', value: '3.2%', change: '-0.5%', icon: '📊', positive: false },
  ];

  const serviceStats = [
    { name: 'التسوق', icon: '🛒', revenue: '850K', orders: 5200, growth: '+15%' },
    { name: 'التوصيل', icon: '🚚', revenue: '180K', orders: 3200, growth: '+22%' },
    { name: 'الطعام', icon: '🍔', revenue: '120K', orders: 1800, growth: '+8%' },
    { name: 'المشاوير', icon: '🚗', revenue: '80K', orders: 950, growth: '+5%' },
    { name: 'الفنادق', icon: '🏨', revenue: '20K', orders: 120, growth: '+3%' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التحليلات</h1>
          <p className="text-gray-600 dark:text-gray-400">نظرة شاملة على أداء جميع الخدمات</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-ocean-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              {p === 'day' ? 'يوم' : p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${stat.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">أداء الخدمات</h2>
          <div className="space-y-4">
            {serviceStats.map((service, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-3xl">{service.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>💰 {service.revenue}</span>
                    <span>📦 {service.orders} طلب</span>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">{service.growth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الأفضل أداءً</h2>
          <div className="space-y-4">
            {[
              { type: 'منتج', name: 'iPhone 15 Pro', sales: 245, icon: '📱' },
              { type: 'مطعم', name: 'مطعم الريف', sales: 180, icon: '🍔' },
              { type: 'كابتن', name: 'أحمد محمد', sales: 95, icon: '🚗' },
              { type: 'فندق', name: 'Ritz Carlton', sales: 45, icon: '🏨' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <span className="text-ocean-600 font-bold">{item.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
