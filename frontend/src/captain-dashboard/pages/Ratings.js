import React from 'react';

const Ratings = () => {
  const overallRating = 4.92;
  const totalRatings = 428;

  const ratingBreakdown = [
    { stars: 5, count: 380, percentage: 89 },
    { stars: 4, count: 35, percentage: 8 },
    { stars: 3, count: 8, percentage: 2 },
    { stars: 2, count: 3, percentage: 0.5 },
    { stars: 1, count: 2, percentage: 0.5 },
  ];

  const recentReviews = [
    { id: 1, passenger: 'أحمد محمد', rating: 5, comment: 'كابتن ممتاز وسيارة نظيفة!', date: '2024-01-15' },
    { id: 2, passenger: 'سارة علي', rating: 5, comment: 'وصلت في الوقت المحدد، شكراً', date: '2024-01-14' },
    { id: 3, passenger: 'محمد خالد', rating: 4, comment: 'رحلة جيدة', date: '2024-01-14' },
    { id: 4, passenger: 'فاطمة أحمد', rating: 5, comment: 'قيادة آمنة ومريحة', date: '2024-01-13' },
    { id: 5, passenger: 'عبدالله سعود', rating: 5, comment: 'أفضل كابتن!', date: '2024-01-12' },
  ];

  const badges = [
    { icon: '⚡', title: 'سريع البرق', description: 'أكملت 100+ رحلة في وقت قياسي' },
    { icon: '⭐', title: 'خمس نجوم', description: 'حافظت على تقييم 5 نجوم لمدة شهر' },
    { icon: '🏆', title: 'كابتن الشهر', description: 'أفضل كابتن في ديسمبر 2024' },
    { icon: '🛡️', title: 'قيادة آمنة', description: 'صفر حوادث خلال 6 أشهر' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">التقييمات والمراجعات</h1>
        <p className="text-gray-500">شاهد آراء الركاب عنك</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold">{overallRating}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">{star <= Math.round(overallRating) ? '⭐' : '☆'}</span>
              ))}
            </div>
            <p className="text-yellow-100 mt-2">{totalRatings} تقييم</p>
          </div>
          <div className="flex-1 space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm w-12">{item.stars} ⭐</span>
                <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm w-12 text-left">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الشارات والإنجازات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition">
              <span className="text-4xl">{badge.icon}</span>
              <h3 className="font-bold text-gray-800 dark:text-white mt-2">{badge.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">آخر المراجعات</h2>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{review.passenger}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">{star <= review.rating ? '⭐' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              {review.comment && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 mr-13">"{review.comment}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ratings;
