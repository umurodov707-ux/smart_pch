import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Printer, Download, Lock, Trash2, X, TriangleAlert, Send, ChevronLeft, Info, Smartphone, ArrowUp, ArrowDown } from 'lucide-react';
import api, { ApiError } from '../../utils/api';
import {
  COLUMNS, DEFAULT_META, LINE_CATEGORIES, MARKAS, ORDINAT_COLUMNS, RAIL_TYPES,
  cellLevel, normText, normalizeCategory, ordinatNorms, recordIssues,
} from './norms.js';
import { BODY_ORDER, HEADER, TOTAL_COLS, headerCells, recordCells } from './layout.js';
import { XS, buildXlsx } from './pu29Xlsx.js';
import NORM_INFO from './normInfo.json';
import SwitchSchematic from './SwitchSchematic.jsx';
import MeasureWizard, { hasDraft } from './MeasureWizard.jsx';
import { NODES, OTHER_KEYS, nodeDetail } from './switchSchema.js';

const enc = encodeURIComponent;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const fmtDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso || '');
};
const LEVEL_CLS = { green: 'lv-g', yellow: 'lv-y', red: 'lv-r' };
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

/** Ustun id -> me'yor turi (sarlavhani bosganda shu strelka uchun me'yor ko'rsatiladi) */
const COL_BY_ID = new Map(COLUMNS.map((c) => [c.id, c]));

function NormPopover({ id, meta, onClose, anchor }) {
  const info = NORM_INFO[id];
  const col = COL_BY_ID.get(id);
  if (!info && !col) return null;
  const mine = col ? normText(col.top.type, meta, col.top.sec || 0) : '';
  const mineBottom = col && col.bottom && col.bottom.type !== col.top.type ? normText(col.bottom.type, meta, col.bottom.sec || 0) : '';
  return (
    <div className="pu29-pop" style={{ left: anchor.x, top: anchor.y }} role="dialog" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="pu29-pop-x" aria-label="Yopish" onClick={onClose}><X size={14} /></button>
      <div className="t">{info ? info.title_uz : col.label}</div>
      {info && info.title_ru && <div className="ru">{info.title_ru}</div>}
      {mine && (
        <div className="mine">
          Shu strelka uchun ({meta.marka}, {LINE_CATEGORIES.find((c) => c.id === normalizeCategory(meta.lineCategory)).label}{['w'].includes(col.top.type) ? `, ${meta.type}` : ''}): <b>{mine}</b>
          {mineBottom && <> · pastki qator: <b>{mineBottom}</b></>}
        </div>
      )}
      {info && info.full_uz && <p>{info.full_uz}</p>}
      {info && info.norms && info.norms.length > 0 && (
        <ul>{info.norms.map((n) => <li key={`${n.color}${n.value}`} className={`n-${n.color}`}>{n.label}: {n.value}</li>)}</ul>
      )}
      {info && info.note_uz && <p className="note">{info.note_uz}</p>}
    </div>
  );
}

function Cell({ value, level, editable, onChange, onBlur, rowSpan, title }) {
  return (
    <td rowSpan={rowSpan} className={`v ${LEVEL_CLS[level] || ''}`} title={title}>
      {editable
        ? <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} inputMode="text" />
        : <span>{value ?? ''}</span>}
    </td>
  );
}

/**
 * Bitta strelkaning jurnali (eski "oq qog'oz" ko'rinishi): ma'lumotlar, tekshiruvlar jadvali va ordinatalar.
 */
