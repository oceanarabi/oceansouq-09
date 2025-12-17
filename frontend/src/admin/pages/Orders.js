import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DataTable from '../components/DataTable';
import {
  Search,
  Eye,
  ChevronDown
} from 'lucide-react';

const Orders = () => {
  const { t, api, language } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status })
      });
      
      const res = await api.get(`/api/admin/orders?${params}`);
      setOrders(res.data.orders);
      setPagination({
        page: res.data.page,
        pages: res.data.pages,
        total: res.data.total
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      shipped: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
      delivered: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {t(status) || status}
      </span>
    );
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  const columns = [
    {
      header: t('orderId'),
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-white">
          #{row.id?.slice(0, 8)}
        </span>
      )
    },
    {
      header: t('customer'),
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {row.user?.name || row.shipping_name || '-'}
          </p>
          <p className="text-xs text-slate-500">{row.user?.email || '-'}</p>
        </div>
      )
    },
    {
      header: t('total'),
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {formatCurrency(row.total)}
        </span>
      )
    },
    {
      header: t('status'),
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: t('date'),
      render: (row) => (
        <span className="text-slate-500">
          {formatDate(row.created_at)}
        </span>
      )
    },
    {
      header: t('actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedOrder(row); setShowModal(true); }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-500"
            title={t('viewDetails')}
          >
            <Eye size={18} />
          </button>
          <StatusDropdown
            currentStatus={row.status}
            statuses={statuses}
            onStatusChange={(status) => handleStatusUpdate(row.id, status)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('orders')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'إدارة وتتبع الطلبات' : 'Manage and track orders'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={t('searchOrders')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('allOrders')}</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{t(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        emptyMessage={t('noOrders')}
      />

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => { setShowModal(false); setSelectedOrder(null); }}
          onStatusChange={handleStatusUpdate}
          statuses={statuses}
        />
      )}
    </div>
  );
};

const StatusDropdown = ({ currentStatus, statuses, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useAdmin();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 flex items-center gap-1"
      >
        <ChevronDown size={18} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 min-w-[150px] z-50">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => { onStatusChange(status); setIsOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  currentStatus === status ? 'text-blue-500 font-medium' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const OrderDetailModal = ({ order, onClose, onStatusChange, statuses }) => {
  const { t, language } = useAdmin();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('orderDetails')} #{order.id?.slice(0, 8)}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </p>
            </div>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{t(status)}</option>
              ))}
            </select>
          </div>

          {/* Shipping Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{t('shippingInfo')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">{language === 'ar' ? 'الاسم' : 'Name'}</p>
                <p className="text-slate-900 dark:text-white">{order.shipping_name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                <p className="text-slate-900 dark:text-white">{order.shipping_phone || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                <p className="text-slate-900 dark:text-white">
                  {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{t('orderItems')}</h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <img
                    src={item.product?.image_url || 'https://via.placeholder.com/60'}
                    alt={item.product?.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.product?.title || item.title || 'Product'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              )) || (
                <p className="text-slate-500 text-center py-4">
                  {language === 'ar' ? 'لا توجد عناصر' : 'No items'}
                </p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-900 dark:text-white">{t('total')}</span>
              <span className="text-blue-500">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
