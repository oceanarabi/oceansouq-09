import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const Icons = {
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" /></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
};

const Settings = () => {
  const { t, api, language, admin } = useAdmin();
  const [settings, setSettings] = useState({ site_name: 'Ocean', maintenance_mode: false, default_currency: 'USD', default_language: 'en' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSettings = useCallback(async () => {
    try { const res = await api.get('/api/admin/settings'); setSettings(res.data); }
    catch (error) { console.error('Error fetching settings:', error); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true); setMessage(null);
    try { await api.put('/api/admin/settings', settings); setMessage({ type: 'success', text: language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully' }); }
    catch (error) { setMessage({ type: 'error', text: error.response?.data?.detail || 'Error saving settings' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6"><div className="animate-pulse space-y-6"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div><div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div></div></div>;

  const isSuperAdmin = admin?.role === 'super_admin';

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1><p className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'إعدادات المنصة العامة' : 'Platform general settings'}</p></div>

      {!isSuperAdmin && <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4 flex items-start gap-3"><div className="text-yellow-500 mt-0.5"><Icons.AlertCircle /></div><div><p className="font-medium text-yellow-700 dark:text-yellow-400">{language === 'ar' ? 'صلاحيات محدودة' : 'Limited Access'}</p><p className="text-sm text-yellow-600 dark:text-yellow-500">{language === 'ar' ? 'فقط المدير العام يمكنه تعديل الإعدادات' : 'Only Super Admin can modify settings'}</p></div></div>}

      {message && <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>{message.text}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('generalSettings')}</h2>
        <div className="space-y-6">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('siteName')}</label><input type="text" value={settings.site_name || ''} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} disabled={!isSuperAdmin} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" /></div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><div><p className="font-medium text-slate-900 dark:text-white">{t('maintenanceMode')}</p><p className="text-sm text-slate-500">{language === 'ar' ? 'عند التفعيل، سيرى المستخدمون صفحة الصيانة' : 'When enabled, users will see maintenance page'}</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.maintenance_mode || false} onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })} disabled={!isSuperAdmin} className="sr-only peer" /><div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 peer-disabled:opacity-50"></div></label></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('defaultCurrency')}</label><select value={settings.default_currency || 'USD'} onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })} disabled={!isSuperAdmin} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"><option value="USD">USD - US Dollar</option><option value="SAR">SAR - Saudi Riyal</option><option value="AED">AED - UAE Dirham</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('defaultLanguage')}</label><select value={settings.default_language || 'en'} onChange={(e) => setSettings({ ...settings, default_language: e.target.value })} disabled={!isSuperAdmin} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"><option value="en">English</option><option value="ar">العربية</option></select></div>
        </div>
        {isSuperAdmin && <button onClick={handleSave} disabled={saving} className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"><Icons.Save />{saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('saveChanges')}</button>}
      </div>
    </div>
  );
};

export default Settings;
