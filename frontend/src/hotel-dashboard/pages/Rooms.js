import React, { useState } from 'react';

const Rooms = () => {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const rooms = [
    { id: '101', type: 'قياسية', floor: 1, status: 'available', price: 400, beds: 1, view: 'مدينة' },
    { id: '102', type: 'قياسية', floor: 1, status: 'occupied', price: 400, beds: 1, view: 'مدينة', guest: 'أحمد السعيد' },
    { id: '201', type: 'مزدوجة', floor: 2, status: 'available', price: 600, beds: 2, view: 'حديقة' },
    { id: '202', type: 'مزدوجة', floor: 2, status: 'maintenance', price: 600, beds: 2, view: 'حديقة' },
    { id: '301', type: 'جناح', floor: 3, status: 'occupied', price: 1200, beds: 2, view: 'بحر', guest: 'سارة العلي' },
    { id: '501', type: 'جناح ملكي', floor: 5, status: 'available', price: 2500, beds: 3, view: 'بحر بانورامي' },
  ];

  const statusConfig = {
    available: { label: 'متاحة', color: 'bg-green-100 text-green-700', icon: '✅' },
    occupied: { label: 'مشغولة', color: 'bg-red-100 text-red-700', icon: '🛌' },
    maintenance: { label: 'صيانة', color: 'bg-yellow-100 text-yellow-700', icon: '🛠️' },
    cleaning: { label: 'تنظيف', color: 'bg-blue-100 text-blue-700', icon: '🧹' },
  };

  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة الغرف</h1>
          <p className="text-gray-500">جميع غرف الفندق</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2"
        >
          <span>+</span> إضافة غرفة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-4 rounded-xl transition ${
              filter === key ? 'ring-2 ring-purple-500' : ''
            } ${config.color}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{config.icon}</span>
              <div className="text-right">
                <p className="text-2xl font-bold">{rooms.filter(r => r.status === key).length}</p>
                <p className="text-sm">{config.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-purple-600">{room.id}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[room.status]?.color}`}>
                {statusConfig[room.status]?.icon} {statusConfig[room.status]?.label}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-800 dark:text-white font-medium">{room.type}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>🏗️ الطابق {room.floor}</span>
                <span>🛏️ {room.beds} سرير</span>
              </div>
              <p className="text-sm text-gray-500">🌅 {room.view}</p>
              <p className="text-xl font-bold text-green-600">{room.price} ر.س / ليلة</p>
              {room.guest && (
                <p className="text-sm text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                  👤 {room.guest}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                تعديل
              </button>
              {room.status === 'available' && (
                <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm">
                  حجز
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
