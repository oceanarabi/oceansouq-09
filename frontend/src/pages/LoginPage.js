import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// These will be imported from App.js context through window or passed via props
// For now using localStorage for compatibility
const getTranslation = (lang, key) => {
  const translations = {
    en: { login: 'Login', register: 'Register', shopNow: 'Shop Now' },
    ar: { login: 'تسجيل الدخول', register: 'إنشاء حساب', shopNow: 'تسوق الآن' }
  };
  return translations[lang]?.[key] || key;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const t = (key) => getTranslation(language, key);
  
  // All hooks must be called before any conditional returns
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in - redirect after hooks
  const existingToken = localStorage.getItem('token');
  
  useEffect(() => {
    if (existingToken) {
      navigate('/');
    }
  }, [existingToken, navigate]);

  if (existingToken) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      console.log('Login response:', res.data);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Force page reload to update all contexts
        window.location.href = '/';
      } else {
        setError(language === 'ar' ? 'خطأ في الاستجابة' : 'Invalid response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
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
              {language === 'ar' ? 'تسجيل الدخول' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 mt-2">
              {language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your credentials to continue'}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'تذكرني' : 'Remember me'}
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm text-ocean-600 hover:text-ocean-700">
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Link>
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
                t('login')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link to="/register" className="text-ocean-600 hover:text-ocean-700 font-semibold">
                {t('register')}
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                  {language === 'ar' ? 'أو سجل بـ' : 'Or continue with'}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <span>🌎</span>
                <span className="text-gray-700 dark:text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <span>🍎</span>
                <span className="text-gray-700 dark:text-gray-300">Apple</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
