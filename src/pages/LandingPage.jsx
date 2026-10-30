import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Route, FileSignature, Users, ShieldCheck, Wrench, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui';

const FEATURES = [
  { icon: Cpu, title: 'AI Dispetcher', text: 'Ma‘lumotlarni tahlil qilib, dispetcherlarga tezkor qaror qabul qilishda tavsiyalar beradi.' },
  { icon: Route, title: 'Real vaqt xaritasi', text: 'Poyezdlar, xodimlar, masofalar va texnika harakatini interaktiv xaritada kuzatish.' },
  { icon: FileSignature, title: 'Raqamli hujjatlar', text: 'PU-29, PU-74, PU-28 jurnallari va dalolatnomalarni raqamli yuritish.' },
  { icon: Users, title: 'Kadrlar boshqaruvi', text: 'Xodimlar, tabel, ta‘tillar va obyektivkalar — bir joyda.' },
  { icon: ShieldCheck, title: 'Xavfsizlik nazorati', text: 'Mehnat muhofazasi, SHHV va yo‘riqnomalar hisobini yuritish.' },
  { icon: Wrench, title: 'Texnik bo‘limlar', text: 'Izostiklar, metrologiya asboblari va mexanika parkini kuzatish.' },
];

const STATS = [
  { value: '24/7', label: 'Onlayn nazorat' },
  { value: '10+', label: 'Bo‘limlar' },
  { value: '1', label: 'Yagona platforma' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute top-[-15%] left-1/2 -translate-x-1/2 w-[60rem] h-[36rem] rounded-full bg-amber-500/10 blur-[120px]" />

      {/* Yuqori panel */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/img/logo.png" alt="Logo" className="w-9 h-9 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="text-sm font-extrabold tracking-wide">SMART PCH</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 transition"
            aria-label="Mavzuni almashtirish"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Button size="sm" onClick={() => navigate('/login')}>Kirish</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 pt-16 pb-20 md:pt-24 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          O'zbekiston Temir Yo'llari
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Temir yo‘l masofasi uchun
          <br />
          <span className="text-amber-400">intellektual boshqaruv</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Dispetcherlik, ishlab chiqarish va xavfsizlik — barcha bo‘limlar integratsiyasi yagona interfeysda.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate('/login')} className="justify-center">
            Tizimga kirish <ArrowRight size={16} />
          </Button>
          <a
            href="#features"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
          >
            Imkoniyatlar
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-3 max-w-lg mx-auto divide-x divide-slate-800">
          {STATS.map((s) => (
            <div key={s.label} className="px-2">
              <dt className="text-3xl font-extrabold text-slate-100 tabular-nums">{s.value}</dt>
              <dd className="mt-1 text-xs text-slate-500">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Imkoniyatlar */}
      <section id="features" className="relative z-10 max-w-6xl w-full mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <f.icon size={19} />
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-100">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mt-auto py-8 text-center text-xs text-slate-600 border-t border-slate-800/60">
        © {new Date().getFullYear()} O'zbekiston Temir Yo'llari. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
