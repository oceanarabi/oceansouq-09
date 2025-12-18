import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../contexts/SellerContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Login = () => {
  const { login, language, switchLanguage } = useSeller();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register as seller
        const res = await axios.post(`${API_URL}/api/auth/register`, { email, password, name, role: 'seller' });
        login(res.data.user, res.data.token);
        navigate('/seller');
      } else {
        // Login
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        if (res.data.user.role !== 'seller' && res.data.user.role !== 'admin' && res.data.user.role !== 'super_admin') {
          setError(language === 'ar' ? 'ليس لديك صلاحيات البائع' : 'You do not have seller access');
          setLoading(false);
          return;
        }
        login(res.data.user, res.data.token);
        navigate('/seller');
      }
    } catch (err) {
      setError(err.response?.data?.detail || (language === 'ar' ? 'خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 flex items-center justify-center p-4">
      <button onClick={() => switchLanguage(language === 'ar' ? 'en' : 'ar')} className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">{language === 'ar' ? 'English' : 'عربي'}</button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30"><span className="text-white font-bold text-4xl">O</span></div>
          <h1 className="text-3xl font-bold text-white">Ocean Seller</h1>
          <p className="text-emerald-300 mt-2">{language === 'ar' ? 'لوحة تحكم البائع' : 'Seller Dashboard'}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="flex mb-6">
            <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-center rounded-l-xl ${!isRegister ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-300'}`}>{language === 'ar' ? 'دخول' : 'Login'}</button>
            <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-center rounded-r-xl ${isRegister ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-300'}`}>{language === 'ar' ? 'تسجيل جديد' : 'Register'}</button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div><label className="block text-sm font-medium text-emerald-200 mb-2">{language === 'ar' ? 'اسم المتجر' : 'Store Name'}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-emerald-500" placeholder={language === 'ar' ? 'ادخل اسم متجرك' : 'Enter store name'} /></div>
            )}
            <div><label className="block text-sm font-medium text-emerald-200 mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-emerald-200 mb-2">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label><div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-400/50 focus:ring-2 focus:ring-emerald-500" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">{showPassword ? 'إخفاء' : 'إظهار'}</button></div></div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30">{loading ? '...' : (isRegister ? (language === 'ar' ? 'تسجيل' : 'Register') : (language === 'ar' ? 'دخول' : 'Login'))}</button>
          </form>
          <div className="mt-6 text-center"><a href="/" className="text-emerald-300 hover:text-white text-sm">{language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</a></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
