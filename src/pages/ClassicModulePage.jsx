import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CLASSIC_DEPARTMENTS } from '../components/layout/navigation';
import { allowedBolinmalar } from '../utils/bolinma';

/**
 * Hali yangi sahifaga ko'chirilmagan bo'lim oynalari (eski interfeys) — yangi saytning
 * ichida, bitta menyu va bitta kirish bilan ochiladi. Eski kod public/js/embed.js orqali
 * faqat kerakli oynani ko'rsatadi (o'z menyusi, sarlavhasi va login sahifasisiz).
 *
 * Xabarlar (window.postMessage, faqat shu saytdan):
 *   klassik-ready    — oyna ochildi
 *   klassik-close    — foydalanuvchi oynani yopdi → asosiy panel
 *   klassik-navigate — eski kod yangi sahifaga o'tmoqchi (PU-74, PU-29, Dispetcher)
 *   klassik-auth     — sessiya yo'q → qayta kirish
 */
export default function ClassicModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const frame = useRef(null);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const dept = CLASSIC_DEPARTMENTS.find((d) => d.id === id);
  const bolinmaN = /^bolinma(\d{1,2})$/.exec(id || '');
  const title = dept ? dept.label : bolinmaN ? `${bolinmaN[1]}-bo‘linma` : null;
  const allowed = dept ? dept.show(user) : bolinmaN ? allowedBolinmalar(user).includes(`${bolinmaN[1]}-bo'linma`) : false;

  useEffect(() => { setReady(false); }, [id, reloadKey]);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin !== window.location.origin || !e.data || typeof e.data !== 'object') return;
      if (frame.current && e.source !== frame.current.contentWindow) return;
      const { type, to } = e.data;
      if (type === 'klassik-ready') setReady(true);
      else if (type === 'klassik-close') navigate('/dashboard');
      else if (type === 'klassik-navigate' && typeof to === 'string' && to.startsWith('/dashboard')) navigate(to);
      else if (type === 'klassik-auth') { logout(); navigate('/login'); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [navigate, logout]);

  if (!title) {
    return <div className="p-8 text-slate-400">Bunday bo‘lim yo‘q.</div>;
  }
  if (!allowed) {
    return <div className="p-8 text-slate-400">Bu bo‘limga ruxsatingiz yo‘q.</div>;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)', minHeight: 520 }}>
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        {!ready && <span className="text-sm text-slate-400">Yuklanmoqda…</span>}
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}
          className="ml-auto inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-slate-300 bg-slate-800/60 hover:bg-slate-800">
          <RefreshCw size={15} /> Qayta yuklash
        </button>
      </div>
      <iframe
        key={`${id}-${reloadKey}`}
        ref={frame}
        title={title}
        src={`/index.html?embed=${encodeURIComponent(id)}`}
        className="w-full flex-1 rounded-xl border border-slate-800 bg-slate-950"
      />
    </div>
  );
}
