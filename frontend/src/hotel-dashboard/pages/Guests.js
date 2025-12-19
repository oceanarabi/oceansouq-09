import React, { useState } from 'react';

const Guests = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const guests = [
    { id: 'G-001', name: 'أحمد السعيد', email: 'ahmed@email.com', phone: '+966 50 111 2222', visits: 5, totalSpent: 15000, status: 'vip', lastVisit: '2024-01-15' },
    { id: 'G-002', name: 'سارة العلي', email: 'sara@email.com', phone: '+966 50 333 4444', visits: 3, totalSpent: 8500, status: 'regular', lastVisit: '2024-01-10' },
    { id: 'G-003', name: 'محمد القحطاني', email: 'mohammed@email.com', phone: '+966 50 555 6666', visits: 8, totalSpent: 32000, status: 'vip', lastVisit: '2024-01-14' },
    { id: 'G-004', name: 'نورة الشمري', email: 'noura@email.com', phone: '+966 50 777 8888', visits: 1, totalSpent: 1800, status: 'new', lastVisit: '2024-01-12' },
    { id: 'G-005', name: 'خالد العتيبي', email: 'khalid@email.com', phone: '+966 50 999 0000', visits: 2, totalSpent: 4200, status: 'regular', lastVisit: '2024-01-08' },
  ];

  const statusConfig = {
    vip: { label: 'VIP', color: 'bg-yellow-100 text-yellow-700', icon: '👑' },
    regular: { label: 'عادي', color: 'bg-blue-100 text-blue-700', icon: '👤' },
    new: { label: 'جديد', color: 'bg-green-100 text-green-700', icon: '✨' },
  };

  const filteredGuests = guests.filter(g => 
    g.name.includes(searchTerm) || g.email.includes(searchTerm) || g.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة النزلاء</h1>
          <p className="text-gray-500">قاعدة بيانات الضيوف</p>
        </div>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2">
          <span>+</span> إضافة ضيف
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن ضيف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 pr-12 bg-white dark:bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-purple-500 dark:border-gray-700"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
          <p className="text-yellow-600 text-sm">👑 ضيوف VIP</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{guests.filter(g => g.status === 'vip').length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
          <p className="text-blue-600 text-sm">👤 ضيوف عاديين</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{guests.filter(g => g.status === 'regular').length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
          <p className="text-green-600 text-sm">✨ ضيوف جدد</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{guests.filter(g => g.status === 'new').length}</p>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الضيف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التواصل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الزيارات</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي الإنفاق</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">آخر زيارة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <span>{statusConfig[guest.status]?.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{guest.name}</p>
                        <p className="text-sm text-gray-500">{guest.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{guest.email}</p>
                    <p className="text-gray-500 text-sm">{guest.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                      {guest.visits} زيارة
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">{guest.totalSpent.toLocaleString()} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[guest.status]?.color}`}>
                      {statusConfig[guest.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{guest.lastVisit}</td>
                  <td className="px-6 py-4">
                    <button className="text-purple-600 hover:underline text-sm">عرض الملف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Guests;
