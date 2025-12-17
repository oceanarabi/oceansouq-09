import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import StatsCard from '../components/StatsCard';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';

const Analytics = () => {
  const { t, api, language } = useAdmin();
  const [period, setPeriod] = useState('week');
  const [salesData, setSalesData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [salesRes, usersRes] = await Promise.all([
        api.get(`/api/admin/analytics/sales?period=${period}`),
        api.get('/api/admin/analytics/users')
      ]);
      
      setSalesData(salesRes.data);
      setUserStats(usersRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('analytics')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'تحليلات وإحصائيات المنصة' : 'Platform analytics and statistics'}
          </p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {t(p === 'day' ? 'today' : p === 'week' ? 'thisWeek' : p === 'month' ? 'thisMonth' : 'thisYear')}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('salesAnalytics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('totalRevenue')}
            value={formatCurrency(salesData?.total_revenue)}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title={t('totalOrders')}
            value={salesData?.total_orders || 0}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard
            title={t('avgOrderValue')}
            value={formatCurrency(salesData?.avg_order_value)}
            icon={TrendingUp}
            color="purple"
          />
          <StatsCard
            title={t('period')}
            value={t(period === 'day' ? 'today' : period === 'week' ? 'thisWeek' : period === 'month' ? 'thisMonth' : 'thisYear')}
            icon={Package}
            color="cyan"
          />
        </div>
      </div>

      {/* Top Products */}
      {salesData?.top_products?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('topProducts')}</h3>
          <div className="space-y-4">
            {salesData.top_products.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300">
                  {idx + 1}
                </span>
                <img
                  src={product.image_url || 'https://via.placeholder.com/48'}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{product.title}</p>
                  <p className="text-sm text-slate-500">
                    {language === 'ar' ? 'المبيعات' : 'Sold'}: {product.total_sold}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(product.total_revenue)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {language === 'ar' ? 'الإيرادات' : 'Revenue'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('userAnalytics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('totalUsers')}
            value={userStats?.total || 0}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title={t('buyers')}
            value={userStats?.by_role?.buyers || 0}
            icon={Users}
            color="green"
          />
          <StatsCard
            title={t('sellers')}
            value={userStats?.by_role?.sellers || 0}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title={t('admins')}
            value={userStats?.by_role?.admins || 0}
            icon={Users}
            color="orange"
          />
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('userGrowth')}</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">{t('thisWeek')}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              +{userStats?.growth?.this_week || 0}
            </p>
            <p className="text-sm text-green-500">{language === 'ar' ? 'مستخدم جديد' : 'new users'}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">{t('thisMonth')}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              +{userStats?.growth?.this_month || 0}
            </p>
            <p className="text-sm text-green-500">{language === 'ar' ? 'مستخدم جديد' : 'new users'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
