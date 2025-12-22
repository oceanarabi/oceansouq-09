import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LanguageSettings = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/platform/languages`);
      setLanguages(res.data.languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Set default languages if API fails
      setLanguages([
        { code: 'ar', name: 'Arabic', name_native: 'العربية', flag: '🇸🇦', enabled: true, is_default: true, rtl: true },
        { code: 'en', name: 'English', name_native: 'English', flag: '🇺🇸', enabled: true, is_default: false, rtl: false },
        { code: 'tr', name: 'Turkish', name_native: 'Türkçe', flag: '🇹🇷', enabled: false, is_default: false, rtl: false },
        { code: 'de', name: 'German', name_native: 'Deutsch', flag: '🇩🇪', enabled: false, is_default: false, rtl: false },
        { code: 'zh', name: 'Chinese', name_native: '中文', flag: '🇨🇳', enabled: false, is_default: false, rtl: false },
        { code: 'fr', name: 'French', name_native: 'Français', flag: '🇫🇷', enabled: false, is_default: false, rtl: false },
        { code: 'ur', name: 'Urdu', name_native: 'اردو', flag: '🇵🇰', enabled: false, is_default: false, rtl: true },
        { code: 'hi', name: 'Hindi', name_native: 'हिन्दी', flag: '🇮🇳', enabled: false, is_default: false, rtl: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = async (code) => {
    const lang = languages.find(l => l.code === code);
    if (!lang) return;

    // Prevent disabling if it's the only enabled language
    const enabledCount = languages.filter(l => l.enabled).length;
    if (lang.enabled && enabledCount <= 1) {
      setMessage({ type: 'error', text: 'يجب أن تبقى لغة واحدة على الأقل مفعلة' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Prevent disabling default language
    if (lang.enabled && lang.is_default) {
      setMessage({ type: 'error', text: 'لا يمكن تعطيل اللغة الافتراضية' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const updatedLanguages = languages.map(l => 
      l.code === code ? { ...l, enabled: !l.enabled } : l
    );
    setLanguages(updatedLanguages);

    try {
      await axios.patch(`${API_URL}/api/platform/languages/${code}/toggle?enabled=${!lang.enabled}`);
      setMessage({ type: 'success', text: `تم ${lang.enabled ? 'تعطيل' : 'تفعيل'} اللغة ${lang.name_native}` });
    } catch (error) {
      console.error('Error toggling language:', error);
      // Revert on error
      setLanguages(languages);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث اللغة' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const setDefaultLanguage = async (code) => {
    const lang = languages.find(l => l.code === code);
    if (!lang || !lang.enabled) {
      setMessage({ type: 'error', text: 'يجب تفعيل اللغة أولاً قبل جعلها افتراضية' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const updatedLanguages = languages.map(l => ({
      ...l,
      is_default: l.code === code
    }));
    setLanguages(updatedLanguages);

    try {
      await axios.patch(`${API_URL}/api/platform/languages/${code}/default`);
      setMessage({ type: 'success', text: `تم تعيين ${lang.name_native} كلغة افتراضية` });
    } catch (error) {
      console.error('Error setting default language:', error);
      setLanguages(languages);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تعيين اللغة الافتراضية' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/platform/languages`, languages);
      setMessage({ type: 'success', text: 'تم حفظ إعدادات اللغات بنجاح' });
    } catch (error) {
      console.error('Error saving languages:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const enabledLanguages = languages.filter(l => l.enabled);
  const disabledLanguages = languages.filter(l => !l.enabled);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات اللغات</h1>
          <p className="text-gray-500 mt-1">إدارة اللغات المتاحة في المنصة</p>
        </div>
        <button
          onClick={saveAllChanges}
          disabled={saving}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              حفظ التغييرات
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-3xl font-bold text-cyan-600">{languages.length}</div>
          <div className="text-gray-500 text-sm">إجمالي اللغات</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{enabledLanguages.length}</div>
          <div className="text-gray-500 text-sm">لغات مفعلة</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-3xl font-bold text-gray-400">{disabledLanguages.length}</div>
          <div className="text-gray-500 text-sm">لغات معطلة</div>
        </div>
      </div>

      {/* Enabled Languages */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-green-500">●</span>
            اللغات المفعلة
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {enabledLanguages.map((lang) => (
            <div key={lang.code} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {lang.name_native}
                    {lang.is_default && (
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                        افتراضية
                      </span>
                    )}
                    {lang.rtl && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        RTL
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{lang.name} ({lang.code.toUpperCase()})</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!lang.is_default && (
                  <button
                    onClick={() => setDefaultLanguage(lang.code)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    تعيين كافتراضية
                  </button>
                )}
                <button
                  onClick={() => toggleLanguage(lang.code)}
                  disabled={lang.is_default}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lang.enabled ? 'bg-green-500' : 'bg-gray-300'
                  } ${lang.is_default ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      lang.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disabled Languages */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-gray-400">●</span>
            اللغات المعطلة
          </h2>
          <p className="text-sm text-gray-500 mt-1">قم بتفعيل اللغات التي تريد إضافتها للمنصة</p>
        </div>
        <div className="divide-y divide-gray-100">
          {disabledLanguages.map((lang) => (
            <div key={lang.code} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-3xl opacity-50">{lang.flag}</span>
                <div>
                  <div className="font-medium text-gray-500 flex items-center gap-2">
                    {lang.name_native}
                    {lang.rtl && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-500 text-xs rounded-full">
                        RTL
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{lang.name} ({lang.code.toUpperCase()})</div>
                </div>
              </div>
              <button
                onClick={() => toggleLanguage(lang.code)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors hover:bg-gray-400"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-700">ملاحظة</h4>
            <p className="text-sm text-blue-600 mt-1">
              عند تفعيل لغة جديدة، سيتمكن المستخدمون من تغيير لغة الواجهة إليها. 
              تأكد من توفر الترجمات المطلوبة قبل تفعيل اللغة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
