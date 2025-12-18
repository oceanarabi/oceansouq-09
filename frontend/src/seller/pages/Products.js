import React, { useState, useEffect, useCallback } from 'react';
import { useSeller } from '../contexts/SellerContext';

const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
};

const Products = () => {
  const { t, api, language } = useSeller();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '', stock: '', image_url: '' });

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys', 'Food', 'Health', 'Automotive'];

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...(search && { search }) });
      const res = await api.get(`/api/seller/products?${params}`);
      setProducts(res.data.products || []);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (error) { console.error('Error:', error); setProducts([]); }
    finally { setLoading(false); }
  }, [api, search]);

  useEffect(() => { fetchProducts(pagination.page); }, [fetchProducts, pagination.page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) };
      if (editingProduct) {
        await api.put(`/api/seller/products/${editingProduct.id}`, data);
      } else {
        await api.post('/api/seller/products', data);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ title: '', description: '', price: '', category: '', stock: '', image_url: '' });
      fetchProducts(1);
    } catch (error) { console.error('Error:', error); alert(error.response?.data?.detail || 'Error'); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ title: product.title, description: product.description || '', price: product.price, category: product.category, stock: product.stock, image_url: product.image_url || '' });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try { await api.delete(`/api/seller/products/${productId}`); fetchProducts(1); }
    catch (error) { console.error('Error:', error); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const getStatusBadge = (status) => {
    const colors = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>{t(status) || t('pending')}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('products')}</h1><p className="text-slate-500">{language === 'ar' ? 'إدارة منتجاتك' : 'Manage your products'}</p></div>
        <button onClick={() => { setEditingProduct(null); setFormData({ title: '', description: '', price: '', category: '', stock: '', image_url: '' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"><Icons.Plus /> {t('addProduct')}</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-md"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div><input type="text" placeholder={t('searchProducts')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? <div className="p-8"><div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded"></div>)}</div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('productName')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('category')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('price')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('stock')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('status')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {products.length === 0 ? <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">{t('noProducts')}</td></tr> : products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={product.image_url || 'https://via.placeholder.com/48'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium text-slate-900 dark:text-white">{product.title}</p><p className="text-xs text-slate-500">{product.id?.slice(0, 8)}</p></div></div></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4"><span className={`text-sm font-medium ${product.stock < 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{product.stock}</span></td>
                    <td className="px-6 py-4">{getStatusBadge(product.approval_status)}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><button onClick={() => handleEdit(product)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-emerald-500"><Icons.Edit /></button><button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500"><Icons.Trash /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between"><p className="text-sm text-slate-500">{t('showing')} {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} {t('of')} {pagination.total}</p><div className="flex gap-2"><button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('previous')}</button><button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-50">{t('next')}</button></div></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{editingProduct ? t('editProduct') : t('addProduct')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('productName')}</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('description')}</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"></textarea></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('price')}</label><input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('stock')}</label><input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('category')}</label><select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"><option value="">{language === 'ar' ? 'اختر فئة' : 'Select category'}</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</label><input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">{t('save')}</button><button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium">{t('cancel')}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
