/**
 * Dispetcher uchun yig'ma: bo'linmalar holati, liniya belgilari, jami ko'rsatkichlar,
 * Telegram matni va Excel varaqlari. Sof funksiyalar (testlanadi).
 */
import { SECTIONS, SECTION_BY_KEY, rowsOf, rowFilled, reportProgress, num, DEADLINE, RAIL_HOT, RAIL_WARN } from './sections.js';
import { SEGMENTS, bolinmaLabel, bolinmaNum, parseKm } from './line.js';

export const STATUS = {
  accepted: { label: 'Qabul qilindi', short: 'Qabul qilindi', cls: 'go' },
  submitted: { label: 'Yangi, ko‘rib chiqing', short: 'Yangi', cls: 'new' },
  returned: { label: 'Qaytarildi', short: 'Qaytarildi', cls: 'wait' },
  missing: { label: 'Yubormagan', short: 'Yubormagan', cls: 'stop' },
};

const rows = (r, key) => (r && r.structuredData ? rowsOf(r.structuredData, SECTION_BY_KEY[key]).filter((x) => rowFilled(SECTION_BY_KEY[key], x)) : []);

/** Bitta hisobotdan asosiy raqamlar */
export function reportFacts(r) {
  const temps = rows(r, 'temp').map((t) => ({ ...t, v: num(t.rail) })).filter((t) => t.v !== null);
  const hottest = temps.reduce((a, t) => (!a || t.v > a.v ? t : a), null);
  const att = rows(r, 'attendance');
  return {
    warnings: rows(r, 'ogoh'),
    defects: rows(r, 'defekt'),
    windows: rows(r, 'oyna'),
    hottest,
    maxRail: hottest ? hottest.v : null,
    attTotal: att.reduce((s, x) => s + (num(x.total) || 0), 0),
    attFact: att.reduce((s, x) => s + (num(x.fact) || 0), 0),
    hasAtt: att.length > 0,
    progress: reportProgress(r && r.structuredData),
  };
}

/** "17:52" < "18:00" */
const afterDeadline = (now, deadline = DEADLINE) => now >= deadline;

/**
 * 10 bo'linma qatori (hisobot yubormaganlar ham).
 * @param reports serverdan (bolinma_id "3-bo'linma")
 * @param nowHHMM joriy vaqt (faqat bugun uchun; o'tgan kunlar uchun "23:59")
 */
export function boardRows(reports, nowHHMM = '23:59') {
  const byNum = new Map();
  for (const r of reports || []) {
    const n = bolinmaNum(r.bolinma_id);
    if (n) byNum.set(n, r);
  }
  const late = afterDeadline(nowHHMM);
  return SEGMENTS.map((seg) => {
    const r = byNum.get(seg.n) || null;
    const status = r ? (STATUS[r.status] ? r.status : 'submitted') : 'missing';
    return {
      n: seg.n,
      id: `${seg.n}-bo'linma`,
      label: bolinmaLabel(seg.n),
      boss: seg.boss,
      segment: seg,
      report: r,
      status,
      late: !r && late,
      facts: r ? reportFacts(r) : null,
    };
  });
}

export function counts(rowsList) {
  const c = { all: rowsList.length, submitted: 0, returned: 0, missing: 0, accepted: 0 };
  rowsList.forEach((r) => { c[r.status] += 1; });
  return c;
}

/** Liniyadagi belgilar: ogohlantirishlar (tezlik) va nuqsonlar, km bo'yicha */
export function lineMarks(rowsList) {
  const warns = []; const defects = [];
  rowsList.forEach((row) => {
    if (!row.facts) return;
    row.facts.warnings.forEach((w) => { const km = parseKm(w.km) ?? parseKm(w.station); if (km) warns.push({ km, speed: num(w.speed), n: row.n, row: w }); });
    row.facts.defects.forEach((d) => { const km = parseKm(d.loc) ?? parseKm(d.station); if (km) defects.push({ km, code: d.code, n: row.n, row: d }); });
  });
  return { warns, defects };
}

/** Liniya bo'yicha jami */
export function totals(rowsList) {
  let warnings = 0, defects = 0, attTotal = 0, attFact = 0, hottest = null, hottestN = null;
  rowsList.forEach((row) => {
    if (!row.facts) return;
    warnings += row.facts.warnings.length;
    defects += row.facts.defects.length;
    attTotal += row.facts.attTotal; attFact += row.facts.attFact;
    if (row.facts.hottest && (!hottest || row.facts.hottest.v > hottest.v)) { hottest = row.facts.hottest; hottestN = row.n; }
  });
  return { warnings, defects, attTotal, attFact, hottest, hottestN };
}

export const railClass = (v) => (v === null || v === undefined ? '' : v >= RAIL_HOT ? 'hot' : v >= RAIL_WARN ? 'warm' : '');

const ddmmyyyy = (iso) => { const [y, m, d] = String(iso).split('-'); return `${d}.${m}.${y}`; };

