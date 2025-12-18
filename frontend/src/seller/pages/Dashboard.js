import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';
import StatsCard from '../components/StatsCard';

const Icons = {
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ShoppingCart: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
};

const Dashboard = () => {
  const { t, api, language } = useSeller();
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, productsRes] = await Promise.all([
          api.get('/api/seller/dashboard/stats'),
          api.get('/api/seller/dashboard/sales-chart?days=7'),
          api.get('/api/seller/dashboard/top-products?limit=5')
        ]);
        setStats(statsRes.data);
        setSalesChart(chartRes.data);
        setTopProducts(productsRes.data);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [api]);

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('overview')}</h1><p className="text-slate-500">{language === 'ar' ? 'مرحباً بك في لوحة تحكم البائع' : 'Welcome to your Seller Dashboard'}</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('todaySales')} value={formatCurrency(stats?.sales?.today)} icon={Icons.DollarSign} color="emerald" />
        <StatsCard title={t('totalSales')} value={formatCurrency(stats?.sales?.total)} icon={Icons.DollarSign} color="blue" />
        <StatsCard title={t('totalOrders')} value={stats?.orders?.total || 0} icon={Icons.ShoppingCart} color="purple" subtitle={`${stats?.orders?.new || 0} ${t('newOrders')}`} />
        <StatsCard title={t('totalProducts')} value={stats?.products?.total || 0} icon={Icons.Package} color="orange" subtitle={`${stats?.products?.low_stock || 0} ${t('lowStock')}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('newOrders')} value={stats?.orders?.new || 0} icon={Icons.ShoppingCart} color="yellow" />
        <StatsCard title={t('processingOrders')} value={stats?.orders?.processing || 0} icon={Icons.ShoppingCart} color="cyan" />
        <StatsCard title={t('shippedOrders')} value={stats?.orders?.shipped || 0} icon={Icons.ShoppingCart} color="blue" />
        <StatsCard title={t('avgRating')} value={stats?.reviews?.avg_rating || 0} icon={Icons.Star} color="pink" subtitle={`${stats?.reviews?.total || 0} ${t('totalReviews')}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('salesChart')}</h3>
          <div className="h-64">
            {salesChart.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-2">
                {salesChart.map((day, idx) => {
                  const maxRevenue = Math.max(...salesChart.map(d => d.revenue)) || 1;
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <span className="text-xs text-slate-500 mb-1">{formatCurrency(day.revenue)}</span>
                      <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${Math.max(height, 5)}%`, minHeight: '20px' }}></div>
                      <span className="text-xs text-slate-500 mt-2">{new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}</span>
                    </div>
                  );
                })}
              </div>
            ) : <div className="h-full flex items-center justify-center text-slate-500">{t('noData')}</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('topProducts')}</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
                <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{product.title}</p><p className="text-xs text-slate-500">{product.total_sold} {language === 'ar' ? 'مبيع' : 'sold'}</p></div>
                <p className="text-sm font-bold text-emerald-500">{formatCurrency(product.total_revenue)}</p>
              </div>
            )) : <p className="text-slate-500 text-center py-4">{t('noData')}</p>}
          </div>
        </div>
      </div>

      {stats?.products?.low_stock > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="text-yellow-500"><Icons.AlertTriangle /></div>
          <div><p className="font-medium text-yellow-700 dark:text-yellow-400">{language === 'ar' ? 'تنبيه المخزون' : 'Stock Alert'}</p><p className="text-sm text-yellow-600 dark:text-yellow-500">{stats.products.low_stock} {language === 'ar' ? 'منتجات بمخزون منخفض' : 'products have low stock'}</p></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
