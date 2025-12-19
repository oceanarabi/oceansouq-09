import React from 'react';

const Reviews = () => {
  const overallRating = 4.5;
  const totalReviews = 186;

  const reviews = [
    { id: 1, customer: 'أحمد محمد', rating: 5, comment: 'طعام لذيذ جداً والتوصيل سريع!', date: '2024-01-15', items: ['برجر دجاج', 'بطاطس'] },
    { id: 2, customer: 'سارة علي', rating: 4, comment: 'بيتزا رائعة لكن وصلت باردة قليلاً', date: '2024-01-14', items: ['بيتزا كبيرة'] },
    { id: 3, customer: 'محمد خالد', rating: 5, comment: 'أفضل شاورما في المدينة!', date: '2024-01-14', items: ['شاورما لحم'] },
    { id: 4, customer: 'فاطمة أحمد', rating: 3, comment: 'الكمية قليلة بالنسبة للسعر', date: '2024-01-13', items: ['وجبة عائلية'] },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المراجعات</h1>
        <p className="text-gray-500">آراء العملاء عن مطعمك</p>
      </div>

      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold">{overallRating}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">{star <= Math.round(overallRating) ? '⭐' : '☆'}</span>
              ))}
            </div>
            <p className="text-yellow-100 mt-2">{totalReviews} مراجعة</p>
          </div>
          <div className="flex-1">
            <p className="text-xl">تقييم ممتاز!</p>
            <p className="text-yellow-100 mt-1">أنت من أفضل 10% من المطاعم في منطقتك</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">آخر المراجعات</h2>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{review.customer}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">{star <= review.rating ? '⭐' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-3">"{review.comment}"</p>
              <div className="flex gap-2 mt-3">
                {review.items.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm">
                  رد على المراجعة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
