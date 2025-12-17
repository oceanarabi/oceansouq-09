import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import StatsCard from '../components/StatsCard';
import AlertCard from '../components/AlertCard';

// SVG Icons
const Icons = {
  DollarSign: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const Dashboard = () => {
  const { t, api, language } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes, alertsRes, revenueRes] = await Promise.all([
          api.get('/api/admin/dashboard/stats'),
          api.get('/api/admin/dashboard/recent-orders?limit=5'),
          api.get('/api/admin/dashboard/alerts'),
          api.get('/api/admin/dashboard/revenue-chart?days=7')
        ]);
        
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setAlerts(alertsRes.data);
        setRevenueData(revenueRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [api]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('overview')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'مرحباً بك في لوحة تحكم Ocean' : 'Welcome to Ocean Dashboard'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('totalRevenue')}
          value={formatCurrency(stats?.revenue?.total)}
          icon={Icons.DollarSign}
          color="green"
        />
        <StatsCard
          title={t('totalOrders')}
          value={stats?.orders?.total || 0}
          icon={Icons.ShoppingCart}
          color="blue"
        />
        <StatsCard
          title={t('totalUsers')}
          value={stats?.users?.total || 0}
          icon={Icons.Users}
          color="purple"
        />
        <StatsCard
          title={t('totalProducts')}
          value={stats?.products?.total || 0}
          icon={Icons.Package}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('pendingOrders')}
          value={stats?.orders?.pending || 0}
          icon={Icons.Clock}
          color="cyan"
        />
        <StatsCard
          title={t('pendingApprovals')}
          value={stats?.products?.pending_approval || 0}
          icon={Icons.Package}
          color="pink"
        />
        <StatsCard
          title={t('newUsersToday')}
          value={stats?.users?.new_today || 0}
          icon={Icons.TrendingUp}
          color="green"
        />
        <StatsCard
          title={t('totalSellers')}
          value={stats?.sellers?.total || 0}
          icon={Icons.Users}
          color="blue"
        />
      </div>

      {/* Charts and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('revenueChart')}</h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-2">
                {revenueData.map((day, idx) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue)) || 1;
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs text-slate-500 mb-1">
                          {formatCurrency(day.revenue)}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${Math.max(height, 5)}%`, minHeight: '20px' }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2">
                        {new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <AlertCard alerts={alerts} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('recentOrders')}</h3>
          <a href="/admin/orders" className="text-blue-500 hover:text-blue-600 text-sm">
            {language === 'ar' ? 'عرض الكل' : 'View All'}
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                <th className={`pb-3 font-medium text-${language === 'ar' ? 'right' : 'left'}`}>{t('orderId')}</th>
                <th className={`pb-3 font-medium text-${language === 'ar' ? 'right' : 'left'}`}>{t('customer')}</th>
                <th className={`pb-3 font-medium text-${language === 'ar' ? 'right' : 'left'}`}>{t('total')}</th>
                <th className={`pb-3 font-medium text-${language === 'ar' ? 'right' : 'left'}`}>{t('status')}</th>
                <th className={`pb-3 font-medium text-${language === 'ar' ? 'right' : 'left'}`}>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    {t('noOrders')}
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                      #{order.id?.slice(0, 8)}
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                      {order.user?.name || order.shipping_name || '-'}
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    shipped: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
      {status}
    </span>
  );
};

export default Dashboard;
