import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';
import StatsCard from '../components/StatsCard';

const Icons = {
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  StarFilled: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>,
};

const Reviews = () => {
  const { t, api, language } = useSeller();
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reviewsRes] = await Promise.all([
          api.get('/api/seller/reviews/stats'),
          api.get(`/api/seller/reviews?page=${pagination.page}&limit=20`)
        ]);
        setStats(statsRes.data);
        setReviews(reviewsRes.data.reviews || []);
        setPagination({ page: reviewsRes.data.page, pages: reviewsRes.data.pages, total: reviewsRes.data.total });
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [api, pagination.page]);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-slate-300'}><Icons.StarFilled /></span>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div><div className="grid grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reviews')}</h1><p className="text-slate-500">{t('productReviews')}</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title={t('totalReviews')} value={stats?.total_reviews || 0} icon={Icons.Star} color="blue" />
        <StatsCard title={t('avgRating')} value={stats?.average_rating || 0} icon={Icons.Star} color="yellow" subtitle={`${language === 'ar' ? 'من' : 'out of'} 5`} />
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-4">{t('ratingDistribution')}</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.rating_distribution?.[String(star)] || 0;
              const percent = stats?.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300 w-4">{star}</span>
                  <span className="text-yellow-400"><Icons.StarFilled /></span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="text-sm text-slate-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{language === 'ar' ? 'جميع التقييمات' : 'All Reviews'}</h3></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {reviews.length === 0 ? <div className="p-12 text-center text-slate-500">{t('noReviews')}</div> : reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <div className="flex gap-4">
                <img src={review.product?.image_url || 'https://via.placeholder.com/64'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{review.product?.title}</h4>
                      <p className="text-sm text-slate-500">{review.user?.name || review.user?.email || (language === 'ar' ? 'مستخدم مجهول' : 'Anonymous')}</p>
                    </div>
                    <span className="text-sm text-slate-500">{formatDate(review.created_at)}</span>
                  </div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  {review.comment && <p className="text-slate-600 dark:text-slate-300">{review.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {pagination.pages > 1 && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between"><p className="text-sm text-slate-500">{t('showing')} {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} {t('of')} {pagination.total}</p><div className="flex gap-2"><button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('previous')}</button><button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('next')}</button></div></div>}
      </div>
    </div>
  );
};

export default Reviews;
