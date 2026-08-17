import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

/**
 * Menyuda mavjud, lekin React versiyasi hali ko'chirilmagan bo'limlar uchun.
 * Ilgari bunday havolalar jimgina dashboardga qaytarardi va tugma
 * "ishlamayotgandek" ko'rinardi.
 */
export default function ComingSoonPage({ title, description, legacyPath }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
        <Construction size={28} />
      </div>

      <h1 className="text-xl font-black text-slate-100">{title || 'Bo\'lim tayyorlanmoqda'}</h1>
      <p className="text-sm text-slate-500 font-semibold mt-2 max-w-md">
        {description || 'Ushbu bo\'limning yangi interfeysi ishlab chiqilmoqda.'}
      </p>
      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-3">
        {location.pathname}
      </p>

      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-bold transition"
        >
          <ArrowLeft size={15} />
          Asosiy panel
        </button>

        {legacyPath && (
          <a
            href={legacyPath}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-sm font-bold hover:brightness-110 transition"
          >
            Eski versiyada ochish
          </a>
        )}
      </div>
    </div>
  );
}
