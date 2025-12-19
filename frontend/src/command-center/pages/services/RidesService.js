import React, { useState } from 'react';

const RidesService = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'captains', label: 'الكباتن', icon: '👨‍✈️' },
    { id: 'vehicles', label: 'المركبات', icon: '🚗' },
    { id: 'trips', label: 'الرحلات', icon: '🗺️' },
    { id: 'pricing', label: 'التسعير', icon: '💰' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-4xl">
          🚗
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المشاوير</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة المشاوير والكباتن</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
          <span className="text-gray-500 font-semibold">غير مفعل</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'الكباتن', value: '150', icon: '👨‍✈️' },
          { label: 'الرحلات', value: '2,800', icon: '🗺️' },
          { label: 'المدن', value: '8', icon: '🏙️' },
          { label: 'التقييم', value: '4.8', icon: '⭐' },
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🚗</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إدارة المشاوير</h3>
            <p className="text-gray-600 dark:text-gray-400">محتوى {tabs.find(t => t.id === activeTab)?.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidesService;
