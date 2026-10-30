import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, ChevronLeft, ChevronRight, Printer, ZoomIn, ZoomOut, Pencil, RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';
import TEMPLATE from './pu74Template.json';
import {
  analyzeSheet, cellKey, computeWorkbook, editKey, findSplit, formatValue, fromSheetJS, sheetLabel, toNumber,
} from './journalModel';
import './pu74Journal.css';

export const BRIGADES = [
  { file: '1-brigada.xlsx', title: '1-brigada' },
  { file: '2-brigada.xlsx', title: '2-brigada' },
  { file: '3-brigada.xlsx', title: '3-brigada' },
];

const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
const PAD_X = 40;      // betning chap/o'ng cheti
const PAD_TOP = 34;
const PAD_BOTTOM = 40;
const GAP = 64;        // ikki bet orasidagi bo'shliq (umurtqa)
const BOOKMARK_W = 50;
const PRINT_W = 1060;  // A4 albom, 8 mm chetlar bilan (px)
const PRINT_H = 730;

// Eski versiya bilan bir xil kalit (public/js/pu74.js: getPU74LocalKey)
const localKey = (file) => `pu74_edits_${file}`;
const localTsKey = (file) => `pu74_edits_ts_${file}`;
const serverKey = (file) => `pu74_edits_${file}`;

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

async function defaultModelLoader(file) {
  const [XLSX, res] = await Promise.all([loadSheetJS(), fetch(`/${encodeURIComponent(file)}`)]);
  if (!res.ok) throw new Error(`Jurnal fayli topilmadi: ${file}`);
  const wb = XLSX.read(await res.arrayBuffer(), { type: 'array', cellFormula: true });
  return fromSheetJS(XLSX, wb);
}

function readLocal(file) {
  try {
    return {
      edits: JSON.parse(localStorage.getItem(localKey(file)) || '{}') || {},
      ts: Number(localStorage.getItem(localTsKey(file)) || 0),
    };
  } catch {
    return { edits: {}, ts: 0 };
  }
}

function writeLocal(file, edits, ts) {
  try {
    localStorage.setItem(localKey(file), JSON.stringify(edits));
    localStorage.setItem(localTsKey(file), String(ts));
  } catch { /* xotira to'la yoki bloklangan — server nusxasi baribir bor */ }
}

// ---------------------------------------------------------------------------
// Bitta varaqni chizish
// ---------------------------------------------------------------------------

function borderCss(code) {
  if (!code) return undefined;
  const w = Number(code[0]) || 1;
  const kind = { s: 'solid', d: 'dashed', o: 'dotted' }[code[1]] || 'solid';
  if (w >= 3) return `3px double var(--ink)`;
  return `${w}px ${kind} var(--ink)`;
}

function buildLayout(tpl) {
  const split = findSplit(tpl);
  const cols = tpl.cols;
  const x = [0];
  cols.forEach((w) => x.push(x[x.length - 1] + w));
  const tableW = x[x.length - 1] + (split > 0 ? GAP : 0);
  const tableH = tpl.rows.reduce((a, b) => a + b, 0);
  return {
    split,
    x,
    tableW,
    width: tableW + PAD_X * 2,
    height: tableH + PAD_TOP + PAD_BOTTOM,
    leftW: split > 0 ? PAD_X + x[split] + GAP / 2 : 0,
  };
}

