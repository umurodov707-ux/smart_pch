import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, AlertTriangle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input } from '../components/ui';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 grid lg:grid-cols-2">
      {/* Chap: brend paneli (faqat katta ekranda) */}
      <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-slate-900 border-r border-slate-800">
        <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <img src="/img/logo.png" alt="Logo" className="w-11 h-11 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <div className="text-base font-extrabold tracking-wide">SMART PCH</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">O'zbekiston Temir Yo'llari</div>
          </div>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Temir yo‘l masofasini <span className="text-amber-400">bitta oynadan</span> boshqaring
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Dispetcherlik, kadrlar, murojaatlar, PU jurnallari va texnik bo‘limlar — yagona raqamli platformada.
          </p>
        </div>

        <p className="relative text-xs text-slate-600">Smart PCH Enterprise v2.2.0</p>
      </aside>

      {/* O'ng: forma */}
      <main className="relative flex flex-col items-center justify-center px-5 py-12">
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-200 transition">
            <ArrowLeft size={14} /> Bosh sahifa
          </Link>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 transition"
            aria-label="Mavzuni almashtirish"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/img/logo.png" alt="Logo" className="w-16 h-16 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">Tizimga kirish</h2>
          <p className="mt-1.5 text-sm text-slate-500">Hisobingiz ma‘lumotlarini kiriting</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              label="Foydalanuvchi nomi"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Login"
              autoComplete="username"
              autoFocus
              required
            />

            <div className="relative">
              <Input
                label="Parol"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 bottom-1 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-200 transition"
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm animate-fade-in">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full justify-center" loading={submitting} icon={LogIn}>
              Kirish
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
