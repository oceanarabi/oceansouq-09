import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaptain } from '../contexts/CaptainContext';

const Login = () => {
  const [email, setEmail] = useState('captain@ocean.com');
  const [password, setPassword] = useState('captain123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useCaptain();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/captain');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white">لوحة الكابتن</h1>
          <p className="text-blue-300 mt-2">Ocean Rides Partner</p>
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
              <label className="block text-blue-200 text-sm mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="captain@ocean.com"
                required
              />
            </div>
            <div>
              <label className="block text-blue-200 text-sm mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>🚀 دخول إلى لوحة التحكم</>
              )}
            </button>
          </form>

          <p className="text-center text-blue-300 text-sm mt-6">
            للتجربة: captain@ocean.com / captain123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