/** Telegram uchun qisqa matn */
export function telegramText(date, rowsList, nowHHMM) {
  const sent = rowsList.filter((r) => r.report);
  const missing = rowsList.filter((r) => !r.report).map((r) => r.n);
  const t = totals(rowsList);
  const lines = [];
  lines.push(`PCH-16, ${ddmmyyyy(date)}${nowHHMM ? `, ${nowHHMM} holati` : ''}`);
  lines.push(`Yubordi: ${sent.length}/${rowsList.length}${missing.length ? ` (yubormagan: ${missing.join(', ')}-bo‘linma)` : ''}`);
  const warns = rowsList.flatMap((r) => (r.facts ? r.facts.warnings.map((w) => `${w.km || w.station || '?'} ${w.speed ? `${w.speed} km/s` : ''}`.trim() + ` (${r.n}-bo‘l.)`) : []));
  lines.push(`Ogohlantirishlar: ${warns.length ? warns.join('; ') : 'yo‘q'}`);
  const defs = rowsList.flatMap((r) => (r.facts ? r.facts.defects.map((d) => `${d.loc || d.station || '?'}${d.code ? ` ${d.code}` : ''} (${r.n}-bo‘l.)`) : []));
  lines.push(`Nuqsonlar: ${defs.length ? `${defs.length} ta — ${defs.join('; ')}` : 'yo‘q'}`);
  if (t.hottest) lines.push(`Rels harorati maks: ${t.hottest.v}° ${t.hottest.info || ''}${t.hottest.time ? ` ${t.hottest.time}` : ''} (${t.hottestN}-bo‘l.)`.replace(/\s+/g, ' ').trim());
  if (t.attTotal) lines.push(`Davomat: ${t.attFact}/${t.attTotal}`);
  return lines.join('\n');
}

/** Yig'ma Excel varaqlari (pu29Xlsx.buildXlsx formatida) */
export function excelSheets(date, rowsList, XS) {
  const sheets = [];
  // 1. Umumiy holat
  const head = ['Bo‘linma', 'Boshliq', 'Holat', 'Yuborildi', 'Ogohl.', 'Nuqson', 'Rels maks, °C', 'Ishda / ro‘yxatda', 'To‘ldirilgan bo‘limlar'];
  const cells = [{ r: 0, c: 0, v: `PCH-16 kunlik hisobotlar, ${ddmmyyyy(date)}`, s: XS.title, cs: head.length }];
  head.forEach((h, c) => cells.push({ r: 2, c, v: h, s: XS.head }));
  rowsList.forEach((row, i) => {
    const f = row.facts;
    const st = STATUS[row.status];
    const vals = [row.label, row.boss, st.label, row.report ? row.report.time : '', f ? f.warnings.length : '', f ? f.defects.length : '',
      f && f.maxRail !== null ? f.maxRail : '', f && f.hasAtt ? `${f.attFact} / ${f.attTotal}` : '', f ? `${f.progress.filled} / ${f.progress.total}` : ''];
    const sCls = { go: XS.green, new: XS.cell, wait: XS.yellow, stop: XS.red }[st.cls];
    vals.forEach((v, c) => cells.push({ r: 3 + i, c, v, s: c === 2 ? sCls : c < 2 ? XS.left : (c === 6 && f && f.maxRail >= RAIL_HOT ? XS.red : XS.cell) }));
  });
  sheets.push({ name: 'Umumiy', cells, cols: [16, 16, 18, 11, 9, 9, 13, 16, 18], landscape: true });
  // 2. Har bir bo'lim — barcha bo'linmalar bitta jadvalda
  for (const s of SECTIONS) {
    const sc = [{ r: 0, c: 0, v: `${s.title}, ${ddmmyyyy(date)}`, s: XS.title, cs: s.cols.length + 1 }];
    sc.push({ r: 2, c: 0, v: 'Bo‘linma', s: XS.head });
    s.cols.forEach((c, i) => sc.push({ r: 2, c: i + 1, v: c.label, s: XS.head }));
    let r = 3;
    rowsList.forEach((row) => {
      if (!row.report) return;
      const list = rowsOf(row.report.structuredData, s).filter((x) => rowFilled(s, x));
      list.forEach((x) => {
        sc.push({ r, c: 0, v: row.label, s: XS.left });
        s.cols.forEach((c, i) => {
          const v = x[c.k] ?? '';
          const n = c.type === 'num' ? num(v) : null;
          sc.push({ r, c: i + 1, v: n !== null ? n : v, s: s.key === 'temp' && c.k === 'rail' && n >= RAIL_HOT ? XS.red : XS.cell });
        });
        r += 1;
      });
    });
    if (r === 3) sc.push({ r: 3, c: 0, v: 'Ma’lumot yo‘q', s: XS.left, cs: s.cols.length + 1 });
    sheets.push({ name: s.title, cells: sc, cols: [14, ...s.cols.map((c) => Math.max(9, Math.round((c.w || 160) / 8)))], landscape: true });
  }
  return sheets;
}
