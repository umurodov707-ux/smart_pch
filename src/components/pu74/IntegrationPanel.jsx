import React, { useEffect, useMemo, useState } from 'react';
import { DatabaseZap, X, Check, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { cellKey, editKey, formatValue, sheetLabel, toNumber } from './journalModel.js';
import { PROVIDERS, fetchNeeds } from './integrations.js';


const show = (v) => {
  const s = formatValue(v, { blankZero: false });
  return s === '' ? '—' : s;
};

/**
 * "Bo'limlardan to'ldirish" oynasi: tanlangan manbadan ma'lumot olib,
 * jurnalga nima yozilishini oldindan ko'rsatadi, foydalanuvchi tasdiqlasa qo'llaydi.
 */
export default function IntegrationPanel({ brigadeId, bolinma, month, user, views, model, sheetsTpl, styles, currentSheet, canEdit, onApply, onClose }) {
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState(null); // {provider, changes, notes, errors}
  const [picked, setPicked] = useState(new Set());

  useEffect(() => { setResult(null); }, [month, brigadeId, bolinma]);

  const ordered = useMemo(() => {
    const here = PROVIDERS.filter((p) => p.sheets.includes(currentSheet));
    return [...here, ...PROVIDERS.filter((p) => !here.includes(p))];
  }, [currentSheet]);

  const check = async (provider) => {
    setBusy(provider.id);
    setResult(null);
    try {
      const { data, errors } = await fetchNeeds(provider.needs, { bolinmaId: bolinma, month }, api);
      const ctx = {
        views, month, styles, bolinmaId: bolinma,
        original: (si, r, c) => { const x = model.sheets[si] && model.sheets[si].cells[cellKey(r, c)]; return x ? x.v : null; },
      };
      const { changes, notes } = provider.build(ctx, data);
      setResult({ provider, changes, notes, errors });
      setPicked(new Set(changes.map((_, i) => i)));
    } catch (e) {
      setResult({ provider, changes: [], notes: [], errors: [e.message || 'Xatolik'] });
    } finally {
      setBusy('');
    }
  };

  const apply = () => {
    if (!result) return;
    const list = result.changes.filter((_, i) => picked.has(i));
    onApply((prev) => {
      const next = { ...prev };
      for (const ch of list) {
        const k = editKey(ch.si, ch.r, ch.c);
        const orig = model.sheets[ch.si] && model.sheets[ch.si].cells[cellKey(ch.r, ch.c)];
        const origV = orig ? orig.v : null;
        const v = ch.value === null || ch.value === undefined ? '' : ch.value;
        const sameAsOrig = !(orig && orig.f) && (
          ((origV === null || origV === '' || origV === undefined) && v === '') ||
          (toNumber(v) !== null && toNumber(v) === toNumber(origV)) || String(v) === String(origV ?? ''));
        if (sameAsOrig) delete next[k];
        else next[k] = v;
      }
      return next;
    }, list.length);
    setResult(null);
  };

  const toggle = (i) => setPicked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <div className="pu74j-panel pu74j-integr" role="dialog" aria-label="Bo‘limlardan to‘ldirish">
      <div className="pu74j-integr-head">
        <strong><DatabaseZap size={16} /> Bo‘limlardan to‘ldirish</strong>
        <button type="button" className="pu74j-btn" aria-label="Yopish" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="pu74j-row" style={{ alignItems: 'center' }}>
        <span>Bo‘linma: <b>{bolinma}</b></span>
        <span className="pu74j-muted">Ma’lumotlar shu bo‘linma bo‘yicha olinadi. Hech narsa avtomatik yozilmaydi — avval ko‘rib chiqasiz.</span>
      </div>

      <div className="pu74j-integr-list">
        {ordered.map((p) => (
          <div key={p.id} className={`pu74j-integr-item${p.sheets.includes(currentSheet) ? ' here' : ''}${result && result.provider.id === p.id ? ' open' : ''}`}>
            <div>
              <div className="t">{p.title}</div>
              <div className="pu74j-muted">Manba: {p.from}</div>
            </div>
            <button type="button" className="pu74j-btn" disabled={!!busy || !bolinma} onClick={() => check(p)}>
              {busy === p.id ? 'Olinmoqda…' : 'Tekshirish'}
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="pu74j-integr-result">
          <div className="t">{result.provider.title}: {result.changes.length ? `${result.changes.length} ta o‘zgarish taklif qilinadi` : 'o‘zgartirish kerak emas'}</div>
          {result.errors.map((e) => <div key={e} className="pu74j-note err">Ma’lumot olinmadi — {e}</div>)}
          {result.notes.map((n) => <div key={n} className="pu74j-note">{n}</div>)}
          {result.changes.length > 0 && (
            <>
              <div className="pu74j-integr-table">
                <table>
                  <thead><tr><th aria-label="Tanlash" /><th>Bet</th><th>Katak</th><th>Hozir</th><th aria-hidden="true" /><th>Yangi</th></tr></thead>
                  <tbody>
                    {result.changes.map((ch, i) => (
                      <tr key={`${ch.si}_${ch.r}_${ch.c}`} className={picked.has(i) ? '' : 'off'}>
                        <td><input type="checkbox" checked={picked.has(i)} onChange={() => toggle(i)} aria-label={ch.label} /></td>
                        <td>{sheetLabel(sheetsTpl[ch.si].name)}</td>
                        <td>{ch.label}</td>
                        <td className="old">{show(ch.old)}</td>
                        <td><ArrowRight size={12} /></td>
                        <td className="new">{show(ch.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pu74j-row">
                <button type="button" className="pu74j-btn primary" disabled={!canEdit || !picked.size} onClick={apply}>
                  <Check size={15} /> Qo‘llash ({picked.size})
                </button>
                <button type="button" className="pu74j-btn" onClick={() => setPicked(picked.size ? new Set() : new Set(result.changes.map((_, i) => i)))}>
                  {picked.size ? 'Hammasini olib tashlash' : 'Hammasini tanlash'}
                </button>
                {!canEdit && <span className="pu74j-muted">Jurnal qulflangan — qo‘llab bo‘lmaydi.</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
