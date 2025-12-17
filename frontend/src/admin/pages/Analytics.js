import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import StatsCard from '../components/StatsCard';

const Icons = {
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ShoppingCart: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
};

const Analytics = () => {
  const { t, api, language } = useAdmin();
  const [period, setPeriod] = useState('week');
  const [salesData, setSalesData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [salesRes, usersRes] = await Promise.all([api.get(`/api/admin/analytics/sales?period=${period}`), api.get('/api/admin/analytics/users')]);
        setSalesData(salesRes.data);
        setUserStats(usersRes.data);
      } catch (error) { console.error('Error fetching analytics:', error); }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [api, period]);

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (loading) return <div className="p-6"><div className="animate-pulse space-y-6"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('analytics')}</h1><p className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'تحليلات وإحصائيات المنصة' : 'Platform analytics and statistics'}</p></div>
        <div className="flex gap-2">{['day', 'week', 'month', 'year'].map((p) => <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${period === p ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t(p === 'day' ? 'today' : p === 'week' ? 'thisWeek' : p === 'month' ? 'thisMonth' : 'thisYear')}</button>)}</div>
      </div>

      <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('salesAnalytics')}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatsCard title={t('totalRevenue')} value={formatCurrency(salesData?.total_revenue)} icon={Icons.DollarSign} color="green" /><StatsCard title={t('totalOrders')} value={salesData?.total_orders || 0} icon={Icons.ShoppingCart} color="blue" /><StatsCard title={t('avgOrderValue')} value={formatCurrency(salesData?.avg_order_value)} icon={Icons.TrendingUp} color="purple" /><StatsCard title={t('period')} value={t(period === 'day' ? 'today' : period === 'week' ? 'thisWeek' : period === 'month' ? 'thisMonth' : 'thisYear')} icon={Icons.Package} color="cyan" /></div></div>

      {salesData?.top_products?.length > 0 && <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm"><h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('topProducts')}</h3><div className="space-y-4">{salesData.top_products.map((product, idx) => <div key={product.id} className="flex items-center gap-4"><span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300">{idx + 1}</span><img src={product.image_url || 'https://via.placeholder.com/48'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1"><p className="font-medium text-slate-900 dark:text-white">{product.title}</p><p className="text-sm text-slate-500">{language === 'ar' ? 'المبيعات' : 'Sold'}: {product.total_sold}</p></div><div className="text-right"><p className="font-bold text-slate-900 dark:text-white">{formatCurrency(product.total_revenue)}</p><p className="text-sm text-slate-500">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</p></div></div>)}</div></div>}

      <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('userAnalytics')}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><StatsCard title={t('totalUsers')} value={userStats?.total || 0} icon={Icons.Users} color="blue" /><StatsCard title={t('buyers')} value={userStats?.by_role?.buyers || 0} icon={Icons.Users} color="green" /><StatsCard title={t('sellers')} value={userStats?.by_role?.sellers || 0} icon={Icons.Users} color="purple" /><StatsCard title={t('admins')} value={userStats?.by_role?.admins || 0} icon={Icons.Users} color="orange" /></div></div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm"><h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('userGrowth')}</h3><div className="grid grid-cols-2 gap-6"><div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-sm text-slate-500 mb-1">{t('thisWeek')}</p><p className="text-3xl font-bold text-slate-900 dark:text-white">+{userStats?.growth?.this_week || 0}</p><p className="text-sm text-green-500">{language === 'ar' ? 'مستخدم جديد' : 'new users'}</p></div><div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-sm text-slate-500 mb-1">{t('thisMonth')}</p><p className="text-3xl font-bold text-slate-900 dark:text-white">+{userStats?.growth?.this_month || 0}</p><p className="text-sm text-green-500">{language === 'ar' ? 'مستخدم جديد' : 'new users'}</p></div></div></div>
    </div>
  );
};

export default Analytics;
