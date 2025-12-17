import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DataTable from '../components/DataTable';
import {
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Eye,
  Package
} from 'lucide-react';

const Products = () => {
  const { t, api, language } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category })
      });
      
      const res = await api.get(`/api/admin/products?${params}`);
      setProducts(res.data.products);
      setPagination({
        page: res.data.page,
        pages: res.data.pages,
        total: res.data.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/admin/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await api.put(`/api/admin/products/${productId}/approve`, { status: 'approved' });
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleReject = async (productId) => {
    try {
      await api.put(`/api/admin/products/${productId}/approve`, { status: 'rejected' });
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await api.delete(`/api/admin/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status || 'pending'}
      </span>
    );
  };

  const columns = [
    {
      header: t('productName'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image_url || '/placeholder.png'}
            alt={row.title}
            className="w-12 h-12 rounded-lg object-cover bg-slate-100"
            onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
          />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.title}</p>
            <p className="text-xs text-slate-500">{row.id?.slice(0, 8)}</p>
          </div>
        </div>
      )
    },
    {
      header: t('category'),
      accessor: 'category'
    },
    {
      header: t('price'),
      render: (row) => formatCurrency(row.price)
    },
    {
      header: t('stock'),
      render: (row) => (
        <span className={row.stock < 5 ? 'text-red-500 font-medium' : ''}>
          {row.stock}
        </span>
      )
    },
    {
      header: t('seller'),
      render: (row) => row.seller?.name || '-'
    },
    {
      header: t('status'),
      render: (row) => getStatusBadge(row.approval_status)
    },
    {
      header: t('actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedProduct(row); setShowModal(true); }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-500"
            title={t('viewDetails')}
          >
            <Eye size={18} />
          </button>
          {row.approval_status !== 'approved' && (
            <button
              onClick={() => handleApprove(row.id)}
              className="p-2 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg text-slate-500 hover:text-green-500"
              title={t('approve')}
            >
              <Check size={18} />
            </button>
          )}
          {row.approval_status !== 'rejected' && (
            <button
              onClick={() => handleReject(row.id)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500"
              title={t('reject')}
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500"
            title={t('delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('products')}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'إدارة ومراجعة المنتجات' : 'Manage and review products'}
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
                placeholder={t('searchProducts')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filterByCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.product_count})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filterByStatus')}</option>
            <option value="pending">{t('pendingProducts')}</option>
            <option value="approved">{t('approvedProducts')}</option>
            <option value="rejected">{t('rejectedProducts')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        emptyMessage={t('noProducts')}
      />

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => { setShowModal(false); setSelectedProduct(null); }}
          onApprove={() => { handleApprove(selectedProduct.id); setShowModal(false); }}
          onReject={() => { handleReject(selectedProduct.id); setShowModal(false); }}
        />
      )}
    </div>
  );
};

const ProductDetailModal = ({ product, onClose, onApprove, onReject }) => {
  const { t, language } = useAdmin();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={product.image_url || 'https://via.placeholder.com/200'}
              alt={product.title}
              className="w-40 h-40 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{product.title}</h2>
              <p className="text-slate-500 mt-1">{product.category}</p>
              <p className="text-2xl font-bold text-blue-500 mt-2">
                ${product.price?.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {t('stock')}: {product.stock}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300">{product.description}</p>
          </div>

          {product.seller && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {t('seller')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">{product.seller.name}</p>
              <p className="text-sm text-slate-500">{product.seller.email}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              {t('approve')}
            </button>
            <button
              onClick={onReject}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              {t('reject')}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
