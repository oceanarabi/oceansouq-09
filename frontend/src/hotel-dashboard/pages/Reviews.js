import React from 'react';

const Reviews = () => {
  const overallRating = 4.6;
  const totalReviews = 856;

  const reviews = [
    { id: 1, guest: 'أحمد السعيد', rating: 5, comment: 'فندق رائع! الغرفة نظيفة والخدمة ممتازة', date: '2024-01-15', roomType: 'جناح ملكي' },
    { id: 2, guest: 'سارة العلي', rating: 4, comment: 'إقامة ممتازة، الإفطار كان لذيذاً', date: '2024-01-14', roomType: 'غرفة مزدوجة' },
    { id: 3, guest: 'محمد القحطاني', rating: 5, comment: 'إطلالة رائعة على البحر، سنعود حتماً', date: '2024-01-13', roomType: 'إطلالة بحر' },
    { id: 4, guest: 'نورة الشمري', rating: 3, comment: 'الغرفة جيدة لكن الواي فاي كان ضعيفاً', date: '2024-01-12', roomType: 'قياسية' },
  ];

  const categories = [
    { name: 'النظافة', rating: 4.8 },
    { name: 'الخدمة', rating: 4.7 },
    { name: 'الموقع', rating: 4.9 },
    { name: 'الراحة', rating: 4.5 },
    { name: 'القيمة', rating: 4.3 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المراجعات</h1>
        <p className="text-gray-500">آراء النزلاء عن الفندق</p>
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-bold">{overallRating}</p>
            <div className="flex gap-1 justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">{star <= Math.round(overallRating) ? '⭐' : '☆'}</span>
              ))}
            </div>
            <p className="text-purple-100 mt-2">{totalReviews} مراجعة</p>
          </div>
          <div className="flex-1 space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-24 text-sm">{cat.name}</span>
                <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${(cat.rating / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm w-10">{cat.rating}</span>
              </div>
            ))}
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
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{review.guest}</p>
                    <p className="text-sm text-gray-500">{review.roomType}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-sm">{star <= review.rating ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-3">"{review.comment}"</p>
              <button className="mt-3 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm">
                رد على المراجعة
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
