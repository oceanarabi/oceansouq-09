import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const getTranslation = (lang, key) => {
  const translations = {
    en: { login: 'Login', register: 'Register', shopNow: 'Shop Now' },
    ar: { login: 'تسجيل الدخول', register: 'إنشاء حساب', shopNow: 'تسوق الآن' }
  };
  return translations[lang]?.[key] || key;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const t = (key) => getTranslation(language, key);
  
  // Check if already logged in
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    window.location.href = '/';
    return null;
  }
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting register to:', `${API_URL}/api/auth/register`);
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      console.log('Register response:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.detail || (language === 'ar' ? 'فشل التسجيل' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </h1>
            <p className="text-gray-500 mt-2">
              {language === 'ar' ? 'انضم إلى Ocean اليوم' : 'Join Ocean today'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder={language === 'ar' ? 'محمد أحمد' : 'John Doe'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition ${formData.role === 'buyer' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="sr-only" />
                  <div className="text-center">
                    <span className="text-2xl">🛒</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{language === 'ar' ? 'مشتري' : 'Buyer'}</p>
                  </div>
                </label>
                <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition ${formData.role === 'seller' ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="sr-only" />
                  <div className="text-center">
                    <span className="text-2xl">🏪</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">{language === 'ar' ? 'بائع' : 'Seller'}</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-4 rounded-xl font-semibold text-lg transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner"></span>
                  {language === 'ar' ? 'جاري...' : 'Loading...'}
                </span>
              ) : (
                t('register')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link to="/login" className="text-ocean-600 hover:text-ocean-700 font-semibold">
                {t('login')}
              </Link>
            </p>
          </div>

          <p className="mt-6 text-xs text-center text-gray-500">
            {language === 'ar' 
              ? 'بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
              : 'By registering, you agree to our Terms of Service and Privacy Policy'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
