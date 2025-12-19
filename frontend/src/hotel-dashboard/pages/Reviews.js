import React, { useState, useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import axios from 'axios';

const Reviews = () => {
  const { API_URL } = useHotel();
  const [data, setData] = useState({
    overallRating: 4.6,
    totalReviews: 324,
    ratingDistribution: { 5: 220, 4: 70, 3: 25, 2: 6, 1: 3 },
    reviews: []
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('hotelToken');
      const res = await axios.get(`${API_URL}/api/hotel/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      // Keep demo data
      setData({
        overallRating: 4.6,
        totalReviews: 324,
        ratingDistribution: { 5: 220, 4: 70, 3: 25, 2: 6, 1: 3 },
        reviews: [
          { id: 1, guest: 'أحمد محمد', rating: 5, comment: 'فندق رائع! الخدمة ممتازة والموقع مثالي.', date: '2024-01-15', room_type: 'جناح ديلوكس' },
          { id: 2, guest: 'سارة علي', rating: 4, comment: 'إقامة مريحة، الغرفة نظيفة لكن الإفطار يحتاج تحسين.', date: '2024-01-14', room_type: 'غرفة مزدوجة' },
          { id: 3, guest: 'محمد خالد', rating: 5, comment: 'من أفضل الفنادق التي أقمت بها!', date: '2024-01-13', room_type: 'جناح ملكي' },
          { id: 4, guest: 'فاطمة أحمد', rating: 4, comment: 'تجربة جيدة بشكل عام.', date: '2024-01-12', room_type: 'غرفة فردية' },
          { id: 5, guest: 'علي حسن', rating: 5, comment: 'موظفين محترفين وخدمة راقية.', date: '2024-01-11', room_type: 'جناح ديلوكس' },
        ]
      });
    }
  };

  const totalRatings = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التقييمات</h1>
        <p className="text-gray-500">تقييمات الضيوف وآرائهم</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold">{data.overallRating}</p>
            <div className="flex gap-1 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">
                  {star <= Math.round(data.overallRating) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <p className="text-purple-100 mt-2">{data.totalReviews} تقييم</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.ratingDistribution[star] || 0;
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-sm">{star} ⭐</span>
                  <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm text-left">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">آخر التقييمات</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{review.guest}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm">
                            {star <= review.rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">• {review.date}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {review.room_type}
                </span>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
