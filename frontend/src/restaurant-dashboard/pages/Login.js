import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../contexts/RestaurantContext';

const Login = () => {
  const [email, setEmail] = useState('restaurant@ocean.com');
  const [password, setPassword] = useState('restaurant123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useRestaurant();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/restaurant');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-800 via-red-700 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🍔</span>
          </div>
          <h1 className="text-3xl font-bold text-white">لوحة المطعم</h1>
          <p className="text-orange-200 mt-2">Ocean Food Partner</p>
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
              <label className="block text-orange-100 text-sm mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="restaurant@ocean.com"
                required
              />
            </div>
            <div>
              <label className="block text-orange-100 text-sm mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>🚀 دخول إلى لوحة التحكم</>
              )}
            </button>
          </form>

          <p className="text-center text-orange-200 text-sm mt-6">
            للتجربة: restaurant@ocean.com / restaurant123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
