import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SharedLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '', is_public: false });
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language') || 'en';

  const t = (key) => {
    const translations = {
      en: {
        sharedLists: 'Shopping Lists',
        createList: 'Create New List',
        noLists: 'No shopping lists yet',
        createFirst: 'Create your first list to save and share products!',
        listName: 'List Name',
        description: 'Description (optional)',
        makePublic: 'Make this list public',
        create: 'Create',
        cancel: 'Cancel',
        products: 'products',
        view: 'View',
        delete: 'Delete',
        share: 'Share',
        public: 'Public',
        private: 'Private'
      },
      ar: {
        sharedLists: 'قوائم التسوق',
        createList: 'إنشاء قائمة جديدة',
        noLists: 'لا توجد قوائم تسوق بعد',
        createFirst: 'أنشئ قائمتك الأولى لحفظ ومشاركة المنتجات!',
        listName: 'اسم القائمة',
        description: 'الوصف (اختياري)',
        makePublic: 'جعل القائمة عامة',
        create: 'إنشاء',
        cancel: 'إلغاء',
        products: 'منتجات',
        view: 'عرض',
        delete: 'حذف',
        share: 'مشاركة',
        public: 'عامة',
        private: 'خاصة'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/shared-lists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists(res.data || []);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
    setLoading(false);
  };

  const createList = async () => {
    if (!newList.name.trim()) return;
    
    try {
      const res = await axios.post(`${API_URL}/api/shared-lists`, newList, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists([...lists, res.data]);
      setShowCreateModal(false);
      setNewList({ name: '', description: '', is_public: false });
    } catch (err) {
      console.error('Error creating list:', err);
    }
  };

  const deleteList = async (listId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه القائمة؟' : 'Are you sure you want to delete this list?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/shared-lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists(lists.filter(l => l.id !== listId));
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const shareList = (listId) => {
    const url = `${window.location.origin}/shared-list/${listId}`;
    navigator.clipboard.writeText(url);
    alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{t('sharedLists')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {language === 'ar' ? 'سجل دخول لإنشاء قوائم التسوق' : 'Login to create shopping lists'}
        </p>
        <Link to="/login" className="inline-block bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-xl font-semibold">
          {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
          <span>📋</span> {t('sharedLists')}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2"
        >
          <span>+</span> {t('createList')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold mb-2 dark:text-white">{t('noLists')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('createFirst')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-3 rounded-xl font-semibold"
          >
            {t('createList')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lists.map(list => (
            <div key={list.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold dark:text-white">{list.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {list.products?.length || 0} {t('products')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  list.is_public 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {list.is_public ? t('public') : t('private')}
                </span>
              </div>
              
              {list.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {list.description}
                </p>
              )}

              <div className="flex gap-2">
                <Link
                  to={`/shared-list/${list.id}`}
                  className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white py-2 rounded-lg text-sm font-semibold text-center transition"
                >
                  {t('view')}
                </Link>
                <button
                  onClick={() => shareList(list.id)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                  title={t('share')}
                >
                  🔗
                </button>
                <button
                  onClick={() => deleteList(list.id)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition"
                  title={t('delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 dark:text-white">{t('createList')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">{t('listName')}</label>
                <input
                  type="text"
                  value={newList.name}
                  onChange={(e) => setNewList({...newList, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder={language === 'ar' ? 'مثال: هدايا العيد' : 'e.g., Birthday Gifts'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">{t('description')}</label>
                <textarea
                  value={newList.description}
                  onChange={(e) => setNewList({...newList, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  rows={3}
                />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newList.is_public}
                  onChange={(e) => setNewList({...newList, is_public: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="dark:text-white">{t('makePublic')}</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={createList}
                className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white py-2 rounded-lg font-semibold"
              >
                {t('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedLists;
