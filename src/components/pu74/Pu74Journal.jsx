import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, ChevronLeft, ChevronRight, Printer, ZoomIn, ZoomOut, Pencil, RefreshCw, Download, Send,
  CircleCheckBig, Undo2, LockOpen, Lock, CalendarPlus, CloudOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TEMPLATE from './pu74Template.json';
import {
  analyzeSheet, carryOverEdits, cellKey, computeWorkbook, currentMonth, editKey, fromSheetJS, monthLabel,
  sheetLabel, shiftMonth, toNumber,
} from './journalModel';
import { SheetView, buildLayout, BOOKMARK_W } from './SheetView';
import useJournalStore, { loadLegacyEdits } from './useJournalStore';
import { buildJournalXlsx } from './xlsxExport';
import './pu74Journal.css';

export const BRIGADES = [
  { id: '1-brigada', file: '1-brigada.xlsx', title: '1-brigada' },
  { id: '2-brigada', file: '2-brigada.xlsx', title: '2-brigada' },
  { id: '3-brigada', file: '3-brigada.xlsx', title: '3-brigada' },
];

const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
const PRINT_W = 1060;  // A4 albom, 8 mm chetlar bilan (px)
const PRINT_H = 730;

const STATUS = {
  draft: { label: 'Qoralama', cls: 'st-draft' },
  submitted: { label: 'Tekshiruvda', cls: 'st-submitted' },
  returned: { label: 'Qaytarilgan', cls: 'st-returned' },
  approved: { label: 'Tasdiqlangan', cls: 'st-approved' },
};

let sheetJsPromise = null;
function loadSheetJS() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!sheetJsPromise) {
    sheetJsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SHEETJS_URL;
      s.async = true;
      s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error('SheetJS yuklanmadi')));
      s.onerror = () => { sheetJsPromise = null; reject(new Error('Excel kutubxonasini yuklab bo‘lmadi')); };
      document.head.appendChild(s);
    });
  }
  return sheetJsPromise;
}

