import React, { useState, useEffect } from 'react';
import { useCaptain } from '../contexts/CaptainContext';
import axios from 'axios';

const Ratings = () => {
  const { API_URL } = useCaptain();
  const [data, setData] = useState({
    overallRating: 4.8,
    totalRatings: 256,
    ratingDistribution: { 5: 200, 4: 40, 3: 10, 2: 4, 1: 2 },
    reviews: []
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('captainToken');
      const res = await axios.get(`${API_URL}/api/captain/ratings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      // Keep demo data
      setData({
        overallRating: 4.8,
        totalRatings: 256,
        ratingDistribution: { 5: 200, 4: 40, 3: 10, 2: 4, 1: 2 },
        reviews: [
          { id: 1, passenger: 'أحمد محمد', rating: 5, comment: 'كابتن ممتاز وملتزم بالمواعيد!', date: '2024-01-15', ride_id: 'RIDE-001' },
          { id: 2, passenger: 'سارة علي', rating: 5, comment: 'سيارة نظيفة وقيادة آمنة', date: '2024-01-14', ride_id: 'RIDE-002' },
          { id: 3, passenger: 'محمد خالد', rating: 4, comment: 'خدمة جيدة', date: '2024-01-14', ride_id: 'RIDE-003' },
          { id: 4, passenger: 'فاطمة أحمد', rating: 5, comment: 'شكراً كابتن، رحلة مريحة جداً', date: '2024-01-13', ride_id: 'RIDE-004' },
          { id: 5, passenger: 'عبدالله سعود', rating: 4, comment: 'جيد', date: '2024-01-13', ride_id: 'RIDE-005' },
        ]
      });
    }
  };

  const totalRatings = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التقييمات</h1>
        <p className="text-gray-500">تقييمات الركاب وآراؤهم</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-8 text-white">
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
            <p className="text-yellow-100 mt-2">{data.totalRatings} تقييم</p>
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

      {/* Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">آخر التقييمات</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{review.passenger}</p>
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
                  {review.ride_id}
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

export default Ratings;
