import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../contexts/HotelContext';

const Login = () => {
  const [email, setEmail] = useState('hotel@ocean.com');
  const [password, setPassword] = useState('hotel123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useHotel();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/hotel');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🏨</span>
          </div>
          <h1 className="text-3xl font-bold text-white">لوحة الفندق</h1>
          <p className="text-purple-300 mt-2">Ocean Hotels Partner</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-xl font-bold text-white text-center mb-6">تسجيل الدخول</h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="hotel@ocean.com"
                required
              />
            </div>
            <div>
              <label className="block text-purple-200 text-sm mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>🚀 دخول إلى لوحة التحكم</>
              )}
            </button>
          </form>

          <p className="text-center text-purple-300 text-sm mt-6">
            للتجربة: hotel@ocean.com / hotel123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
