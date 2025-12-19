import React, { useState } from 'react';

const Users = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'customers', label: 'العملاء', icon: '👥', count: 25400 },
    { id: 'sellers', label: 'البائعين', icon: '🏪', count: 245 },
    { id: 'drivers', label: 'السائقين', icon: '🚗', count: 342 },
    { id: 'restaurants', label: 'المطاعم', icon: '🍔', count: 180 },
    { id: 'hotels', label: 'الفنادق', icon: '🏨', count: 85 },
    { id: 'admins', label: 'المدراء', icon: '👑', count: 12 },
  ];

  const mockUsers = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@email.com', type: 'customer', status: 'active', joined: '2024-01-15', orders: 45 },
    { id: 2, name: 'سارة علي', email: 'sara@email.com', type: 'customer', status: 'active', joined: '2024-02-20', orders: 32 },
    { id: 3, name: 'محمد خالد', email: 'mohamed@seller.com', type: 'seller', status: 'active', joined: '2023-12-01', orders: 520 },
    { id: 4, name: 'فاطمة العلي', email: 'fatima@email.com', type: 'customer', status: 'inactive', joined: '2024-03-10', orders: 8 },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المستخدمين</h1>
        <p className="text-gray-600 dark:text-gray-400">إدارة جميع مستخدمي المنصة</p>
      </div>

      {/* User Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === tab.id
                ? 'bg-ocean-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {tab.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مستخدم..."
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
        <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-xl font-semibold transition">
          + إضافة مستخدم
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">المستخدم</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">البريد</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ التسجيل</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">الطلبات</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-100 dark:bg-ocean-900/30 rounded-full flex items-center justify-center">
                      <span>👤</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.joined}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">{user.orders}</td>
                <td className="px-6 py-4">
                  <button className="text-ocean-600 hover:text-ocean-700 font-semibold text-sm">عرض</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
