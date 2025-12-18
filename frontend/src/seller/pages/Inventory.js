import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';
import StatsCard from '../components/StatsCard';

const Icons = {
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  XCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const Inventory = () => {
  const { t, api, language } = useSeller();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState({});

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/api/seller/inventory');
        setInventory(res.data);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchInventory();
  }, [api]);

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await api.put(`/api/seller/products/${productId}/stock?stock=${newStock}`);
      const res = await api.get('/api/seller/inventory');
      setInventory(res.data);
      setEditingStock({});
    } catch (error) { console.error('Error:', error); }
  };

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div><div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('inventory')}</h1><p className="text-slate-500">{t('inventoryOverview')}</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('totalProducts')} value={inventory?.total_products || 0} icon={Icons.Package} color="blue" />
        <StatsCard title={t('totalItems')} value={inventory?.total_items || 0} icon={Icons.Package} color="emerald" />
        <StatsCard title={t('lowStock')} value={inventory?.low_stock_count || 0} icon={Icons.AlertTriangle} color="yellow" />
        <StatsCard title={t('outOfStock')} value={inventory?.out_of_stock_count || 0} icon={Icons.XCircle} color="red" />
      </div>

      {inventory?.low_stock_products?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('lowStockProducts')}</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('productName')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('stock')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {inventory.low_stock_products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={product.image_url || 'https://via.placeholder.com/48'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium text-slate-900 dark:text-white">{product.title}</p><p className="text-xs text-slate-500">{product.category}</p></div></div></td>
                    <td className="px-6 py-4">
                      {editingStock[product.id] !== undefined ? (
                        <input type="number" value={editingStock[product.id]} onChange={(e) => setEditingStock({ ...editingStock, [product.id]: parseInt(e.target.value) || 0 })} className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" />
                      ) : (
                        <span className={`font-medium ${product.stock < 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{product.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingStock[product.id] !== undefined ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleStockUpdate(product.id, editingStock[product.id])} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm">{t('save')}</button>
                          <button onClick={() => setEditingStock({})} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">{t('cancel')}</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingStock({ [product.id]: product.stock })} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm">{t('updateStock')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inventory?.out_of_stock_products?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-semibold text-red-500">{t('outOfStock')}</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('productName')}</th>
                  <th className={`px-6 py-4 text-${language === 'ar' ? 'right' : 'left'} text-xs font-semibold text-slate-500 uppercase`}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {inventory.out_of_stock_products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={product.image_url || 'https://via.placeholder.com/48'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium text-slate-900 dark:text-white">{product.title}</p><p className="text-xs text-slate-500">{product.category}</p></div></div></td>
                    <td className="px-6 py-4">
                      {editingStock[product.id] !== undefined ? (
                        <div className="flex gap-2 items-center">
                          <input type="number" value={editingStock[product.id]} onChange={(e) => setEditingStock({ ...editingStock, [product.id]: parseInt(e.target.value) || 0 })} className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" />
                          <button onClick={() => handleStockUpdate(product.id, editingStock[product.id])} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm">{t('save')}</button>
                          <button onClick={() => setEditingStock({})} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">{t('cancel')}</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingStock({ [product.id]: 0 })} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">{t('updateStock')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