const SheetView = React.memo(function SheetView({
  si, tpl, styles, cells, layout, analysis, editing, active, onActivate, onCommit, bookmarks,
}) {
  const { split, leftW, width } = layout;
  const { anchorOf, headerTop, headerBottom, totalRow, dayCols, offDays, mismatches, groups } = analysis;

  const rowClass = useMemo(() => {
    const m = new Map();
    if (dayCols.size) {
      for (const g of groups) if (!g.active) for (let r = g.start; r <= g.end; r++) m.set(r, 'idle');
    }
    if (totalRow >= 0) m.set(totalRow, 'total');
    return m;
  }, [groups, dayCols, totalRow]);

  const pairTop = useMemo(() => {
    const s = new Set();
    for (const g of groups) if (g.end === g.start + 1) s.add(g.start);
    return s;
  }, [groups]);

  const merged = useMemo(() => {
    const m = new Map();
    for (const [r1, c1, r2, c2] of tpl.merges) m.set(cellKey(r1, c1), [r2 - r1 + 1, c2 - c1 + 1]);
    return m;
  }, [tpl]);

  const offRowsFrom = headerTop >= 0 ? headerTop : 0;
  const offRowsTo = totalRow >= 0 ? totalRow : -1;

  const rows = [];
  for (let r = 0; r < tpl.rows.length; r++) {
    const h = tpl.rows[r];
    if (h === 0) continue;
    const tds = [];
    let gapPlaced = split <= 0;
    for (let c = 0; c < tpl.cols.length; c++) {
      if (!gapPlaced && c >= split) {
        tds.push(<td key="gap" className="gap" />);
        gapPlaced = true;
      }
      const key = cellKey(r, c);
      const anchor = anchorOf.get(key);
      if (anchor && (anchor[0] !== r || anchor[1] !== c)) continue;
      if (tpl.cols[c] === 0) continue;
      const span = merged.get(key);
      const st = styles[tpl.styles[key]] || {};
      const cell = cells[key];
      const value = cell ? cell.v : null;
      const isNum = toNumber(value) !== null;
      const isHead = r >= headerTop && r <= headerBottom && headerTop >= 0;
      const right = cells[cellKey(r, c + 1)];
      const nextFilled = c + 1 < tpl.cols.length && (anchorOf.has(cellKey(r, c + 1)) ||
        (right && right.v !== null && right.v !== undefined && formatValue(right.v) !== ''));

      const cls = [];
      const style = { height: h };
      if (st.bd) {
        const [t, ri, b, l] = st.bd;
        if (t) style.borderTop = borderCss(t);
        if (ri) style.borderRight = borderCss(ri);
        if (b) style.borderBottom = borderCss(b);
        if (l) style.borderLeft = borderCss(l);
        if ((t || ri || b || l) && (isNum || nextFilled || span)) cls.push('bd');
        if (isHead && (t || ri || b || l)) cls.push('head');
      }
      if (st.b) style.fontWeight = 700;
      if (st.i) style.fontStyle = 'italic';
      if (st.u) style.textDecoration = 'underline';
      style.fontSize = `${Math.max(9, ((st.sz || 11) * 4) / 3 * 0.92).toFixed(1)}px`;
      const h2 = st.h || (isHead || dayCols.has(c) ? 'c' : isNum ? 'r' : 'l');
      style.textAlign = { l: 'left', c: 'center', r: 'right', j: 'justify', d: 'center', f: 'left' }[h2] || 'left';
      style.verticalAlign = { c: 'middle', t: 'top', j: 'middle', d: 'middle' }[st.v] || 'bottom';
      if (st.w || isHead) cls.push('wrap');
      if (cell && cell.f && !isHead) cls.push('calc');
      if (cell && cell.edited) cls.push('edited');
      if (analysis.checkRow >= 0 && pairTop.has(r) && dayCols.has(c) && !span) cls.push('pairtop');
      if (offDays.has(c) && r > headerBottom && r >= offRowsFrom && r <= offRowsTo + 2) cls.push('off');
      if (mismatches.has(key)) cls.push('bad');

      const canEdit = editing && !(cell && cell.f && !cell.edited) && !isHead;
      if (editing) cls.push(canEdit ? 'editable' : 'locked');
      const isActive = active && active.si === si && active.r === r && active.c === c;
      if (isActive) cls.push('active');

      const text = formatValue(value);
      let content = text;
      if (st.rot && text) content = <span className="rot">{text}</span>;
      if (isActive) {
        content = (
          <CellInput
            initial={cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : ''}
            onDone={(v, move) => onCommit(si, r, c, v, move)}
          />
        );
      }

      const title = cell && cell.f && editing && !cell.edited ? 'Avtomatik hisoblanadi' : undefined;
      tds.push(
        <td
          key={c}
          rowSpan={span ? span[0] : undefined}
          colSpan={span ? span[1] : undefined}
          className={cls.join(' ') || undefined}
          style={style}
          title={title}
          onClick={canEdit && !isActive ? () => onActivate({ si, r, c }) : undefined}
        >
          {content}
        </td>,
      );
    }
    if (!gapPlaced) tds.push(<td key="gap" className="gap" />);
    rows.push(<tr key={r} className={rowClass.get(r)}>{tds}</tr>);
  }

  return (
    <div className="pu74j-book" style={{ width: width + (bookmarks ? BOOKMARK_W : 0), padding: `${PAD_TOP}px 0 ${PAD_BOTTOM}px ${PAD_X}px` }}>
      {split > 0 ? (
        <>
          <div className="pu74j-sheet-bg left" style={{ left: 0, width: leftW }} />
          <div className="pu74j-sheet-bg right" style={{ left: leftW, width: width - leftW }} />
          <div className="pu74j-spine" style={{ left: leftW - 3 }} />
        </>
      ) : (
        <div className="pu74j-sheet-bg single" style={{ left: 0, width }} />
      )}
      {bookmarks && <div className="pu74j-bookmarks" style={{ left: width }}>{bookmarks}</div>}
      <table className="pu74j-table" style={{ width: layout.tableW }}>
        <colgroup>
          {tpl.cols.map((w, c) => (
            <React.Fragment key={c}>
              {split > 0 && c === split && <col style={{ width: GAP }} />}
              <col style={{ width: w }} />
            </React.Fragment>
          ))}
          {split > 0 && split >= tpl.cols.length && <col style={{ width: GAP }} />}
        </colgroup>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
});

function CellInput({ initial, onDone }) {
  const [v, setV] = useState(initial);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const finish = (value, move) => {
    if (done.current) return;
    done.current = true;
    onDone(value, move);
  };
  return (
    <input
      ref={ref}
      value={v}
      inputMode="decimal"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => finish(v, null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(v, e.shiftKey ? 'up' : 'down'); }
        else if (e.key === 'Tab') { e.preventDefault(); finish(v, e.shiftKey ? 'left' : 'right'); }
        else if (e.key === 'Escape') { e.preventDefault(); finish(null, null); }
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Asosiy komponent
// ---------------------------------------------------------------------------

export default function Pu74Journal({ modelLoader = defaultModelLoader, initialBrigade = 0, initialSheet = 2 }) {
  const [brigade, setBrigade] = useState(initialBrigade);
  const file = BRIGADES[brigade].file;
  const [model, setModel] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [edits, setEdits] = useState({});
  const [sheet, setSheet] = useState(initialSheet);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(null);
  const [zoom, setZoom] = useState('fit');
  const [deskW, setDeskW] = useState(1000);
  const [save, setSave] = useState({ state: 'idle', text: '' });
  const [printing, setPrinting] = useState(null); // null | 'current' | 'all'
  const deskRef = useRef(null);
  const saveTimer = useRef(null);
  const loadedFor = useRef(null);

  const sheetsTpl = TEMPLATE.sheets;
  const styles = TEMPLATE.styles;

  // Jurnal va tahrirlarni yuklash
  const load = useCallback(async () => {
    setModel(null);
    setLoadError('');
    setActive(null);
    loadedFor.current = null;
    try {
      const m = await modelLoader(file);
      const local = readLocal(file);
      let chosen = local.edits;
      try {
        const remote = await api.get(`/api/storage/load/${encodeURIComponent(serverKey(file))}`);
        if (remote && remote.edits && (Number(remote.updatedAt) || 0) >= local.ts) chosen = remote.edits;
      } catch { /* oflayn: lokal nusxa bilan ishlaymiz */ }
      setEdits(chosen || {});
      setModel(m);
      loadedFor.current = file;
    } catch (e) {
      setLoadError(e.message || 'Jurnalni yuklab bo‘lmadi');
    }
  }, [file, modelLoader]);

  useEffect(() => { load(); }, [load]);

  // Tahrirlarni saqlash (lokal darhol, serverga 0.8 s dan keyin)
  const persist = useCallback((next) => {
    const ts = Date.now();
    writeLocal(file, next, ts);
    setSave({ state: 'saving', text: 'Saqlanmoqda…' });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.post('/api/storage/save', { key: serverKey(file), data: { edits: next, updatedAt: ts } });
        setSave({ state: 'saved', text: 'Serverga saqlandi' });
      } catch {
        setSave({ state: 'warn', text: 'Faqat shu qurilmada saqlandi (server javob bermadi)' });
      }
    }, 800);
  }, [file]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const computed = useMemo(() => (model ? computeWorkbook(model, edits) : null), [model, edits]);

  const views = useMemo(() => {
    if (!computed) return null;
    return sheetsTpl.map((tpl, si) => {
      const cells = computed.sheets[si] ? computed.sheets[si].cells : {};
      return { tpl, cells, layout: buildLayout(tpl), analysis: analyzeSheet(tpl, cells) };
    });
  }, [computed, sheetsTpl]);

  // Ekran kengligini kuzatish
  useLayoutEffect(() => {
    const el = deskRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setDeskW(entry.contentRect.width));
    ro.observe(el);
    setDeskW(el.clientWidth - 48);
    return () => ro.disconnect();
  }, [model]);

  const current = views ? views[sheet] : null;
  const bookW = current ? current.layout.width + BOOKMARK_W : 1;
  const fitScale = Math.min(1, Math.max(0.15, deskW / bookW));
  const scale = zoom === 'fit' ? fitScale : zoom;

  const changeZoom = (dir) => {
    const steps = [0.25, 0.35, 0.5, 0.65, 0.8, 1, 1.25, 1.5];
    const cur = scale;
    const next = dir > 0 ? steps.find((s) => s > cur + 0.001) : [...steps].reverse().find((s) => s < cur - 0.001);
    setZoom(next || cur);
  };

  // Katakni o'zgartirish
  const commit = useCallback((si, r, c, raw, move) => {
    setActive(null);
    if (raw !== null) {
      const k = editKey(si, r, c);
      const orig = model?.sheets[si]?.cells[cellKey(r, c)];
      const value = raw.trim();
      const origVal = orig ? orig.v : null;
      const same = (value === '' && (origVal === null || origVal === '')) ||
        (toNumber(value) !== null && toNumber(value) === toNumber(origVal) && !orig?.f) ||
        (value === String(origVal ?? '') && !orig?.f);
      setEdits((prev) => {
        const next = { ...prev };
        if (same) delete next[k];
        else next[k] = toNumber(value) !== null ? toNumber(value) : value;
        if (JSON.stringify(next) !== JSON.stringify(prev)) persist(next);
        return next;
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
  }, [model, persist, views]);

  const undoAll = () => {
    if (!window.confirm('Shu brigadadagi barcha qo‘lda kiritilgan o‘zgarishlar o‘chirilsinmi? Excel fayldagi asl qiymatlar qaytadi.')) return;
    setEdits({});
    persist({});
  };

  // Chop etish
  useEffect(() => {
    if (!printing) return undefined;
    const after = () => setPrinting(null);
    window.addEventListener('afterprint', after);
    const t = setTimeout(() => window.print(), 300);
    return () => { clearTimeout(t); window.removeEventListener('afterprint', after); };
  }, [printing]);

  const editedCount = Object.keys(edits).length;
  const sheetHasDays = current && current.analysis.dayCols.size > 0;
  const sheetHasCheck = current && current.analysis.checkRow >= 0;

  const bookmarks = views && sheetsTpl.map((t, i) => (
    <button key={t.name} type="button" aria-current={i === sheet ? 'page' : undefined} onClick={() => { setActive(null); setSheet(i); }}>
      {sheetLabel(t.name)}
    </button>
  ));

  return (
    <div className={`pu74j${editing ? ' editing' : ''}`}>
      <div className="pu74j-toolbar">
        <div className="pu74j-group" role="group" aria-label="Brigada">
          {BRIGADES.map((b, i) => (
            <button key={b.file} type="button" className="pu74j-btn" aria-pressed={i === brigade} onClick={() => { setBrigade(i); setEditing(false); }}>
              {b.title}
            </button>
          ))}
        </div>

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

        <div className="pu74j-group" role="group" aria-label="Amallar">
          <button type="button" className="pu74j-btn" aria-pressed={editing} disabled={!model} onClick={() => { setEditing((e) => !e); setActive(null); }}>
            <Pencil size={15} /> {editing ? 'Tahrirlash yoqilgan' : 'Tahrirlash'}
          </button>
          <button type="button" className="pu74j-btn" disabled={!model} onClick={() => setPrinting('current')}>
            <Printer size={15} /> Shu betni
          </button>
          <button type="button" className="pu74j-btn" disabled={!model} onClick={() => setPrinting('all')}>
            <Printer size={15} /> Butun jurnal
          </button>
          <button type="button" className="pu74j-btn" aria-label="Qayta yuklash" onClick={load}><RefreshCw size={15} /></button>
        </div>

        {(save.text || editedCount > 0) && (
          <span className={`pu74j-status${save.state === 'warn' ? ' warn' : ''}`}>
            {save.text}{save.text && editedCount > 0 ? ' · ' : ''}
            {editedCount > 0 && (
              <>
                {editedCount} ta katak o‘zgartirilgan
                {editing && <button type="button" className="pu74j-btn" style={{ minHeight: 26 }} onClick={undoAll}>Asliga qaytarish</button>}
              </>
            )}
          </span>
        )}
      </div>

      <div className="pu74j-desk" ref={deskRef}>
        {loadError && (
          <div className="pu74j-message">
            {loadError}
            <div><button type="button" className="pu74j-btn" style={{ marginTop: 12 }} onClick={load}><RefreshCw size={15} /> Qayta urinish</button></div>
          </div>
        )}
        {!loadError && !current && <div className="pu74j-message">Jurnal ochilmoqda…</div>}
        {current && (
          <div style={{ zoom: scale, width: bookW }}>
            <SheetView
              si={sheet}
              tpl={current.tpl}
              styles={styles}
              cells={current.cells}
              layout={current.layout}
              analysis={current.analysis}
              editing={editing}
              active={active}
              onActivate={setActive}
              onCommit={commit}
              bookmarks={bookmarks}
            />
          </div>
        )}
      </div>

      {current && (
        <div className="pu74j-legend">
          <span><i className="lg-calc" /> ko‘k — avtomatik hisoblangan</span>
          {editedCount > 0 && <span><i className="lg-edit" /> qo‘lda o‘zgartirilgan</span>}
          {sheetHasDays && current.analysis.offDays.size > 0 && <span><i className="lg-off" /> ish bo‘lmagan kun</span>}
          {sheetHasCheck && <span><i className="lg-bad" /> tabel bilan mos emas</span>}
          {editing && <span>Katakni bosing, yozing, Enter — saqlash va pastga o‘tish, Esc — bekor qilish</span>}
        </div>
      )}

      {printing && views && createPortal(
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
