import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ShoppingService = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 12500,
    totalSellers: 245,
    totalOrders: 8543,
    revenue: 1250000
  });

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'products', label: 'المنتجات', icon: '📦' },
    { id: 'sellers', label: 'البائعين', icon: '🏪' },
    { id: 'orders', label: 'الطلبات', icon: '📄' },
    { id: 'categories', label: 'التصنيفات', icon: '🏷️' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-ocean-100 dark:bg-ocean-900/30 rounded-2xl flex items-center justify-center text-4xl">
          🛒
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التسوق الإلكتروني</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة المتاجر والمنتجات والطلبات</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-600 font-semibold">الخدمة نشطة</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي المنتجات', value: stats.totalProducts.toLocaleString(), icon: '📦', color: 'ocean' },
          { label: 'البائعين', value: stats.totalSellers, icon: '🏪', color: 'purple' },
          { label: 'الطلبات', value: stats.totalOrders.toLocaleString(), icon: '📄', color: 'green' },
          { label: 'الإيرادات', value: `${(stats.revenue/1000).toFixed(0)}K SAR`, icon: '💰', color: 'yellow' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-ocean-600 border-b-2 border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">نظرة عامة على التسوق</h3>
              <p className="text-gray-600 dark:text-gray-400">رسوم بيانية وإحصائيات تفصيلية هنا</p>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إدارة المنتجات</h3>
              <p className="text-gray-600 dark:text-gray-400">12,500 منتج في المنصة</p>
            </div>
          )}
          {activeTab === 'sellers' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏪</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إدارة البائعين</h3>
              <p className="text-gray-600 dark:text-gray-400">245 بائع مسجل</p>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📄</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إدارة الطلبات</h3>
              <p className="text-gray-600 dark:text-gray-400">8,543 طلب</p>
            </div>
          )}
          {activeTab === 'categories' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏷️</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">التصنيفات</h3>
              <p className="text-gray-600 dark:text-gray-400">إدارة فئات المنتجات</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">⚙️</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إعدادات التسوق</h3>
              <p className="text-gray-600 dark:text-gray-400">ضبط إعدادات الخدمة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingService;
