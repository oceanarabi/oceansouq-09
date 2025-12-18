import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';
import StatsCard from '../components/StatsCard';

const Icons = {
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const Finance = () => {
  const { t, api, language } = useSeller();
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, transRes] = await Promise.all([
          api.get('/api/seller/finance/overview'),
          api.get(`/api/seller/finance/transactions?page=${pagination.page}&limit=20`)
        ]);
        setOverview(overviewRes.data);
        setTransactions(transRes.data.transactions || []);
        setPagination({ page: transRes.data.page, pages: transRes.data.pages, total: transRes.data.total });
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [api, pagination.page]);

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatDate = (dateStr) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 rounded w-48 mb-6"></div><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('finance')}</h1><p className="text-slate-500">{t('financeOverview')}</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('totalRevenue')} value={formatCurrency(overview?.total_revenue)} icon={Icons.DollarSign} color="emerald" />
        <StatsCard title={t('commission')} value={formatCurrency(overview?.commission)} icon={Icons.DollarSign} color="red" subtitle={`${overview?.commission_rate || 10}%`} />
        <StatsCard title={t('pendingPayout')} value={formatCurrency(overview?.pending_payout)} icon={Icons.DollarSign} color="yellow" />
        <StatsCard title={t('netEarnings')} value={formatCurrency(overview?.net_earnings)} icon={Icons.DollarSign} color="blue" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('transactionHistory')}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('date')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('orderId')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('productName')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('grossAmount')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('commission')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('netAmount')}</th>
                <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.length === 0 ? <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">{t('noData')}</td></tr> : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{tx.order_id?.slice(0, 8)}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><img src={tx.product?.image_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded object-cover" /><span className="text-sm text-slate-900 dark:text-white truncate max-w-[150px]">{tx.product?.title}</span></div></td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{formatCurrency(tx.gross_amount)}</td>
                  <td className="px-6 py-4 text-sm text-red-500">-{formatCurrency(tx.commission)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-500">{formatCurrency(tx.net_amount)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{tx.status === 'paid' ? t('paid') : t('pending')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between"><p className="text-sm text-slate-500">{t('showing')} {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} {t('of')} {pagination.total}</p><div className="flex gap-2"><button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('previous')}</button><button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('next')}</button></div></div>}
      </div>
    </div>
  );
};

export default Finance;
