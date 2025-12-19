import React, { useState } from 'react';

const Rides = () => {
  const [filter, setFilter] = useState('all');

  const rides = [
    { id: 'RIDE-001', passenger: 'أحمد محمد', pickup: 'حي الملقا', destination: 'مطار الرياض', status: 'completed', fare: 85, date: '2024-01-15', time: '14:30', distance: '25 كم', duration: '35 دقيقة' },
    { id: 'RIDE-002', passenger: 'سارة علي', pickup: 'جامعة الملك سعود', destination: 'حي النخيل', status: 'completed', fare: 45, date: '2024-01-15', time: '13:15', distance: '12 كم', duration: '20 دقيقة' },
    { id: 'RIDE-003', passenger: 'محمد خالد', pickup: 'حي العليا', destination: 'حي الورود', status: 'cancelled', fare: 35, date: '2024-01-15', time: '12:00', distance: '8 كم', duration: '-' },
    { id: 'RIDE-004', passenger: 'فاطمة أحمد', pickup: 'مركز المملكة', destination: 'حي الربوة', status: 'completed', fare: 55, date: '2024-01-14', time: '20:45', distance: '15 كم', duration: '25 دقيقة' },
    { id: 'RIDE-005', passenger: 'عبدالله سعود', pickup: 'حي السليمانية', destination: 'مطار الرياض', status: 'completed', fare: 95, date: '2024-01-14', time: '19:30', distance: '30 كم', duration: '40 دقيقة' },
  ];

  const filteredRides = filter === 'all' ? rides : rides.filter(r => r.status === filter);

  const statusColors = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const statusLabels = {
    completed: 'مكتملة',
    cancelled: 'ملغية',
    in_progress: 'جارية',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">الرحلات</h1>
          <p className="text-gray-500">سجل جميع رحلاتك</p>
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'الكل' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">رقم الرحلة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الراكب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">من → إلى</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">المسافة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الأجرة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{ride.id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{ride.passenger}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                    <span className="text-green-600">📍</span> {ride.pickup}<br/>
                    <span className="text-red-600">🎯</span> {ride.destination}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{ride.distance}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{ride.fare} ر.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ride.status]}`}>
                      {statusLabels[ride.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{ride.date} - {ride.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rides;
