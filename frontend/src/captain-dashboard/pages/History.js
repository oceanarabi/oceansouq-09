import React, { useState, useEffect } from 'react';
import { useCaptain } from '../contexts/CaptainContext';
import axios from 'axios';

const History = () => {
  const { API_URL } = useCaptain();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('captainToken');
      const res = await axios.get(`${API_URL}/api/captain/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history);
    } catch (err) {
      // Demo data
      setHistory([
        { id: '1', type: 'ride_completed', description: 'رحلة مكتملة - حي الملقا → مطار الرياض', amount: 85, date: '2024-01-15', time: '14:30' },
        { id: '2', type: 'tip_received', description: 'إكرامية من العميل', amount: 15, date: '2024-01-15', time: '14:35' },
        { id: '3', type: 'ride_completed', description: 'رحلة مكتملة - جامعة الملك سعود → حي النخيل', amount: 45, date: '2024-01-15', time: '13:15' },
        { id: '4', type: 'bonus_earned', description: 'مكافأة ساعات الذروة', amount: 30, date: '2024-01-15', time: '12:00' },
        { id: '5', type: 'ride_cancelled', description: 'رحلة ملغية - حي العليا', amount: -5, date: '2024-01-15', time: '11:45' },
        { id: '6', type: 'ride_completed', description: 'رحلة مكتملة - مركز المملكة → حي الربوة', amount: 55, date: '2024-01-14', time: '20:45' },
        { id: '7', type: 'ride_completed', description: 'رحلة مكتملة - حي السليمانية → مطار الرياض', amount: 95, date: '2024-01-14', time: '19:30' },
        { id: '8', type: 'tip_received', description: 'إكرامية من العميل', amount: 20, date: '2024-01-14', time: '19:35' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'ride_completed': return { icon: '✅', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' };
      case 'ride_cancelled': return { icon: '❌', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
      case 'tip_received': return { icon: '🎁', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' };
      case 'bonus_earned': return { icon: '🏆', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' };
      default: return { icon: '📝', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">السجل</h1>
        <p className="text-gray-500">تاريخ جميع نشاطاتك</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {history.map((item) => {
            const style = getTypeStyle(item.type);
            return (
              <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center text-2xl`}>
                      {style.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{item.description}</p>
                      <p className="text-sm text-gray-500">{item.date} - {item.time}</p>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.amount >= 0 ? '+' : ''}{item.amount} ر.س
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;
