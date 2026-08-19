import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Noto‘g‘ri foydalanuvchi nomi yoki parol!');
      }
    } catch (err) {
      setError('Tizimga kirishda kutilmagan xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative background circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-1 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl shadow-lg mb-4">
            <img 
              src="/img/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
            SMART PCH
          </h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
            <i className="fas fa-map-marker-alt text-amber-500 text-xs"></i>
            Temir Yo‘l Masofasi Tizimiga Kirish
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block flex items-center gap-2">
              <i className="fas fa-user text-slate-500 text-xs"></i>
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition"
                placeholder="Login kiriting..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 block flex items-center gap-2">
              <i className="fas fa-lock text-slate-500 text-xs"></i>
              Parol
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition"
                placeholder="Parol kiriting..."
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm leading-relaxed animate-shake">
              <i className="fas fa-exclamation-triangle text-xs shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Kirish
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-slate-600 text-xs justify-center">
          <span>Smart PCH Enterprise v2.2.0</span>
        </div>
      </div>
    </div>
  );
}
