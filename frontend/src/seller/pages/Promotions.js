import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';

const Icons = {
  Tag: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Bolt: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
};

const Promotions = () => {
  const { t, api, language } = useSeller();
  const [activeTab, setActiveTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' });
  const [flashForm, setFlashForm] = useState({ product_id: '', discount_percentage: '', starts_at: '', ends_at: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couponsRes, flashRes, productsRes] = await Promise.all([
          api.get('/api/seller/coupons'),
          api.get('/api/seller/flash-sales'),
          api.get('/api/seller/products?limit=100')
        ]);
        setCoupons(couponsRes.data || []);
        setFlashSales(flashRes.data || []);
        setProducts(productsRes.data.products || []);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [api]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const data = { ...couponForm, discount_value: parseFloat(couponForm.discount_value), min_order: parseFloat(couponForm.min_order) || 0, max_uses: parseInt(couponForm.max_uses) || null };
      await api.post('/api/seller/coupons', data);
      const res = await api.get('/api/seller/coupons');
      setCoupons(res.data || []);
      setShowCouponModal(false);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' });
    } catch (error) { alert(error.response?.data?.detail || 'Error'); }
  };

  const handleCreateFlashSale = async (e) => {
    e.preventDefault();
    try {
      const data = { ...flashForm, discount_percentage: parseFloat(flashForm.discount_percentage) };
      await api.post('/api/seller/flash-sales', data);
      const res = await api.get('/api/seller/flash-sales');
      setFlashSales(res.data || []);
      setShowFlashModal(false);
      setFlashForm({ product_id: '', discount_percentage: '', starts_at: '', ends_at: '' });
    } catch (error) { alert(error.response?.data?.detail || 'Error'); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try { await api.delete(`/api/seller/coupons/${id}`); setCoupons(coupons.filter(c => c.id !== id)); }
    catch (error) { console.error('Error:', error); }
  };

  const handleDeleteFlashSale = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try { await api.delete(`/api/seller/flash-sales/${id}`); setFlashSales(flashSales.filter(s => s.id !== id)); }
    catch (error) { console.error('Error:', error); }
  };

  const formatDate = (dateStr) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('promotions')}</h1><p className="text-slate-500">{language === 'ar' ? 'إدارة الكوبونات والعروض' : 'Manage coupons and flash sales'}</p></div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setActiveTab('coupons')} className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'coupons' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Icons.Tag />{t('coupons')}</button>
        <button onClick={() => setActiveTab('flashSales')} className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'flashSales' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Icons.Bolt />{t('flashSales')}</button>
      </div>

      {activeTab === 'coupons' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('coupons')}</h3>
            <button onClick={() => setShowCouponModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"><Icons.Plus />{t('createCoupon')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('couponCode')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('discountType')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('discountValue')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('expiresAt')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {coupons.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">{t('noCoupons')}</td></tr> : coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-500">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{coupon.discount_type === 'percentage' ? t('percentage') : t('fixed')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(coupon.expires_at)}</td>
                    <td className="px-6 py-4"><button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500"><Icons.Trash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'flashSales' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('flashSales')}</h3>
            <button onClick={() => setShowFlashModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"><Icons.Plus />{t('createFlashSale')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('productName')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('discountPercentage')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('startDate')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('endDate')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {flashSales.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">{t('noFlashSales')}</td></tr> : flashSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={sale.product?.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm font-medium text-slate-900 dark:text-white">{sale.product?.title}</span></div></td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500">-{sale.discount_percentage}%</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sale.starts_at)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sale.ends_at)}</td>
                    <td className="px-6 py-4"><button onClick={() => handleDeleteFlashSale(sale.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500"><Icons.Trash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('createCoupon')}</h2>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('couponCode')}</label><input type="text" required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-mono" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('discountType')}</label><select required value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"><option value="percentage">{t('percentage')}</option><option value="fixed">{t('fixed')}</option></select></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('discountValue')}</label><input type="number" step="0.01" required value={couponForm.discount_value} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('minOrder')}</label><input type="number" step="0.01" value={couponForm.min_order} onChange={(e) => setCouponForm({ ...couponForm, min_order: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('maxUses')}</label><input type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('expiresAt')}</label><input type="datetime-local" value={couponForm.expires_at} onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">{t('create')}</button><button type="button" onClick={() => setShowCouponModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium">{t('cancel')}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showFlashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('createFlashSale')}</h2>
              <form onSubmit={handleCreateFlashSale} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('selectProduct')}</label><select required value={flashForm.product_id} onChange={(e) => setFlashForm({ ...flashForm, product_id: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"><option value="">{language === 'ar' ? 'اختر منتج' : 'Select a product'}</option>{products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('discountPercentage')}</label><input type="number" min="1" max="99" required value={flashForm.discount_percentage} onChange={(e) => setFlashForm({ ...flashForm, discount_percentage: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('startDate')}</label><input type="datetime-local" required value={flashForm.starts_at} onChange={(e) => setFlashForm({ ...flashForm, starts_at: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('endDate')}</label><input type="datetime-local" required value={flashForm.ends_at} onChange={(e) => setFlashForm({ ...flashForm, ends_at: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" /></div>
                </div>
                <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">{t('create')}</button><button type="button" onClick={() => setShowFlashModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium">{t('cancel')}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
