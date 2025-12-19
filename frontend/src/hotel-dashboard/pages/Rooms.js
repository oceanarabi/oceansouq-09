import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import axios from 'axios';

const Rooms = () => {
  const { API_URL } = useHotel();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const res = await axios.get(`${API_URL}/api/hotel/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data.rooms);
    } catch (err) {
      // Demo data
      setRooms([
        { id: 1, type: 'غرفة فردية', name_en: 'Single Room', price: 350, total: 40, available: 15, occupied: 25 },
        { id: 2, type: 'غرفة مزدوجة', name_en: 'Double Room', price: 500, total: 35, available: 12, occupied: 23 },
        { id: 3, type: 'جناح ديلوكس', name_en: 'Deluxe Suite', price: 900, total: 25, available: 8, occupied: 17 },
        { id: 4, type: 'جناح ملكي', name_en: 'Royal Suite', price: 2500, total: 10, available: 3, occupied: 7 },
        { id: 5, type: 'غرفة عائلية', name_en: 'Family Room', price: 750, total: 10, available: 5, occupied: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalRooms = rooms.reduce((acc, r) => acc + r.total, 0);
  const totalAvailable = rooms.reduce((acc, r) => acc + r.available, 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة الغرف</h1>
        <p className="text-gray-500">مخزون الغرف والأسعار</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي الغرف</p>
              <p className="text-4xl font-bold mt-1">{totalRooms}</p>
            </div>
            <span className="text-5xl">🏨</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">الغرف المتاحة</p>
              <p className="text-4xl font-bold mt-1">{totalAvailable}</p>
            </div>
            <span className="text-5xl">✅</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">الغرف المشغولة</p>
              <p className="text-4xl font-bold mt-1">{totalOccupied}</p>
            </div>
            <span className="text-5xl">🛏️</span>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">نوع الغرفة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">السعر / ليلة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجمالي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">متاحة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">مشغولة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">نسبة الإشغال</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rooms.map((room) => {
                const occupancyRate = Math.round((room.occupied / room.total) * 100);
                return (
                  <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{room.type}</p>
                        <p className="text-sm text-gray-500">{room.name_en}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">{room.price} ر.س</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{room.total}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                        {room.available}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">
                        {room.occupied}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyRate > 80 ? 'bg-red-500' : occupancyRate > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancyRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition">
                        تعديل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