export default function SwitchJournal({ bolinma, sw, switches, onSelect, onBack, onChanged, user }) {
  const [meta, setMeta] = useState({ ...DEFAULT_META, ...(sw.meta || {}) });
  const [tab, setTab] = useState('journal');
  const [entries, setEntries] = useState([]);
  const [ordinats, setOrdinats] = useState([]);
  const [drafts, setDrafts] = useState({});      // id -> {date, data}
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [pop, setPop] = useState(null);
  const [busy, setBusy] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [node, setNode] = useState(null);
  const saveTimers = useRef({});
  const base = `/api/pu29/${enc(bolinma)}/switches/${enc(sw.switch_number)}`;

  useEffect(() => { setMeta({ ...DEFAULT_META, ...(sw.meta || {}) }); }, [sw]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.get(`${base}/entries?kind=check`), api.get(`${base}/entries?kind=ordinat`)]);
      setEntries(a.entries || []);
      setOrdinats(b.entries || []);
      setDrafts({});
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [base]);
  useEffect(() => { load(); setPop(null); }, [load]);
  useEffect(() => () => Object.values(saveTimers.current).forEach(clearTimeout), []);
  useEffect(() => {
    if (!pop) return undefined;
    const close = () => setPop(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [pop]);

  const saveMeta = async (patch) => {
    const next = { ...meta, ...patch };
    setMeta(next);
    try {
      await api.put(base, { meta: patch });
      onChanged && onChanged();
    } catch (e) { setMsg({ type: 'err', text: `Saqlanmadi: ${e.message}` }); }
  };

  const rowOf = (e) => drafts[e.id] || { date: e.date, data: e.data };

  const persist = (entry, kind) => {
    const d = drafts[entry.id];
    if (!d) return;
    clearTimeout(saveTimers.current[entry.id]);
    saveTimers.current[entry.id] = setTimeout(async () => {
      try {
        const saved = await api.put(`/api/pu29/entries/${entry.id}`, { date: d.date, data: d.data });
        const set = kind === 'ordinat' ? setOrdinats : setEntries;
        set((list) => list.map((x) => (x.id === saved.id ? saved : x)));
        setDrafts((m) => { const n = { ...m }; if (n[entry.id] === d) delete n[entry.id]; return n; });
        setMsg({ type: 'ok', text: 'Saqlandi' });
        onChanged && onChanged();
      } catch (e) {
        if (e instanceof ApiError && e.status === 423) {
          setMsg({ type: 'err', text: 'Yozuv qulflangan (3 soatdan oshgan) — o‘zgarish saqlanmadi' });
          load();
        } else setMsg({ type: 'err', text: `Saqlanmadi: ${e.message}` });
      }
    }, 300);
  };

  const edit = (entry, key, value) => {
    setDrafts((m) => {
      const cur = m[entry.id] || { date: entry.date, data: { ...entry.data } };
      const next = key === '__date' ? { ...cur, date: value } : { ...cur, data: { ...cur.data, [key]: value } };
      return { ...m, [entry.id]: next };
    });
  };

  const addEntry = async (kind) => {
    setBusy(true);
    try {
      const e = await api.post(`${base}/entries`, { kind, date: today(), data: {} });
      if (kind === 'ordinat') setOrdinats((l) => [e, ...l]); else setEntries((l) => [e, ...l]);
      setMsg({ type: 'ok', text: 'Yangi qator qo‘shildi. 3 soat davomida tahrirlash mumkin, keyin qulflanadi.' });
      onChanged && onChanged();
    } catch (e) { setMsg({ type: 'err', text: e.message }); } finally { setBusy(false); }
  };

  const removeEntry = async (entry, kind) => {
    if (!window.confirm(`${fmtDate(entry.date)} sanadagi yozuv o‘chirilsinmi?`)) return;
    try {
      await api.delete(`/api/pu29/entries/${entry.id}`);
      const set = kind === 'ordinat' ? setOrdinats : setEntries;
      set((l) => l.filter((x) => x.id !== entry.id));
      onChanged && onChanged();
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
  };

  const latest = entries[0] ? rowOf(entries[0]) : null;
  const issues = useMemo(() => (latest ? recordIssues(latest.data, meta) : []), [latest, meta]);

  // Defektlar bo'limiga yuborish (faqat qizil, takrorlanmaydi)
  const sendDefects = async (data = latest && latest.data, date = latest && latest.date) => {
    const red = recordIssues(data || {}, meta).filter((i) => i.level === 'red');
    if (!red.length) return;
    setBusy(true);
    try {
      let existing = [];
      try { existing = await api.get(`/api/defects/${enc(bolinma)}`); } catch { existing = []; }
      const prefix = `Стр. №${sw.switch_number}`;
      const have = new Set((Array.isArray(existing) ? existing : []).map((d) => String(d.issue || '')));
      let sent = 0;
      for (const i of red) {
        const issue = `${prefix}: ${i.label}`;
        if (have.has(issue)) continue;
        await api.post('/api/defects', {
          bolinma_id: bolinma,
          km: meta.km ? Number(meta.km) || null : null,
          pk: meta.pk ? Number(meta.pk) || null : null,
          degree: 4,
          issue,
          description: `${meta.station || ''} ${prefix}. PU-29 ${fmtDate(date)}: ${i.value} (me’yor ${i.norm})`.trim(),
          date,
          status: 'active',
        });
        sent++;
      }
      setMsg({ type: 'ok', text: sent ? `${sent} ta nosozlik Defektlar bo‘limiga yuborildi${meta.km ? '' : ' (km ko‘rsatilmagan — PU-74 ga avtomatik tushishi uchun strelka km ni kiriting)'}` : 'Bu nosozliklar Defektlarda allaqachon bor' });
    } catch (e) { setMsg({ type: 'err', text: e.message }); } finally { setBusy(false); }
  };

  // Telefon rejimidan kelgan o'lchovlar — yangi tekshiruv sifatida saqlanadi
  const saveFromWizard = async (values, withDefects) => {
    const date = today();
    const e = await api.post(`${base}/entries`, { kind: 'check', date, data: values });
    setEntries((l) => [e, ...l]);
    setTab('journal');
    onChanged && onChanged();
    if (withDefects) await sendDefects(values, date);
    else setMsg({ type: 'ok', text: 'Tekshiruv saqlandi' });
  };

  const prevRow = entries[1] ? rowOf(entries[1]) : null;
  const nodeInfo = node ? (node === 'other' ? { id: 'other', title: 'Boshqa ko‘rsatkichlar', keys: OTHER_KEYS } : NODES.find((n) => n.id === node)) : null;
  const details = nodeInfo && latest ? nodeDetail(nodeInfo, latest.data, prevRow && prevRow.data, meta) : [];

  // Excel
  const exportXlsx = async () => {
    const title = `ЖУРНАЛ ПРОВЕРКИ СТРЕЛОЧНОГО ПЕРЕВОДА (ПУ-29)`;
    const cat = LINE_CATEGORIES.find((c) => c.id === normalizeCategory(meta.lineCategory));
    const metaLine = `Станция: ${meta.station || '—'}   Стрелка № ${sw.switch_number}   Путь: ${meta.pathNumber || cat.ru}   Тип: ${meta.type}   Марка: ${meta.marka}   Остряки: ${meta.switchType}   Год: ${meta.yearOfManufacture || '—'}   Брусья: ${meta.sleeperType}${meta.km ? `   ${meta.km} км${meta.pk ? ` пк ${meta.pk}` : ''}` : ''}`;
    const cells = [
      { r: 0, c: 0, v: title, cs: TOTAL_COLS, s: XS.title },
      { r: 1, c: 0, v: metaLine, cs: TOTAL_COLS, s: XS.plain },
    ];
    const H0 = 3;
    headerCells().forEach((h) => cells.push({ r: H0 + h.r, c: h.c, rs: h.rs, cs: h.cs, v: h.v, s: h.vertical ? XS.headV : XS.head }));
    let r = H0 + 3;
    for (const e of entries) {
      const row = rowOf(e);
      recordCells(row.data, meta, fmtDate(row.date)).forEach((x) => cells.push({
        r: r + x.r, c: x.c, rs: x.rs, v: x.v,
        s: x.label ? XS.bold : x.level === 'red' ? XS.red : x.level === 'yellow' ? XS.yellow : x.level === 'green' ? XS.green : XS.cell,
      }));
      r += 2;
    }
    const sheets = [{
      name: `Стр ${sw.switch_number}`,
      cells,
      cols: [11, 4, ...Array(TOTAL_COLS - 2).fill(6.5)],
      rowHeights: { [H0]: 22, [H0 + 1]: 40, [H0 + 2]: 120 },
    }];
    // Ordinatalar
    const norms = ordinatNorms(meta.type, meta.marka);
    const oc = [
      { r: 0, c: 0, v: `Ординаты переводной кривой — стрелка № ${sw.switch_number}`, cs: 15, s: XS.title },
      { r: 2, c: 0, v: 'Дата', rs: 2, s: XS.head },
      { r: 2, c: 1, v: 'Величина ординат в расстояниях от корня остряка', cs: 12, s: XS.head },
      { r: 2, c: 13, v: 'Прочие неисправности', rs: 2, s: XS.head },
      { r: 2, c: 14, v: 'Отметка об исправлении', rs: 2, s: XS.head },
      ...ORDINAT_COLUMNS.map((col, i) => ({ r: 3, c: 1 + i, v: col.label, s: XS.head })),
      { r: 4, c: 0, v: 'Орд. по норме', s: XS.bold },
      ...norms.map((n, i) => ({ r: 4, c: 1 + i, v: n, s: XS.bold })),
      { r: 4, c: 13, v: '', s: XS.cell }, { r: 4, c: 14, v: '', s: XS.cell },
    ];
    ordinats.forEach((e, k) => {
      const row = rowOf(e);
      oc.push({ r: 5 + k, c: 0, v: fmtDate(row.date), s: XS.cell });
      ORDINAT_COLUMNS.forEach((col, i) => oc.push({ r: 5 + k, c: 1 + i, v: row.data[col.key] ?? '', s: XS.cell }));
      oc.push({ r: 5 + k, c: 13, v: row.data.prochie ?? '', s: XS.left });
      oc.push({ r: 5 + k, c: 14, v: row.data.otmetka ?? '', s: XS.left });
    });
    sheets.push({ name: 'Ординаты', cells: oc, cols: [11, ...Array(12).fill(8), 30, 30], rowHeights: { 3: 30 } });
    const bytes = await buildXlsx(sheets);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `PU-29_${bolinma.replace(/[^0-9a-z-]/gi, '')}_strelka-${sw.switch_number}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const print = () => {
    document.body.classList.add('pu29-printing');
    const done = () => { document.body.classList.remove('pu29-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 50);
  };

  const showNorm = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const box = e.currentTarget.closest('.pu29-paper').getBoundingClientRect();
    setPop({ id, anchor: { x: Math.min(rect.left - box.left, box.width - 340), y: rect.bottom - box.top + 6 } });
  };

  const renderBody = (entry) => {
    const row = rowOf(entry);
    const ed = entry.can_edit;
    const v = row.data;
    const cellFor = (spec, rowSpan) => (
      <Cell
        key={`${spec.key}`}
        rowSpan={rowSpan}
        value={v[spec.key]}
        level={cellLevel(spec.type, v[spec.key], meta, spec.sec || 0)}
        editable={ed}
        title={normText(spec.type, meta, spec.sec || 0) ? `Me’yor: ${normText(spec.type, meta, spec.sec || 0)}` : undefined}
        onChange={(val) => edit(entry, spec.key, val)}
        onBlur={() => persist(entry, 'check')}
      />
    );
    const top = [];
    const bottom = [];
    BODY_ORDER.forEach((item, idx) => {
      if (item.kind === 'date') {
        top.push(
          <td key="date" rowSpan={2} className="d">
            {ed
              ? <input type="date" value={row.date} onChange={(e) => edit(entry, '__date', e.target.value)} onBlur={() => persist(entry, 'check')} />
              : fmtDate(row.date)}
          </td>,
        );
      } else if (item.kind === 'label') {
        top.push(<td key={`l${idx}`} className="lbl">{item.top}</td>);
        bottom.push(<td key={`l${idx}`} className="lbl">{item.bottom}</td>);
      } else {
        const { col } = item;
        top.push(cellFor(col.top, col.bottom ? undefined : 2));
        if (col.bottom) bottom.push(cellFor(col.bottom));
      }
    });
    top.push(
      <td key="act" rowSpan={2} className="act no-print">
        {ed
          ? <button type="button" aria-label="O‘chirish" onClick={() => removeEntry(entry, 'check')}><Trash2 size={14} /></button>
          : <span title={`Qulflangan. Kiritgan: ${entry.created_by || '—'}`}><Lock size={13} /></span>}
      </td>,
    );
    return (
      <React.Fragment key={entry.id}>
        <tr className={ed ? '' : 'locked'}>{top}</tr>
        <tr className={ed ? '' : 'locked'}>{bottom}</tr>
      </React.Fragment>
    );
  };

  const cat = normalizeCategory(meta.lineCategory);
  const labelFor = (m) => {
    if (cat === 'asosiy') return m === '1/11' ? ' ✓ (стандарт)' : m === '1/9' ? ' (только прямое)' : ' ⚠ (не рекомендуется)';
    if (cat === 'qabul') return m === '1/9' ? ' (осн. грузовые)' : m === '1/6' ? ' (симм. стрелки)' : '';
    return '';
  };
  const ordNorms = ordinatNorms(meta.type, meta.marka);

  return (
    <div className="pu29-sheet">
      <div className="pu29-bar no-print">
        <div className="pu29-bar-l">
          <button type="button" className="pu29-btn ghost" onClick={onBack}><ChevronLeft size={16} /> Strelkalar</button>
          <span className="brand">PU-29 SMART-PCH |</span>
          <select className="pu29-sw-select" value={sw.switch_number} onChange={(e) => onSelect(e.target.value)} aria-label="Strelka">
            {switches.map((s) => <option key={s.switch_number} value={s.switch_number}>№ {s.switch_number}</option>)}
          </select>
        </div>
        <div className="pu29-bar-r">
          {tab === 'journal' && (
            <button type="button" className="pu29-btn gold" onClick={() => setWizard(true)}>
              <Smartphone size={16} /> O‘lchov kiritish{hasDraft(bolinma, sw.switch_number) ? ' (qoralama)' : ''}
            </button>
          )}
          <button type="button" className={`pu29-btn ${tab === 'ordinat' ? 'gold' : 'ghost'}`} disabled={busy} onClick={() => addEntry(tab === 'ordinat' ? 'ordinat' : 'check')}>
            <Plus size={16} /> {tab === 'ordinat' ? 'O‘lchov qo‘shish' : 'Jadvalga qator'}
          </button>
          <button type="button" className="pu29-btn ghost" onClick={exportXlsx}><Download size={15} /> Excel</button>
          <button type="button" className="pu29-btn ghost" onClick={print}><Printer size={15} /> Chop etish</button>
        </div>
      </div>

      <div className="pu29-tabs no-print" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'journal'} onClick={() => setTab('journal')}>TEKSHIRUV JURNALI</button>
        <button type="button" role="tab" aria-selected={tab === 'ordinat'} onClick={() => setTab('ordinat')}>ORDINAT O‘LCHOVLARI</button>
      </div>

      {msg && <div className={`pu29-msg ${msg.type} no-print`}>{msg.text}<button type="button" aria-label="Yopish" onClick={() => setMsg(null)}><X size={14} /></button></div>}

      <div className="pu29-paper">
        <h1>{tab === 'ordinat' ? 'ОРДИНАТЫ ПЕРЕВОДНОЙ КРИВОЙ' : 'ЖУРНАЛ ПРОВЕРКИ СТРЕЛОЧНОГО ПЕРЕВОДА (ПУ-29)'}</h1>

        <div className="pu29-meta">
          <label className="m"><span>Станция</span>
            <input defaultValue={meta.station} key={`st${sw.switch_number}`} onBlur={(e) => e.target.value !== meta.station && saveMeta({ station: e.target.value })} placeholder="Станция номи" />
          </label>
          <div className="m"><span>Стрелка №</span><b>{sw.switch_number}</b></div>
          <label className="m"><span>Тип</span>
            <select value={meta.type} onChange={(e) => saveMeta({ type: e.target.value })}>{RAIL_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="m"><span>Путь №</span>
            <select value={cat} onChange={(e) => saveMeta({ lineCategory: e.target.value })}>{LINE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          </label>
          <label className="m"><span>Марка</span>
            <select value={meta.marka} onChange={(e) => saveMeta({ marka: e.target.value })}>{MARKAS.map((m) => <option key={m} value={m}>{m}{labelFor(m)}</option>)}</select>
          </label>
          <label className="m"><span>Остряки</span>
            <select value={meta.switchType} onChange={(e) => saveMeta({ switchType: e.target.value })}><option value="o‘ng">o‘ng</option><option value="chap">chap</option></select>
          </label>
          <label className="m"><span>Год</span>
            <select value={meta.yearOfManufacture} onChange={(e) => saveMeta({ yearOfManufacture: e.target.value })}><option value="">—</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
          </label>
          <label className="m"><span>Брусья</span>
            <select value={meta.sleeperType} onChange={(e) => saveMeta({ sleeperType: e.target.value })}><option value="temir beton">temir beton</option><option value="yog‘och">yog‘och</option></select>
          </label>
          <label className="m"><span>Км / пк</span>
            <span className="kmpk">
              <input defaultValue={meta.km} key={`km${sw.switch_number}`} inputMode="numeric" placeholder="км" onBlur={(e) => e.target.value !== meta.km && saveMeta({ km: e.target.value })} />
              <input defaultValue={meta.pk} key={`pk${sw.switch_number}`} inputMode="numeric" placeholder="пк" onBlur={(e) => e.target.value !== meta.pk && saveMeta({ pk: e.target.value })} />
            </span>
          </label>
        </div>

        {tab === 'journal' && (
          <div className="pu29-schema-wrap">
            <div className="pu29-schema-box">
              <div className="cap">SXEMA · {latest ? `oxirgi tekshiruv ${fmtDate(latest.date)}` : 'hali tekshirilmagan'}<span>nuqtani bosing</span></div>
              <SwitchSchematic values={latest ? latest.data : {}} meta={meta} selected={node} onSelect={(id) => setNode((cur) => (cur === id ? null : id))} />
              <div className="nodes">
                {NODES.map((n) => {
                  const d = latest ? nodeDetail(n, latest.data, null, meta) : [];
                  const lv = d.some((x) => x.level === 'red') ? 'red' : d.some((x) => x.level === 'yellow') ? 'yellow' : d.length ? 'green' : '';
                  return (
                    <button key={n.id} type="button" className={`nd ${lv} ${node === n.id ? 'on' : ''}`} onClick={() => setNode(node === n.id ? null : n.id)}>
                      <i>{n.no}</i>{n.title}
                    </button>
                  );
                })}
                <button type="button" className={`nd ${node === 'other' ? 'on' : ''}`} onClick={() => setNode(node === 'other' ? null : 'other')}><i>+</i>Boshqa</button>
              </div>
            </div>
            <div className="pu29-node">
              {nodeInfo ? (
                <>
                  <div className="t">{nodeInfo.no ? `${nodeInfo.no}. ` : ''}{nodeInfo.title}</div>
                  {details.length ? (
                    <table>
                      <thead><tr><th>O‘lchov</th><th>{latest ? fmtDate(latest.date) : ''}</th><th>{prevRow ? fmtDate(prevRow.date) : 'oldingi'}</th></tr></thead>
                      <tbody>
                        {details.map((d) => (
                          <tr key={d.key}>
                            <td>{d.label}<small>{d.norm && `me’yor ${d.norm}`}</small></td>
                            <td className={`v ${LEVEL_CLS[d.level] || ''}`}>
                              {d.value ?? '—'}
                              {d.trend === 'up' && <ArrowUp size={12} aria-label="oshgan" />}
                              {d.trend === 'down' && <ArrowDown size={12} aria-label="kamaygan" />}
                            </td>
                            <td className="p">{d.prev ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="muted">Bu joyda hali o‘lchov yo‘q.</p>}
                </>
              ) : (
                <>
                  <div className="t">Xulosa</div>
                  {latest ? (
                    <ul className="sum">
                      <li className="r"><span>Xavfli</span><b>{issues.filter((i) => i.level === 'red').length}</b></li>
                      <li className="y"><span>Ogohlantirish</span><b>{issues.filter((i) => i.level === 'yellow').length}</b></li>
                      <li className="g"><span>O‘lchangan</span><b>{Object.keys(latest.data).length}</b></li>
                      <li><span>Tekshiruvlar soni</span><b>{entries.length}</b></li>
                    </ul>
                  ) : <p className="muted">Birinchi tekshiruvni “O‘lchov kiritish” orqali kiriting — telefonda qulay.</p>}
                  <p className="muted">Sxemadagi nuqtani bossangiz, o‘sha joyning o‘lchovlari va oldingi tekshiruv bilan farqi chiqadi.</p>
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'journal' && latest && (
          <div className={`pu29-issues no-print ${issues.some((i) => i.level === 'red') ? 'red' : issues.length ? 'yellow' : 'ok'}`}>
            <div className="h">
              {issues.length ? <TriangleAlert size={16} /> : <Info size={16} />}
              Oxirgi tekshiruv ({fmtDate(latest.date)}): {issues.length ? `${issues.filter((i) => i.level === 'red').length} ta xavfli, ${issues.filter((i) => i.level === 'yellow').length} ta ogohlantirish` : 'barcha o‘lchovlar me’yorda'}
              {issues.some((i) => i.level === 'red') && (
                <button type="button" className="pu29-btn small" disabled={busy} onClick={() => sendDefects()}><Send size={13} /> Defektlarga yuborish</button>
              )}
            </div>
            {issues.length > 0 && (
              <div className="chips">{issues.map((i) => <span key={i.key} className={`chip ${i.level}`}>{i.label}: {i.value} (me’yor {i.norm})</span>)}</div>
            )}
          </div>
        )}

        {tab === 'journal' && (
          <div className="pu29-scroll">
            <table className="pu29-mega">
              <thead>
                {HEADER.map((row, r) => (
                  <tr key={r}>
                    {row.map((h) => (
                      <th key={`${h.id}${h.text}`} rowSpan={h.rs} colSpan={h.cs} className={h.id ? 'has-norm' : undefined} onClick={h.id ? (e) => showNorm(e, h.id) : undefined}>
                        {h.v ? <div className="vt">{h.text}</div> : h.text}
                      </th>
                    ))}
                    {r === 0 && <th rowSpan={3} className="no-print act-h">Act</th>}
                  </tr>
                ))}
              </thead>
              <tbody>
                {entries.map(renderBody)}
                {!entries.length && !loading && (
                  <tr><td colSpan={TOTAL_COLS + 1} className="empty">Tekshiruvlar yo‘q. “O‘lchov kiritish” tugmasini bosing.</td></tr>
                )}
                {loading && <tr><td colSpan={TOTAL_COLS + 1} className="empty">Yuklanmoqda…</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ordinat' && (
          <div className="pu29-scroll">
            <table className="pu29-ord">
              <thead>
                <tr>
                  <th rowSpan={2}>Дата</th>
                  <th colSpan={12}>Величина ординат в расстояниях от корня остряка</th>
                  <th rowSpan={2} className="wide">Прочие неисправности в стрелочном переводе</th>
                  <th rowSpan={2} className="wide">Отметка об исправлении, дата и подпись</th>
                  <th rowSpan={2} className="no-print">Act</th>
                </tr>
                <tr>{ORDINAT_COLUMNS.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                <tr className="norm"><td>Орд. по норме</td>{ordNorms.map((n, i) => <td key={i}>{n}</td>)}<td /><td /><td className="no-print" /></tr>
                {ordinats.map((e) => {
                  const row = rowOf(e);
                  const ed = e.can_edit;
                  const inp = (key, cls) => (
                    <td key={key} className={cls}>
                      {ed ? <input value={row.data[key] ?? ''} onChange={(ev) => edit(e, key, ev.target.value)} onBlur={() => persist(e, 'ordinat')} /> : (row.data[key] ?? '')}
                    </td>
                  );
                  return (
                    <tr key={e.id} className={ed ? '' : 'locked'}>
                      <td>{ed ? <input type="date" value={row.date} onChange={(ev) => edit(e, '__date', ev.target.value)} onBlur={() => persist(e, 'ordinat')} /> : fmtDate(row.date)}</td>
                      {ORDINAT_COLUMNS.map((c) => inp(c.key))}
                      {inp('prochie', 'left')}
                      {inp('otmetka', 'left')}
                      <td className="act no-print">{ed ? <button type="button" aria-label="O‘chirish" onClick={() => removeEntry(e, 'ordinat')}><Trash2 size={14} /></button> : <Lock size={13} />}</td>
                    </tr>
                  );
                })}
                {!ordinats.length && !loading && <tr><td colSpan={16} className="empty">O‘lchovlar yo‘q. “O‘lchov qo‘shish” tugmasini bosing.</td></tr>}
              </tbody>
            </table>
            <p className="pu29-foot">Me’yoriy ordinatalar namunaviy (eski jurnaldagi kabi) — loyiha hujjati bo‘yicha tekshiring.</p>
          </div>
        )}

        <div className="pu29-legend no-print">
          <span><i className="lv-g" /> me’yorda</span>
          <span><i className="lv-y" /> ogohlantirish</span>
          <span><i className="lv-r" /> xavfli</span>
          <span><Lock size={12} /> 3 soatdan keyin qulflanadi</span>
          <span>Sarlavhani bosing — me’yor ko‘rinadi</span>
        </div>

        {pop && <NormPopover id={pop.id} meta={meta} anchor={pop.anchor} onClose={() => setPop(null)} />}
      </div>
      {wizard && <MeasureWizard bolinma={bolinma} sw={sw} meta={meta} onClose={() => setWizard(false)} onSave={saveFromWizard} />}
    </div>
  );
}