/** Brigada faylini o'qiydi. raw — Excel'ga qaytarib yozish uchun asl baytlar. */
async function defaultModelLoader(file) {
  const [XLSX, res] = await Promise.all([loadSheetJS(), fetch(`/${encodeURIComponent(file)}`)]);
  if (!res.ok) throw new Error(`Jurnal fayli topilmadi: ${file}`);
  const raw = await res.arrayBuffer();
  const wb = XLSX.read(raw, { type: 'array', cellFormula: true });
  return { ...fromSheetJS(XLSX, wb), raw };
}

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function Pu74Journal({ modelLoader = defaultModelLoader, initialBrigade = 0, initialSheet = 2, initialMonth }) {
  const { user } = useAuth();
  const role = (user && user.role) || '';
  const [brigade, setBrigade] = useState(initialBrigade);
  const B = BRIGADES[brigade];
  const [month, setMonth] = useState(initialMonth || currentMonth());
  const [model, setModel] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [sheet, setSheet] = useState(initialSheet);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(null);
  const [zoom, setZoom] = useState('fit');
  const [deskW, setDeskW] = useState(1000);
  const [printing, setPrinting] = useState(null); // null | 'current' | 'all'
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);     // {type, text}
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnText, setReturnText] = useState('');
  const deskRef = useRef(null);
  const monthPicked = useRef(!!initialMonth);

  const store = useJournalStore(B.id, month);
  const { edits, setEdits, journal, phase, months } = store;
  const canEdit = phase === 'ready' && !!journal && !!journal.can_edit;

  const sheetsTpl = TEMPLATE.sheets;
  const styles = TEMPLATE.styles;

  // Brigada fayli (shakl + asl qiymatlar)
  const loadModel = useCallback(async () => {
    setModel(null);
    setLoadError('');
    try {
      setModel(await modelLoader(B.file));
    } catch (e) {
      setLoadError(e.message || 'Jurnalni yuklab bo‘lmadi');
    }
  }, [B.file, modelLoader]);
  useEffect(() => { loadModel(); }, [loadModel]);

  // Birinchi ochilishda: joriy oy ochilmagan bo'lsa, eng oxirgi ochilgan oyga o'tish
  useEffect(() => {
    if (monthPicked.current || !months.length) return;
    monthPicked.current = true;
    if (!months.some((m) => m.month === month)) setMonth(months[0].month);
  }, [months, month]);

  useEffect(() => { setActive(null); if (!canEdit) setEditing(false); }, [canEdit, month, brigade]);
  useEffect(() => { setNotice(null); setReturnOpen(false); }, [month, brigade]);

  const computed = useMemo(() => (model ? computeWorkbook(model, edits) : null), [model, edits]);
  const views = useMemo(() => {
    if (!computed) return null;
    return sheetsTpl.map((tpl, si) => {
      const cells = computed.sheets[si] ? computed.sheets[si].cells : {};
      return { tpl, cells, layout: buildLayout(tpl), analysis: analyzeSheet(tpl, cells) };
    });
  }, [computed, sheetsTpl]);

  // Ekran kengligi
  useLayoutEffect(() => {
    const el = deskRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setDeskW(entry.contentRect.width));
    ro.observe(el);
    setDeskW(el.clientWidth - 48);
    return () => ro.disconnect();
  }, [model, phase]);

  const current = views && phase === 'ready' ? views[sheet] : null;
  const bookW = current ? current.layout.width + BOOKMARK_W : 1;
  const fitScale = Math.min(1, Math.max(0.15, deskW / bookW));
  const scale = zoom === 'fit' ? fitScale : zoom;

  const changeZoom = (dir) => {
    const steps = [0.25, 0.35, 0.5, 0.65, 0.8, 1, 1.25, 1.5];
    const next = dir > 0 ? steps.find((s) => s > scale + 0.001) : [...steps].reverse().find((s) => s < scale - 0.001);
    setZoom(next || scale);
  };

  // Katakni o'zgartirish
  const commit = useCallback((si, r, c, raw, move) => {
    setActive(null);
    if (raw !== null && canEdit) {
      const k = editKey(si, r, c);
      const orig = model?.sheets[si]?.cells[cellKey(r, c)];
      const value = raw.trim();
      const origVal = orig ? orig.v : null;
      const same = !orig?.f && (
        (value === '' && (origVal === null || origVal === '' || origVal === undefined)) ||
        (toNumber(value) !== null && toNumber(value) === toNumber(origVal)) ||
        value === String(origVal ?? ''));
      setEdits((prev) => {
        const next = { ...prev };
        if (same) delete next[k];
        else next[k] = toNumber(value) !== null ? toNumber(value) : value;
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
      });
    }
    if (move && views) {
      const v = views[si];
      const d = { down: [1, 0], up: [-1, 0], right: [0, 1], left: [0, -1] }[move];
      let [nr, nc] = [r + d[0], c + d[1]];
      for (let i = 0; i < 60; i++) {
        if (nr < 0 || nc < 0 || nr >= v.tpl.rows.length || nc >= v.tpl.cols.length) return;
        const a = v.analysis.anchorOf.get(cellKey(nr, nc));
        const isAnchor = !a || (a[0] === nr && a[1] === nc);
        const cell = v.cells[cellKey(nr, nc)];
        const locked = cell && cell.f && !cell.edited;
        if (isAnchor && !locked && v.tpl.rows[nr] > 0 && v.tpl.cols[nc] > 0) { setActive({ si, r: nr, c: nc }); return; }
        nr += d[0]; nc += d[1];
      }
    }
  }, [model, views, canEdit, setEdits]);

  // Chop etish
  useEffect(() => {
    if (!printing) return undefined;
    const after = () => setPrinting(null);
    window.addEventListener('afterprint', after);
    const t = setTimeout(() => window.print(), 300);
    return () => { clearTimeout(t); window.removeEventListener('afterprint', after); };
  }, [printing]);

  const run = async (label, fn) => {
    setBusy(label);
    setNotice(null);
    try { await fn(); } catch (e) { setNotice({ type: 'err', text: e.message || 'Xatolik yuz berdi' }); } finally { setBusy(''); }
  };

  // Yangi oyni ochish: oldingi oyning rejasi ko'chiriladi, kunlik qiymatlar tozalanadi
  const openMonth = () => run('open', async () => {
    if (!model) return;
    const prev = months.filter((m) => m.month < month).map((m) => m.month).sort().pop();
    let base = null;
    if (prev) base = await store.fetchMonthEdits(prev);
    if (!base) {
      const legacy = await loadLegacyEdits(B.file);
      if (!months.length) {
        // Birinchi oy: hozirgi jurnal (fayl + avvalgi tahrirlar) o'zgarishsiz olinadi
        await store.create(legacy);
        setNotice({ type: 'ok', text: `${monthLabel(month)} jurnali ochildi — avvalgi ma’lumotlar saqlandi` });
        return;
      }
      base = legacy;
    }
    await store.create(carryOverEdits(model, sheetsTpl, base));
    setNotice({ type: 'ok', text: `${monthLabel(month)} jurnali ochildi: ${prev ? monthLabel(prev) : 'oldingi'} rejasi ko‘chirildi, kunlik qiymatlar tozalandi` });
  });

  const exportXlsx = () => run('export', async () => {
    if (!model || !model.raw || !computed) throw new Error('Asl Excel fayli yuklanmagan');
    const bytes = await buildJournalXlsx(model.raw, computed.sheets);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PU-74_${B.id}_${month}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  const status = (action, comment) => run(action, async () => {
    await store.changeStatus(action, comment);
    setEditing(false);
    const msg = {
      submit: 'Jurnal tekshiruvga topshirildi',
      approve: 'Jurnal tasdiqlandi va qulflandi',
      return: 'Jurnal izoh bilan qaytarildi',
      reopen: 'Jurnal qayta ochildi',
    }[action];
    setNotice({ type: 'ok', text: msg });
  });

  const undoAll = () => {
    if (!window.confirm('Shu oydagi barcha qo‘lda kiritilgan o‘zgarishlar o‘chirilsinmi?')) return;
    setEdits({});
  };

  const editedCount = Object.keys(edits).length;
  const st = journal ? STATUS[journal.status] || STATUS.draft : null;
  const monthOptions = useMemo(() => {
    const set = new Set(months.map((m) => m.month));
    set.add(month);
    set.add(currentMonth());
    const latest = [...set].sort().pop();
    set.add(shiftMonth(latest, 1));
    return [...set].sort().reverse();
  }, [months, month]);
  const monthStatus = (m) => {
    const x = months.find((y) => y.month === m);
    return x ? (STATUS[x.status] || STATUS.draft).label.toLowerCase() : 'ochilmagan';
  };

  const bookmarks = views && sheetsTpl.map((t, i) => (
    <button key={t.name} type="button" aria-current={i === sheet ? 'page' : undefined} onClick={() => { setActive(null); setSheet(i); }}>
      {sheetLabel(t.name)}
    </button>
  ));

  const can = (action) => {
    if (!journal || phase !== 'ready' || store.offline || !journal.version) return false;
    const s = journal.status;
    if (action === 'submit') return (s === 'draft' || s === 'returned') && ['admin', 'bolinma', 'department'].includes(role);
    if (action === 'approve' || action === 'return') return s === 'submitted' && ['admin', 'department'].includes(role);
    if (action === 'reopen') return (s === 'approved' || s === 'submitted') && role === 'admin';
    return false;
  };
  const stamp = journal && journal.status === 'approved' ? { by: journal.approved_by, at: fmtTime(journal.approved_at).split(' ')[0] } : null;

  return (
    <div className={`pu74j${editing ? ' editing' : ''}`}>
      {/* 1-qator: brigada, oy, holat va amallar */}
      <div className="pu74j-toolbar">
        <div className="pu74j-group" role="group" aria-label="Brigada">
          {BRIGADES.map((b, i) => (
            <button key={b.file} type="button" className="pu74j-btn" aria-pressed={i === brigade} onClick={() => { setBrigade(i); monthPicked.current = false; }}>
              {b.title}
            </button>
          ))}
        </div>

        <div className="pu74j-group" role="group" aria-label="Oy">
          <button type="button" className="pu74j-btn" aria-label="Oldingi oy" onClick={() => { monthPicked.current = true; setMonth((m) => shiftMonth(m, -1)); }}>
            <ChevronLeft size={16} />
          </button>
          <select
            className="pu74j-select"
            value={month}
            aria-label="Oyni tanlash"
            onChange={(e) => { monthPicked.current = true; setMonth(e.target.value); }}
          >
            {monthOptions.map((m) => <option key={m} value={m}>{monthLabel(m)} — {monthStatus(m)}</option>)}
          </select>
          <button type="button" className="pu74j-btn" aria-label="Keyingi oy" onClick={() => { monthPicked.current = true; setMonth((m) => shiftMonth(m, 1)); }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {st && phase === 'ready' && (
          <span className={`pu74j-badge ${st.cls}`}>
            {journal.status === 'approved' && <Lock size={13} />}{st.label}
          </span>
        )}
        {store.offline && <span className="pu74j-badge st-offline"><CloudOff size={13} /> Oflayn</span>}

        <div className="pu74j-group" role="group" aria-label="Amallar">
          {can('submit') && <button type="button" className="pu74j-btn" disabled={!!busy} onClick={() => status('submit')}><Send size={15} /> Topshirish</button>}
          {can('approve') && <button type="button" className="pu74j-btn primary" disabled={!!busy} onClick={() => status('approve')}><CircleCheckBig size={15} /> Tasdiqlash</button>}
          {can('return') && <button type="button" className="pu74j-btn" disabled={!!busy} onClick={() => setReturnOpen((o) => !o)}><Undo2 size={15} /> Qaytarish</button>}
          {can('reopen') && <button type="button" className="pu74j-btn" disabled={!!busy} onClick={() => status('reopen')}><LockOpen size={15} /> Qayta ochish</button>}
          <button type="button" className="pu74j-btn" disabled={!model || phase !== 'ready' || !!busy} onClick={exportXlsx}><Download size={15} /> Excel</button>
          <button type="button" className="pu74j-btn" disabled={!views || phase !== 'ready'} onClick={() => setPrinting('current')}><Printer size={15} /> Shu betni</button>
          <button type="button" className="pu74j-btn" disabled={!views || phase !== 'ready'} onClick={() => setPrinting('all')}><Printer size={15} /> Butun jurnal</button>
        </div>
      </div>

      {returnOpen && (
        <div className="pu74j-panel">
          <label htmlFor="pu74-return">Qaytarish sababi (brigada ko‘radi)</label>
          <textarea id="pu74-return" rows={2} value={returnText} onChange={(e) => setReturnText(e.target.value)} placeholder="Masalan: 10-kun soatlari tabelga mos emas" />
          <div className="pu74j-row">
            <button type="button" className="pu74j-btn primary" disabled={!returnText.trim() || !!busy} onClick={async () => { await status('return', returnText.trim()); setReturnOpen(false); setReturnText(''); }}>Qaytarish</button>
            <button type="button" className="pu74j-btn" onClick={() => setReturnOpen(false)}>Bekor qilish</button>
          </div>
        </div>
      )}

      {phase === 'ready' && journal && journal.status === 'returned' && journal.comment && (
        <div className="pu74j-note warn">Tekshiruvchi izohi: {journal.comment}</div>
      )}
      {phase === 'ready' && journal && journal.status === 'approved' && (
        <div className="pu74j-note ok">Tasdiqlagan: {journal.approved_by} · {fmtTime(journal.approved_at)}. Jurnal qulflangan.</div>
      )}
      {phase === 'ready' && journal && journal.status === 'submitted' && (
        <div className="pu74j-note">Topshirgan: {journal.submitted_by} · {fmtTime(journal.submitted_at)}. Tekshiruvchi qaror qilguncha brigada o‘zgartira olmaydi.</div>
      )}
      {notice && <div className={`pu74j-note ${notice.type === 'err' ? 'err' : 'ok'}`}>{notice.text}</div>}
      {store.conflict && (
        <div className="pu74j-note warn">
          Bu oy jurnalini boshqa foydalanuvchi ({store.conflict.updated_by || 'nomaʼlum'}) ham o‘zgartirgan.
          <button type="button" className="pu74j-btn" onClick={() => store.resolveConflict(false)}>Serverdagini olish</button>
          <button type="button" className="pu74j-btn" onClick={() => store.resolveConflict(true)}>Meniki ustidan yozilsin</button>
        </div>
      )}

      {/* 2-qator: betlar, masshtab, tahrirlash */}
      <div className="pu74j-toolbar">
        <div className="pu74j-group" role="group" aria-label="Betlar" style={{ maxWidth: '100%' }}>
          <button type="button" className="pu74j-btn" aria-label="Oldingi bet" disabled={sheet === 0} onClick={() => { setActive(null); setSheet((s) => Math.max(0, s - 1)); }}>
            <ChevronLeft size={16} />
          </button>
          <div className="pu74j-pages">
            {sheetsTpl.map((t, i) => (
              <button key={t.name} type="button" className="pu74j-btn" aria-pressed={i === sheet} onClick={() => { setActive(null); setSheet(i); }}>
                {i === 0 ? <><BookOpen size={14} /> 1</> : sheetLabel(t.name)}
              </button>
            ))}
          </div>
          <button type="button" className="pu74j-btn" aria-label="Keyingi bet" disabled={sheet === sheetsTpl.length - 1} onClick={() => { setActive(null); setSheet((s) => Math.min(sheetsTpl.length - 1, s + 1)); }}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="pu74j-group" role="group" aria-label="Masshtab">
          <button type="button" className="pu74j-btn" aria-label="Kichraytirish" onClick={() => changeZoom(-1)}><ZoomOut size={16} /></button>
          <button type="button" className="pu74j-btn" aria-pressed={zoom === 'fit'} onClick={() => setZoom('fit')}>{Math.round(scale * 100)}%</button>
          <button type="button" className="pu74j-btn" aria-label="Kattalashtirish" onClick={() => changeZoom(1)}><ZoomIn size={16} /></button>
        </div>

        <div className="pu74j-group" role="group" aria-label="Tahrirlash">
          <button
            type="button"
            className="pu74j-btn"
            aria-pressed={editing}
            disabled={!canEdit}
            title={!canEdit && journal ? 'Jurnal qulflangan' : undefined}
            onClick={() => { setEditing((e) => !e); setActive(null); }}
          >
            <Pencil size={15} /> {editing ? 'Tahrirlash yoqilgan' : 'Tahrirlash'}
          </button>
          <button type="button" className="pu74j-btn" aria-label="Qayta yuklash" onClick={() => { loadModel(); store.reload(); }}><RefreshCw size={15} /></button>
        </div>

        {(store.sync.text || editedCount > 0) && phase === 'ready' && (
          <span className={`pu74j-status${store.sync.state === 'warn' ? ' warn' : ''}`}>
            {store.sync.text}{store.sync.text && editedCount > 0 ? ' · ' : ''}
            {editedCount > 0 && <>{editedCount} ta katak o‘zgartirilgan</>}
            {editing && editedCount > 0 && <button type="button" className="pu74j-btn" style={{ minHeight: 26 }} onClick={undoAll}>Asliga qaytarish</button>}
          </span>
        )}
      </div>

      <div className="pu74j-desk" ref={deskRef}>
        {loadError && (
          <div className="pu74j-message">
            {loadError}
            <div><button type="button" className="pu74j-btn" style={{ marginTop: 12 }} onClick={loadModel}><RefreshCw size={15} /> Qayta urinish</button></div>
          </div>
        )}
        {!loadError && (phase === 'loading' || !views) && <div className="pu74j-message">Jurnal ochilmoqda…</div>}
        {!loadError && views && phase === 'missing' && (
          <div className="pu74j-message">
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{monthLabel(month)} jurnali hali ochilmagan</div>
            <div style={{ marginBottom: 16, color: 'rgb(148 163 184)' }}>
              {months.length
                ? 'Oldingi oyning rejasi (ishlar, joylar, normalar, xodimlar) ko‘chiriladi, kunlik qiymatlar bo‘sh bo‘ladi.'
                : 'Hozirgi jurnaldagi barcha ma’lumotlar shu oyga o‘tkaziladi.'}
            </div>
            <button type="button" className="pu74j-btn primary" disabled={!!busy || !model} onClick={openMonth}>
              <CalendarPlus size={16} /> {monthLabel(month)} jurnalini ochish
            </button>
          </div>
        )}
        {current && (
          <div style={{ zoom: scale, width: bookW }}>
            <SheetView
              si={sheet}
              tpl={current.tpl}
              styles={styles}
              cells={current.cells}
              layout={current.layout}
              analysis={current.analysis}
              editing={editing && canEdit}
              active={active}
              onActivate={setActive}
              onCommit={commit}
              bookmarks={bookmarks}
              stamp={stamp}
            />
          </div>
        )}
      </div>

      {current && (
        <div className="pu74j-legend">
          <span><i className="lg-calc" /> ko‘k — avtomatik hisoblangan</span>
          {editedCount > 0 && <span><i className="lg-edit" /> qo‘lda kiritilgan</span>}
          {current.analysis.dayCols.size > 0 && current.analysis.offDays.size > 0 && <span><i className="lg-off" /> ish bo‘lmagan kun</span>}
          {current.analysis.checkRow >= 0 && <span><i className="lg-bad" /> tabel bilan mos emas</span>}
          {editing && <span>Katakni bosing, yozing, Enter — saqlash va pastga o‘tish, Esc — bekor qilish</span>}
        </div>
      )}

      {printing && views && phase === 'ready' && createPortal(
        <div className="pu74j pu74j-print">
          {(printing === 'all' ? views.map((v, i) => [v, i]) : [[views[sheet], sheet]]).map(([v, i]) => {
            const z = Math.min(1, PRINT_W / v.layout.width, PRINT_H / (v.layout.height * 1.12));
            return (
              <div key={i} className="pu74j-print-page">
                <div style={{ zoom: z }}>
                  <SheetView
                    si={i}
                    tpl={v.tpl}
                    styles={styles}
                    cells={v.cells}
                    layout={v.layout}
                    analysis={v.analysis}
                    editing={false}
                    active={null}
                    onActivate={() => {}}
                    onCommit={() => {}}
                    stamp={stamp}
                  />
                </div>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
