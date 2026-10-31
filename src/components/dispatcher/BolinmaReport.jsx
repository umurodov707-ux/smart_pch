import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Copy, Plus, Send, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../ui';
import { SECTIONS, SECTION_BY_KEY, sectionState, reportProgress, normalizeReport, cleanReport, rowsOf, num, RAIL_HOT, RAIL_WARN } from './sections.js';
import { STATUS } from './summary.js';
import { bolinmaLabel, bolinmaName } from './line.js';

// "Kechagidan nusxalash": qaysi maydonlar ko'chiriladi (qiymatlar emas, doimiy ma'lumotlar)
const COPY = {
  reja: null, // hammasi
  temp: ['info', 'area'],
  attendance: ['area', 'total'],
  obxod: ['area', 'name', 'km', 'tel'],
  ogoh: null,
};
const ACTIONS = { submit: 'Yuborildi', resubmit: 'Tuzatib qayta yuborildi', accept: 'Dispetcher qabul qildi', return: 'Dispetcher qaytardi' };
const hhmm = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const draftKey = (n, date) => `dsp_draft_${n}_${date}`;

function readDraft(n, date) {
  try { const d = JSON.parse(localStorage.getItem(draftKey(n, date)) || 'null'); return d && d.sd ? d : null; } catch { return null; }
}
function writeDraft(n, date, sd, baseVersion, pending = false) {
  try { localStorage.setItem(draftKey(n, date), JSON.stringify({ sd, baseVersion, pending, at: Date.now() })); } catch { /* xotira to'la — e'tiborsiz */ }
}
function dropDraft(n, date) { try { localStorage.removeItem(draftKey(n, date)); } catch { /* yo'q */ } }

function minutesLeft(nowHHMM, deadline) {
  const [a, b] = nowHHMM.split(':').map(Number); const [c, d] = deadline.split(':').map(Number);
  return (c * 60 + d) - (a * 60 + b);
}

