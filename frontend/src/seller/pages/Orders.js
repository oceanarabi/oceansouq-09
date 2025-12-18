import React, { useState, useEffect, useCallback } from 'react';
import { useSeller } from '../contexts/SellerContext';

const Icons = {
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
};

const Orders = () => {
  const { t, api, language } = useSeller();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) });
      const res = await api.get(`/api/seller/orders?${params}`);
      setOrders(res.data.orders || []);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (error) { console.error('Error:', error); setOrders([]); }
    finally { setLoading(false); }
  }, [api, statusFilter]);

  useEffect(() => { fetchOrders(pagination.page); }, [fetchOrders, pagination.page]);

  const handleFulfill = async (orderId) => {
    try {
      const params = trackingNumber ? `?tracking_number=${trackingNumber}` : '';
      await api.put(`/api/seller/orders/${orderId}/fulfill${params}`);
      setShowModal(false);
      setSelectedOrder(null);
      setTrackingNumber('');
      fetchOrders(pagination.page);
    } catch (error) { console.error('Error:', error); alert(error.response?.data?.detail || 'Error'); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatDate = (dateStr) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-purple-100 text-purple-700', shipped: 'bg-cyan-100 text-cyan-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>{t(status) || status}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('orders')}</h1><p className="text-slate-500">{language === 'ar' ? 'إدارة طلباتك' : 'Manage your orders'}</p></div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
          <option value="">{t('allOrders')}</option>
          {statuses.map(s => <option key={s} value={s}>{t(s)}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? <div className="p-8"><div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded"></div>)}</div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('orderId')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('customer')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('items')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('total')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('status')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('date')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {orders.length === 0 ? <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500">{t('noOrders')}</td></tr> : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.id?.slice(0, 8)}</td>
                    <td className="px-6 py-4"><div><p className="text-sm text-slate-900 dark:text-white">{order.customer?.name || order.shipping_name || '-'}</p><p className="text-xs text-slate-500">{order.customer?.email || '-'}</p></div></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.seller_items?.length || 0}</td>
                    <td className="px-6 py-4 font-medium text-emerald-500">{formatCurrency(order.seller_total)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-emerald-500" title={t('viewDetails')}><Icons.Eye /></button>
                        {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && <button onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg text-slate-500 hover:text-emerald-500" title={t('markShipped')}><Icons.Truck /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('orderDetails')} #{selectedOrder.id?.slice(0, 8)}</h2>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold mb-2">{t('shippingInfo')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedOrder.shipping_name || selectedOrder.customer?.name}</p>
                <p className="text-sm text-slate-500">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                <p className="text-sm text-slate-500">{selectedOrder.shipping_phone}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">{t('orderItems')}</h3>
                <div className="space-y-2">
                  {selectedOrder.seller_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <img src={item.product?.image_url || 'https://via.placeholder.com/48'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1"><p className="font-medium text-slate-900 dark:text-white">{item.product?.title || item.title}</p><p className="text-sm text-slate-500">{t('stock')}: {item.quantity}</p></div>
                      <p className="font-medium text-emerald-500">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mb-4"><span className="font-semibold">{t('total')}</span><span className="font-bold text-emerald-500">{formatCurrency(selectedOrder.seller_total)}</span></div>
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-medium mb-2">{t('trackingNumber')} ({language === 'ar' ? 'اختياري' : 'optional'})</label>
                  <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 mb-4" />
                  <button onClick={() => handleFulfill(selectedOrder.id)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">{t('markShipped')}</button>
                </div>
              )}
              <button onClick={() => { setShowModal(false); setSelectedOrder(null); }} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
