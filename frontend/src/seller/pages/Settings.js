import React, { useState, useEffect } from 'react';
import { useSeller } from '../contexts/SellerContext';

const Settings = () => {
  const { t, api, language } = useSeller();
  const [settings, setSettings] = useState({
    store_name: '',
    store_description: '',
    logo_url: '',
    banner_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    bank_name: '',
    bank_account: '',
    bank_iban: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/seller/settings');
        setSettings(res.data);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, [api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/api/seller/settings', settings);
      setMessage(t('settingsSaved'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) { setMessage(error.response?.data?.detail || t('error')); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6"><div className="animate-pulse"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div><div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}</div></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1><p className="text-slate-500">{t('storeSettings')}</p></div>

      {message && <div className={`p-4 rounded-xl ${message === t('settingsSaved') ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{language === 'ar' ? 'معلومات المتجر' : 'Store Information'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('storeName')}</label><input type="text" value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contactEmail')}</label><input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('storeDescription')}</label><textarea rows="3" value={settings.store_description} onChange={(e) => setSettings({ ...settings, store_description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500"></textarea></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('contactPhone')}</label><input type="tel" value={settings.contact_phone} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('address')}</label><input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{language === 'ar' ? 'صور المتجر' : 'Store Images'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{language === 'ar' ? 'رابط الشعار' : 'Logo URL'}</label>
              <input type="url" value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" />
              {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="mt-2 w-20 h-20 rounded-xl object-cover" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{language === 'ar' ? 'رابط البانر' : 'Banner URL'}</label>
              <input type="url" value={settings.banner_url} onChange={(e) => setSettings({ ...settings, banner_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" />
              {settings.banner_url && <img src={settings.banner_url} alt="Banner" className="mt-2 w-full h-24 rounded-xl object-cover" />}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('bankDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('bankName')}</label><input type="text" value={settings.bank_name} onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('bankAccount')}</label><input type="text" value={settings.bank_account} onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('bankIban')}</label><input type="text" value={settings.bank_iban} onChange={(e) => setSettings({ ...settings, bank_iban: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
        </div>

        <div className="flex justify-end"><button type="submit" disabled={saving} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium">{saving ? t('loading') : t('saveChanges')}</button></div>
      </form>
    </div>
  );
};

export default Settings;