export default function BolinmaReport({ n, date, yesterday, report, reload, onBack, asDispatcher = false }) {
  const toast = useToast();
  const [sd, setSd] = useState(() => normalizeReport(null));
  const [baseVersion, setBaseVersion] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [current, setCurrent] = useState('reja');
  const [editing, setEditing] = useState(false); // telefon: bo'lim ochiq
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const loadedFor = useRef('');

  // hisobotni yuklash: server + qoralama
  useEffect(() => {
    const key = `${n}|${date}|${report ? `${report.id}:${report.version}:${report.status}` : 'none'}`;
    if (loadedFor.current === key) return;
    const sameDay = loadedFor.current.startsWith(`${n}|${date}|`);
    loadedFor.current = key;
    const draft = readDraft(n, date);
    const serverV = report ? report.version : 0;
    if (draft && (draft.pending || draft.baseVersion === serverV) && !(sameDay && !dirty && !draft.pending)) {
      setSd(normalizeReport(draft.sd)); setDirty(true);
    } else if (!(sameDay && dirty)) {
      setSd(normalizeReport(report && report.structuredData)); setDirty(false);
    }
    setBaseVersion(serverV);
  }, [n, date, report, dirty]);

  useEffect(() => {
    let alive = true;
    if (!report) { setHistory([]); return undefined; }
    api.get(`/api/reports/${report.id}/versions`).then((h) => { if (alive) setHistory(Array.isArray(h) ? h : []); }).catch(() => {});
    return () => { alive = false; };
  }, [report]);

  const progress = useMemo(() => reportProgress(sd), [sd]);
  const section = SECTION_BY_KEY[current];
  const state = sectionState(sd, section);

  const update = useCallback((fn) => {
    setSd((prev) => {
      const next = fn(normalizeReport(prev));
      writeDraft(n, date, next, baseVersion);
      return next;
    });
    setDirty(true);
  }, [n, date, baseVersion]);

  const setCell = (i, k, v) => update((s) => { s[section.data][i] = { ...s[section.data][i], [k]: v }; return s; });
  const addRow = () => update((s) => {
    const last = s[section.data][s[section.data].length - 1];
    const row = { id: Date.now() };
    // joy/PDB oxirgi qatordan olinadi
    if (last) ['area', 'info', 'loc', 'location', 'station'].forEach((k) => { if (last[k] && section.cols.some((c) => c.k === k)) row[k] = last[k]; });
    if (section.key === 'temp') row.time = new Date().toTimeString().slice(0, 5);
    s[section.data].push(row);
    if (s.none) delete s.none[section.key];
    return s;
  });
  const delRow = (i) => update((s) => { s[section.data].splice(i, 1); return s; });
  const setNone = (on) => update((s) => { s.none = { ...(s.none || {}) }; if (on) s.none[section.key] = true; else delete s.none[section.key]; return s; });

  // birinchi marta bo'limga kirganda bo'sh qator — darhol yozish mumkin bo'lsin
  useEffect(() => {
    if (rowsOf(sd, section).length === 0 && !(sd.none && sd.none[section.key])) {
      setSd((prev) => { const s = normalizeReport(prev); s[section.data] = [{ id: Date.now() }]; return s; });
    }
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyYesterday() {
    try {
      const list = await api.get(`/api/reports?date=${yesterday}`);
      const prev = (list || []).find((r) => String(r.bolinma_id).startsWith(`${n}-`));
      const rows = prev ? rowsOf(prev.structuredData, section) : [];
      if (!rows.length) { toast.info('Kechagi hisobotda bu bo‘lim bo‘sh'); return; }
      const fields = COPY[section.key];
      update((s) => {
        const kept = s[section.data].filter((r) => section.cols.some((c) => String(r[c.k] ?? '').trim()));
        const copied = rows.map((r) => {
          const out = { id: Date.now() + Math.random() };
          section.cols.forEach((c) => { if (!fields || fields.includes(c.k)) out[c.k] = r[c.k] ?? ''; });
          return out;
        });
        s[section.data] = [...kept, ...copied];
        return s;
      });
      toast.success(`Kechadan ${rows.length} ta qator olindi${COPY[section.key] ? ' (qiymatlarni yangilang)' : ''}`);
    } catch (e) { toast.error(e.message || 'Kechagi hisobotni olib bo‘lmadi'); }
  }

  async function submit() {
    if (!progress.canSubmit) { toast.error(progress.blockers[0]); return; }
    setSaving(true);
    const payload = { bolinma_id: bolinmaName(n), date, content: `Kunlik tezkor hisobot (${date})`, structuredData: cleanReport(sd) };
    try {
      const r = await api.post('/api/reports', payload);
      dropDraft(n, date);
      setDirty(false);
      toast.success(r.version > 1 ? 'Tuzatilgan hisobot dispetcherga yuborildi' : 'Hisobot dispetcherga yuborildi');
      await reload();
    } catch (e) {
      if (e.status === 0) {
        writeDraft(n, date, sd, baseVersion, true);
        toast.warning('Internet yo‘q. Hisobot shu qurilmada saqlandi va aloqa tiklanganda yuboriladi.');
      } else toast.error(e.message || 'Yuborib bo‘lmadi');
    } finally { setSaving(false); }
  }

  // aloqa tiklanganda kutib turgan hisobot yuboriladi
  useEffect(() => {
    const onOnline = () => { const d = readDraft(n, date); if (d && d.pending) submit(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = rowsOf(sd, section).map((r, i) => ({ r, i })).filter(({ r }) => sd[section.data].includes(r));
  const marked = !!(sd.none && sd.none[section.key]);
  // bo'linma tomonidan ko'rinadigan matnlar
  const OWN = { submitted: 'Yuborildi, dispetcher ko‘rib chiqmoqda', accepted: 'Dispetcher qabul qildi', returned: 'Qaytarildi, tuzatish kerak' };
  const status = report ? { ...(STATUS[report.status] || STATUS.submitted), label: asDispatcher ? (STATUS[report.status] || STATUS.submitted).label : OWN[report.status] || OWN.submitted } : null;
  const legacyWarn = section.key === 'ogoh' ? (sd.dayWarnRows || []) : [];

  const groups = [];
  SECTIONS.forEach((s) => { const g = groups.find((x) => x.name === s.group); if (g) g.items.push(s); else groups.push({ name: s.group, items: [s] }); });

  const mark = (st, s) => {
    if (st.state === 'done') return <span className="ok">✓</span>;
    if (st.state === 'error') return <span className="req">!</span>;
    if (st.state === 'none') return <span className="no">–</span>;
    return s.required ? <span className="req">!</span> : <span className="no">–</span>;
  };
  const markText = (st, s) => (st.state === 'done' ? `${st.count}` : st.state === 'error' ? 'xato' : st.state === 'none' ? 'bugun yo‘q' : s.required ? 'majburiy' : s.optional ? 'ixtiyoriy' : '');

  return (
    <>
      <div className={`dsp-desk${editing ? ' editing' : ''}`}>
        <nav className="dsp-nav" aria-label="Hisobot bo‘limlari">
          {asDispatcher && <button type="button" className="dsp-btn sm ghost" style={{ marginBottom: 8 }} onClick={onBack}><ChevronLeft size={14} /> Dispetcher paneliga</button>}
          {report && (
            <div style={{ padding: '0 8px 10px' }}>
              <span className={`dsp-st ${status.cls}`}>{status.label}</span>
              {report.status === 'returned' && report.review_comment && (
                <div className="dsp-note w" style={{ marginTop: 8 }}><b>Dispetcher qaytardi{report.reviewed_at ? `, ${hhmm(report.reviewed_at)}` : ''}</b>“{report.review_comment}”</div>
              )}
            </div>
          )}
          <div className="dsp-prog"><b>{progress.filled} / {progress.total}</b> <span>bo‘lim to‘ldirildi</span>
            <div className="dsp-bar"><i style={{ width: `${Math.round((progress.filled / progress.total) * 100)}%` }} /></div></div>
          {groups.map((g) => (
            <div key={g.name}>
              <div className="dsp-grp">{g.name}</div>
              {g.items.map((s) => {
                const st = sectionState(sd, s);
                return (
                  <button key={s.key} type="button" className="dsp-it" aria-current={current === s.key}
                    onClick={() => { setCurrent(s.key); setEditing(true); window.scrollTo?.({ top: 0 }); }}>
                    {mark(st, s)}<span>{s.title}</span><span className="c" style={st.state === 'error' || (st.state === 'empty' && s.required) ? { color: '#C2392D' } : undefined}>{markText(st, s)}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {history.length > 0 && (
            <div style={{ padding: '14px 8px 0' }}>
              <div className="dsp-grp" style={{ padding: '0 0 6px' }}>Tarix</div>
              <div className="dsp-tl">
                {history.map((h) => (
                  <div key={h.id} className={h.action === 'return' ? 'r' : ''}><b>{ACTIONS[h.action] || h.action}</b>
                    <small>{hhmm(h.created_at)}{h.username ? `, ${h.username}` : ''}{h.comment ? ` — “${h.comment}”` : ''}</small></div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <main className="dsp-main">
          <div className="dsp-mh">
            <button type="button" className="dsp-btn sm ghost dsp-mback" onClick={() => setEditing(false)}><ChevronLeft size={15} /> Bo‘limlar</button>
            <h2>{section.title}</h2>
            <span className="hint">{state.state === 'done' ? `${state.count} ta yozuv` : state.state === 'none' ? 'Bugun yo‘q deb belgilangan' : ''}</span>
            {section.key in COPY && (
              <span className="push"><button type="button" className="dsp-btn" onClick={copyYesterday}><Copy size={15} /> Kechagidan nusxalash</button></span>
            )}
          </div>
          <p className="dsp-desc">{section.hint}</p>

          {!marked && (
            <div className="dsp-edit">
              <table>
                <thead><tr>{section.cols.map((c) => <th key={c.k} className={c.req ? 'must' : ''} style={c.w ? { width: c.w } : undefined}>{c.label}</th>)}<th style={{ width: 40 }} aria-label="O‘chirish" /></tr></thead>
                <tbody>
                  {rows.map(({ r, i }) => (
                    <tr key={r.id || i} className="row">
                      {section.cols.map((c) => {
                        const v = r[c.k] ?? '';
                        const blank = String(v).trim() === '';
                        const anyFilled = section.cols.some((x) => String(r[x.k] ?? '').trim() !== '');
                        const bad = (c.req && blank && anyFilled) || (c.type === 'num' && !blank && num(v) === null);
                        const t = section.key === 'temp' && c.k === 'rail' ? num(v) : null;
                        const heat = t === null ? '' : t >= RAIL_HOT ? ' hot' : t >= RAIL_WARN ? ' warm' : '';
                        const wide = !c.w || c.w > 130;
                        return (
                          <td key={c.k} data-label={c.label} className={wide ? 'wide' : ''}>
                            <input className={`dsp-cell${c.type === 'num' ? ' num' : ''}${bad ? ' bad' : ''}${heat}`} value={v} aria-label={c.label}
                              type={c.type === 'time' ? 'time' : 'text'} inputMode={c.type === 'num' ? 'decimal' : undefined}
                              onChange={(e) => setCell(i, c.k, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter' && i === sd[section.data].length - 1) { e.preventDefault(); addRow(); } }} />
                          </td>
                        );
                      })}
                      <td className="act"><button type="button" className="dsp-del" onClick={() => delRow(i)} aria-label="Qatorni o‘chirish"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                  <tr className="addr"><td colSpan={section.cols.length + 1}>
                    <button type="button" className="dsp-add" onClick={addRow}><Plus size={15} /> Qator qo‘shish <span className="k" style={{ color: '#9AA7AD' }}>(oxirgi katakda Enter)</span></button>
                  </td></tr>
                </tbody>
              </table>
            </div>
          )}
          {legacyWarn.length > 0 && (
            <div className="dsp-note i" style={{ marginTop: 10 }}><b>Eski oynadan kiritilgan {legacyWarn.length} ta kunlik ogohlantirish</b>{legacyWarn.map((w) => `${w.km || w.station || ''} ${w.speed || ''}`).join('; ')}</div>
          )}
          {section.noneOk && (state.state === 'empty' || marked) && (
            <label className="dsp-none"><input type="checkbox" checked={marked} onChange={(e) => setNone(e.target.checked)} /> Bugun yo‘q (bu bo‘lim bo‘yicha ma’lumot yo‘q)</label>
          )}
          {state.problems.length > 0 && (
            <div className="dsp-note r" style={{ marginTop: 12 }}><b>Tekshiring</b>{state.problems.slice(0, 4).map((p) => <div key={p}>{p}</div>)}</div>
          )}
        </main>
      </div>

      <div className="dsp-foot">
        <div className="left">
          {progress.canSubmit
            ? <><b>Hisobot tayyor.</b> {report ? 'Yuborgandan keyin ham tuzatish mumkin — dispetcher yangi versiyani ko‘radi.' : 'Dispetcher ko‘rib chiqib, qabul qiladi yoki izoh bilan qaytaradi.'}</>
            : <><b>Yuborishdan oldin:</b> {progress.blockers.slice(0, 2).join('; ')}{progress.blockers.length > 2 ? ` va yana ${progress.blockers.length - 2}` : ''}</>}
          {dirty && report && <> <span style={{ color: '#B57F00' }}>Saqlanmagan o‘zgarishlar bor.</span></>}
        </div>
        <button type="button" className="dsp-btn ink" disabled={saving || !progress.canSubmit || (report && !dirty)} onClick={submit}>
          <Send size={16} /> {saving ? 'Yuborilmoqda…' : report ? (dirty ? 'Tuzatishni yuborish' : 'Yuborilgan') : 'Dispetcherga yuborish'}
        </button>
      </div>
    </>
  );
}

export { bolinmaLabel, minutesLeft };
