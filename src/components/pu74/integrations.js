/**
 * PU-74 jurnali betlarini dasturdagi boshqa bo'limlar ma'lumotlari bilan to'ldirish.
 *
 * Har bir manba (provider):
 *   - qaysi betlarga tegishli (sheets)
 *   - qanday ma'lumot kerak (needs) — fetchNeeds() orqali API'dan olinadi
 *   - build(ctx, data) -> { changes: [{si, r, c, value, label, old}], notes: [string] }
 *
 * build() toza funksiya: hech narsani o'zgartirmaydi, faqat taklif qiladi.
 * Foydalanuvchi ro'yxatni ko'rib, "Qo'llash" bosgandagina jurnalga yoziladi.
 */
import { cellKey, editKey, toNumber, formatValue } from './journalModel.js';

// Varaqlar tartibi (pu74Template.json)
export const SHEET = { cover: 0, tabel: 1, plan1: 2, plan2: 3, mech1: 4, mech2: 5, walkers: 6, mat1: 7, mat2: 8, cond1: 9, cond2: 10 };

const RU_MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

// ---------------------------------------------------------------------------
// Yordamchilar
// ---------------------------------------------------------------------------
const val = (views, si, r, c) => {
  const cell = views[si] && views[si].cells[cellKey(r, c)];
  return cell ? cell.v : null;
};
const num = (v) => toNumber(v) || 0;
const names = (list) => list.map((e) => shortName(e.full_name).replace(/\.$/, '')).join(', ');
const text = (v) => (v === null || v === undefined ? '' : String(v).trim());

/** Lotin/kirill harflarini bir xil ko'rinishga keltirish (ism va mexanizm nomlarini solishtirish uchun) */
const LAT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
export function normName(s) {
  return text(s).toLowerCase()
    .replace(/[ʻʼ'‘’`]/g, '')
    .replace(/[а-яёўқғҳ]/g, (ch) => LAT[ch] ?? ch)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Nazarov S" va "Nazarov Sardor Akmalovich" — familiya va ism bosh harfi bo'yicha */
export function sameperson(a, b) {
  const x = normName(a).split(' ');
  const y = normName(b).split(' ');
  if (!x[0] || !y[0] || x[0] !== y[0]) return false;
  if (x[1] && y[1]) return x[1][0] === y[1][0];
  return true;
}

/** "Nazarov Sardor Akmalovich" -> "Nazarov S." */
export function shortName(full) {
  const p = text(full).split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[1][0]}.` : p[0] || '';
}

/** Matndagi pastki chiziqlarni (____) navbat bilan qiymatlar bilan to'ldirish */
export function fillBlanks(template, values) {
  let i = 0;
  return text(template) ? String(template).replace(/_{3,}/g, (m) => {
    if (i >= values.length) return m;
    const v = values[i++];
    return v === null || v === undefined || v === '' ? m : ` ${v} `;
  }).replace(/\s{2,}/g, ' ') : template;
}

export function parseDate(s) {
  const t = text(s);
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(t);
  if (m) return { y: +m[3], m: +m[2], d: +m[1] };
  return null;
}

/** Kun [boshi; oxiri] oralig'idami (sanalar "YYYY-MM-DD" yoki "DD.MM.YYYY") */
function inRange(y, m, d, from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!a || !b) return false;
  const k = (x) => x.y * 10000 + x.m * 100 + x.d;
  const t = y * 10000 + m * 100 + d;
  return t >= k(a) && t <= k(b);
}

const daysInMonth = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

/** Tabeldagi belgini PU-74 soatiga aylantirish */
export function timesheetValue(v, shiftHours = 8) {
  const t = text(v);
  if (!t) return '';
  const n = toNumber(t);
  if (n !== null) return n;
  if (t.toUpperCase() === 'Я') return shiftHours;
  if (t.toUpperCase() === 'В') return '';
  return t; // Б (kasallik), О (ta'til), К (safar), НН ... — belgi o'zi yoziladi
}

/** Varaq sarlavhasidagi kun ustunlari bloklari (11/12-betda ikkita blok bor) */
function dayBlocks(view) {
  const { tpl, cells } = view;
  for (let r = 0; r < Math.min(12, tpl.rows.length); r++) {
    const blocks = [];
    let run = [];
    for (let c = 0; c <= tpl.cols.length; c++) {
      const n = c < tpl.cols.length ? toNumber(cells[cellKey(r, c)] && cells[cellKey(r, c)].v) : null;
      const prev = run[run.length - 1];
      if (n !== null && Number.isInteger(n) && n >= 1 && n <= 31 && (!prev || n === prev.n + 1)) run.push({ c, n });
      else {
        if (run.length >= 10) blocks.push(run);
        run = n !== null && (n === 1 || n === 16) ? [{ c, n }] : [];
      }
    }
    if (blocks.length) return blocks.map((b) => new Map(b.map(({ c, n }) => [n, c])));
  }
  return [];
}

/** Jadval qatorlari: sarlavhadan keyin, berilgan ustunda chegarali katak bor qatorlar */
function gridRows(view, styles, col) {
  const out = [];
  const start = Math.max(view.analysis.headerBottom, view.analysis.headerTop) + 1;
  for (let r = start; r < view.tpl.rows.length; r++) {
    const st = styles[view.tpl.styles[cellKey(r, col)]];
    if (st && st.bd && st.bd.some(Boolean)) out.push(r);
    else if (out.length) break;
  }
  return out;
}

const findRow = (view, col, re, from = 0) => {
  for (let r = from; r < view.tpl.rows.length; r++) if (re.test(text(view.cells[cellKey(r, col)] && view.cells[cellKey(r, col)].v))) return r;
  return -1;
};

function makeCollector(views) {
  const changes = [];
  const seen = new Set();
  return {
    changes,
    set(si, r, c, value, label) {
      const k = editKey(si, r, c);
      if (seen.has(k)) return;
      const old = val(views, si, r, c);
      const same = (old === null || old === undefined || old === '') ? (value === '' || value === null) : formatValue(old, { blankZero: false }) === formatValue(value, { blankZero: false });
      if (same) return;
      seen.add(k);
      changes.push({ si, r, c, value, old, label });
    },
  };
}

// ---------------------------------------------------------------------------
// Manbalar
// ---------------------------------------------------------------------------

/** 1-bet: muqovadagi natijalar jurnalning o'zidan hisoblanadi */
function buildCover(ctx) {
  const { views, month } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const [y, m] = month.split('-').map(Number);
  const tabel = views[SHEET.tabel];
  const plan = [views[SHEET.plan1], views[SHEET.plan2]];

  // tabel: ro'yxatdagi va haqiqatda ishlagan xodimlar, jami soat (S ustuni = har bir xodim jami)
  let listed = 0;
  let worked = 0;
  let tabelHours = 0;
  for (const g of tabel.analysis.groups) {
    if (!text(val(views, SHEET.tabel, g.start, 1))) continue;
    listed++;
    const h = num(val(views, SHEET.tabel, g.start, 18));
    if (h > 0) worked++;
    tabelHours += h;
  }

  // 4-7 betlar: haqiqiy (AA), normalangan (AB) soatlar va topshiriq (J)
  let fact = 0;
  let normed = 0;
  let task = 0;
  plan.forEach((v, i) => {
    const tr = v.analysis.totalRow;
    if (tr < 0) return;
    fact += num(val(views, SHEET.plan1 + i, tr, 26));
    normed += num(val(views, SHEET.plan1 + i, tr, 27));
    task += num(val(views, SHEET.plan1 + i, tr, 9));
  });
  const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '');
  const r1 = (x) => Math.round(x * 10) / 10;

  const cover = views[SHEET.cover];
  const line = (re, values, label) => {
    for (let r = 0; r < cover.tpl.rows.length; r++) {
      for (let c = 0; c < cover.tpl.cols.length; c++) {
        const t = text(val(views, SHEET.cover, r, c));
        if (re.test(t)) {
          const orig = ctx.original(SHEET.cover, r, c);
          out.set(SHEET.cover, r, c, fillBlanks(orig != null && orig !== '' ? orig : t, values), label);
          return;
        }
      }
    }
  };
  // oy: "участка на ___декабр___ м-ц 2025 г." — oy va yilni almashtiramiz
  for (let r = 0; r < cover.tpl.rows.length; r++) {
    for (let c = 0; c < cover.tpl.cols.length; c++) {
      const orig = text(ctx.original(SHEET.cover, r, c));
      if (/м-ц/.test(orig)) {
        const s = orig.replace(/на\s*_*\s*[а-яё]*\s*_*\s*м-ц\s*\d{4}/i, `на ${RU_MONTHS[m - 1]} м-ц ${y}`);
        out.set(SHEET.cover, r, c, s, 'Oy va yil');
      }
    }
  }
  line(/Контингент:\s*расчетный/i, [listed || '', r1(tabelHours) || ''], 'Kontingent (hisobiy) va tabel soatlari');
  line(/фактический/i, [worked || '', r1(fact) || ''], 'Kontingent (haqiqiy) va ishlangan kishi-soat');
  line(/Выполнение задания/i, [r1(normed) || ''], 'Bajarilgan ish, normalangan kishi-soat');
  line(/выполнения наряд/i, [pct(normed, task)], 'Topshiriq bajarilishi');
  line(/нормы выработки/i, [pct(normed, fact)], 'Norma bajarilishi');

  if (!fact) notes.push('4–7 betlarda hali ishlangan soat yo‘q — foizlar keyin hisoblanadi.');
  if (tabelHours && fact && Math.abs(tabelHours - fact) > 0.5) {
    notes.push(`Tabel bo‘yicha ${r1(tabelHours)} soat, 4–7 betlarda ${r1(fact)} soat — farq ${r1(tabelHours - fact)} soat.`);
  }
  return { changes: out.changes, notes };
}

/** 2–3 bet: xodimlar (HR) va tabel soatlari */
function buildTabel(ctx, data) {
  const { views, month } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const view = views[SHEET.tabel];
  const employees = (data.employees || []).filter((e) => (e.status || 'active') === 'active');
  const sheetData = data.timesheet || {};
  const dim = daysInMonth(month);
  const [y, m] = month.split('-').map(Number);
  const groups = view.analysis.groups.filter((g) => g.end === g.start + 1);
  if (!groups.length) return { changes: [], notes: ['Tabel betining tuzilishi tanilmadi'] };

  const hasHours = (e) => Object.keys(sheetData).some((k) => k.startsWith(`${e.id}_`) && text(sheetData[k]));
  const rowsWithNames = groups.filter((g) => text(val(views, SHEET.tabel, g.start, 1)));
  let assignments = [];
  if (rowsWithNames.length) {
    const used = new Set();
    const unknown = [];
    for (const g of rowsWithNames) {
      const name = val(views, SHEET.tabel, g.start, 1);
      const emp = employees.find((e) => !used.has(e.id) && sameperson(name, e.full_name));
      if (emp) { used.add(emp.id); assignments.push({ g, emp, keepName: true }); }
      else unknown.push(text(name));
    }
    if (unknown.length) notes.push(`HR ro‘yxatida topilmadi (soatlari o‘zgarmaydi, qo‘lda tekshiring): ${unknown.join(', ')}.`);
    const extra = employees.filter((e) => !used.has(e.id) && hasHours(e));
    if (extra.length) notes.push(`Tabelda soati bor, lekin jurnalda yo‘q: ${names(extra)}.`);
  } else {
    const list = [...employees].sort((a, b) => text(a.full_name).localeCompare(text(b.full_name)));
    const withHours = list.filter(hasHours);
    const chosen = (withHours.length ? withHours : list).slice(0, groups.length);
    assignments = chosen.map((emp, i) => ({ g: groups[i], emp, keepName: false }));
    if ((withHours.length || list.length) > groups.length) notes.push(`Jurnalda ${groups.length} ta joy bor, qolgan xodimlar sig‘madi.`);
  }
  if (!employees.length) notes.push('Bo‘linmada faol xodim topilmadi (HR bo‘limi).');

  for (const { g, emp, keepName } of assignments) {
    const who = shortName(emp.full_name);
    if (!keepName) out.set(SHEET.tabel, g.start, 1, who, `${who}: F.I.O`);
    if (text(emp.tabel_number)) out.set(SHEET.tabel, g.start, 19, toNumber(emp.tabel_number) ?? text(emp.tabel_number), `${who}: tabel raqami`);
    const rank = toNumber(String(emp.rank || '').replace(/\D+/g, ''));
    if (rank) out.set(SHEET.tabel, g.start, 20, rank, `${who}: razryad`);
    for (let day = 1; day <= 31; day++) {
      const r = day <= 15 ? g.start : g.end;
      const c = day <= 15 ? day + 1 : day - 14;
      const key = `${emp.id}_${day}`;
      const onLeave = inRange(y, m, day, emp.vacation_start_date, emp.vacation_end_date);
      // HR tabelida yo'q kun — jurnaldagi qiymat o'zgarmaydi (tabel hali to'liq kiritilmagan bo'lishi mumkin),
      // faqat HR'da ta'til sanalari bo'lsa "О" qo'yiladi
      if (day <= dim && !(key in sheetData) && !onLeave) continue;
      const v = day > dim ? '' : (key in sheetData ? timesheetValue(sheetData[key]) : 'О');
      out.set(SHEET.tabel, r, c, v, `${who}: ${day}-kun`);
    }
  }
  if (!Object.keys(sheetData).length) notes.push(`HR tabelida ${month} oyi uchun ma’lumot yo‘q.`);
  return { changes: out.changes, notes };
}

const DEFECT_RULES = [
  { re: /ширин|колеи|колея|kenglig|gabarit/i, row: /ширины рельсовой колеи/i },
  { re: /просад|перекос|cho.?k|o.?tir/i, row: /просадок/i },
  { re: /уровн|сатх|sath|balandlik/i, row: /по уровню/i },
  { re: /рихт|рыхт|направ|egrilik|rixtov/i, row: /рыхтовка|рихтовка/i },
  { re: /изол|izost|стык/i, row: /изолирующих/i },
  { re: /шпал|shpal/i, row: /железобетонных шпал/i },
  { re: /гайк|болт|клемм|bolt|gayka/i, row: /Подтягивание гаек/i },
  { re: /стрел|strelk/i, row: /стрелочн/i },
  { re: /рельс|rels|излом|трещ|darz|sinish/i, row: /Смена рельсов.*раздельном/i },
];

const kmText = (d) => `${d.km} km${d.pk !== null && d.pk !== undefined && d.pk !== '' ? ` pk ${d.pk}` : ''}`;

/** 4–7 betlar: faol nosozliklar tegishli ish qatorining "Место работы" ustuniga */
function buildDefects(ctx, data) {
  const { views } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const defects = (data.defects || []).filter((d) => (d.status || 'active') === 'active' && d.km !== null && d.km !== undefined && d.km !== '');
  if (!defects.length) return { changes: [], notes: ['Bo‘linmada faol nosozlik yo‘q (Defektlar bo‘limi).'] };
  const view = views[SHEET.plan1];
  const byRow = new Map();
  const unmatched = [];
  for (const d of defects) {
    const what = `${text(d.issue)} ${text(d.description)}`;
    const rule = DEFECT_RULES.find((x) => x.re.test(what));
    const r = rule ? view.analysis.groups.map((g) => g.start).find((gr) => rule.row.test(text(val(views, SHEET.plan1, gr, 2)))) : undefined;
    if (r === undefined) { unmatched.push(d); continue; }
    if (!byRow.has(r)) byRow.set(r, []);
    byRow.get(r).push(d);
  }
  for (const [r, list] of byRow) {
    for (const si of [SHEET.plan1, SHEET.plan2]) {
      const cur = text(val(views, si, r, 1));
      const add = list.map(kmText).filter((t) => !normName(cur).includes(normName(t)));
      if (!add.length) continue;
      const next = cur ? `${cur}, ${add.join(', ')}` : add.join(', ');
      out.set(si, r, 1, next, `${text(val(views, SHEET.plan1, r, 2)).slice(0, 48)}: joy`);
    }
  }
  if (unmatched.length) {
    notes.push(`Ish turiga mos kelmagan nosozliklar (qo‘lda kiriting): ${unmatched.map((d) => `${kmText(d)} — ${text(d.issue) || text(d.description)}`).join('; ')}.`);
  }
  const severe = defects.filter((d) => num(d.degree) >= 4);
  if (severe.length) notes.push(`${severe.length} ta 4-darajali nosozlik — "Неотложные работы" sifatida birinchi navbatda.`);
  return { changes: out.changes, notes };
}

/** 8–9 betlar: mexanizmlar soni Mexanika bo'limidan */
function buildMechanics(ctx, data) {
  const { views } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const vehicles = data.vehicles || [];
  if (!vehicles.length) return { changes: [], notes: ['Mexanika bo‘limida bo‘linma texnikasi yo‘q.'] };
  const missing = new Set();
  const notActive = new Set();
  for (const si of [SHEET.mech1, SHEET.mech2]) {
    const v = views[si];
    const rows = gridRows(v, ctx.styles, 3).filter((r) => text(val(views, si, r, 3)));
    for (const r of rows) {
      const g = { start: r };
      const mech = text(val(views, si, g.start, 3));
      const tokens = mech.split(/[/,;]+/).map(normName).filter(Boolean);
      const match = vehicles.filter((x) => tokens.some((t) => normName(x.name).includes(t) || normName(`${x.name} ${x.number || ''}`).includes(t)));
      const active = match.filter((x) => (x.status || 'active') === 'active');
      match.filter((x) => (x.status || 'active') !== 'active').forEach((x) => notActive.add(`${x.name}${x.number ? ` (${x.number})` : ''} — ${x.status}`));
      if (!match.length) { missing.add(mech); continue; }
      out.set(si, g.start, 4, active.length, `${mech}: soni`);
    }
  }
  if (missing.size) notes.push(`Mexanika bo‘limida topilmadi: ${[...missing].join(', ')}.`);
  if (notActive.size) notes.push(`Ishlamayotgan texnika: ${[...notActive].join('; ')}.`);
  return { changes: out.changes, notes };
}

/** 10-bet: yo'l obxodchiklari HR'dan, uchastkasidagi nosozliklar */
function buildWalkers(ctx, data) {
  const { views } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const v = views[SHEET.walkers];
  const walkers = (data.employees || []).filter((e) => (e.status || 'active') === 'active' && /обход|obxod|obhod|aylanuv/i.test(`${e.position || ''}`));
  const rows = gridRows(v, ctx.styles, 2);
  const used = new Set();
  const present = rows.map((r) => text(val(views, SHEET.walkers, r, 2))).filter(Boolean);
  present.forEach((n) => { const e = walkers.find((w) => sameperson(n, w.full_name)); if (e) used.add(e.id); });
  const free = rows.filter((r) => !text(val(views, SHEET.walkers, r, 2)));
  const toAdd = walkers.filter((w) => !used.has(w.id));
  toAdd.slice(0, free.length).forEach((w, i) => out.set(SHEET.walkers, free[i], 2, shortName(w.full_name), `${rows.indexOf(free[i]) + 1}-qator: obxodchi`));
  if (!walkers.length) notes.push('HR bo‘limida lavozimi “обходчик” bo‘lgan xodim topilmadi.');
  if (toAdd.length > free.length) notes.push(`Joy yetmadi: ${names(toAdd.slice(free.length))}.`);

  const defects = (data.defects || []).filter((d) => (d.status || 'active') === 'active');
  for (const r of rows) {
    const name = text(val(views, SHEET.walkers, r, 2));
    const m = /(\d{3,5})\s*[-–]\s*(\d{3,5})/.exec(text(val(views, SHEET.walkers, r, 3)));
    if (!name || !m) continue;
    const [a, b] = [+m[1], +m[2]].sort((x, y) => x - y);
    const inSection = defects.filter((d) => num(d.km) >= a && num(d.km) <= b);
    if (inSection.length) notes.push(`${name} (${a}–${b} km): uchastkada ${inSection.length} ta faol nosozlik — bahoni shunga qarab qo‘ying.`);
  }
  return { changes: out.changes, notes };
}

/** 11–12 betlar: izostiklar almashtirilishi (Izostiklar bo'limi tarixidan) */
function buildMaterials(ctx, data) {
  const { views, month } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const [y, m] = month.split('-').map(Number);
  const perDay = new Map();
  for (const item of data.izostiklar || []) {
    const dates = new Set();
    for (const h of Array.isArray(item.history) ? item.history : []) {
      if (h && /rebuilt|almasht|qayta|замен/i.test(String(h.action || 'rebuilt'))) dates.add(String(h.date || ''));
    }
    if (!dates.size && item.last_date) dates.add(String(item.last_date));
    for (const s of dates) {
      const d = parseDate(s);
      if (d && d.y === y && d.m === m) perDay.set(d.d, (perDay.get(d.d) || 0) + 1);
    }
  }
  const total = [...perDay.values()].reduce((a, b) => a + b, 0);
  for (const si of [SHEET.mat1, SHEET.mat2]) {
    const v = views[si];
    const blocks = dayBlocks(v);
    if (blocks.length < 2) continue;
    const [removed, laid] = blocks;
    const r = findRow(v, 2, /Изол/i);
    if (r < 0) continue;
    for (const [day, c] of laid) out.set(si, r, c, perDay.get(day) || '', `Izostik (yangi) yotqizildi: ${day}-kun`);
    for (const [day, c] of removed) out.set(si, r + 1, c, perDay.get(day) || '', `Izostik (eski) olindi: ${day}-kun`);
  }
  notes.push(total
    ? `${month} oyida ${total} ta izostik almashtirilgan (Izostiklar bo‘limi).`
    : `${month} oyida izostik almashtirilmagan (Izostiklar bo‘limi).`);

  const plets = (data.plets || []).filter((p) => { const d = parseDate(p.install_date); return d && d.y === y && d.m === m; });
  if (plets.length) notes.push(`Shu oyda yotqizilgan pletlar: ${plets.map((p) => `№${p.plet_number} (${p.start_km}–${p.end_km} km, ${p.length || '?'} m)`).join('; ')} — rels qatoriga qo‘lda kiriting.`);
  return { changes: out.changes, notes };
}

const COND_RULES = [
  { row: /остродефектных рельсов/i, test: (d) => /рельс|rels/i.test(`${d.issue} ${d.description}`) && num(d.degree) >= 3 },
  { row: /негодных шпал/i, test: (d) => /шпал|shpal/i.test(`${d.issue} ${d.description}`) },
  { row: /разгонки зазоров/i, test: (d) => /зазор|zazor|stik|стык/i.test(`${d.issue} ${d.description}`) },
  { row: /водоотвод/i, test: (d) => /водоотв|кювет|zovur|ariq|suv/i.test(`${d.issue} ${d.description}`) },
];

/** 13–14 betlar: yo'l holati — nosozliklar kilometrlar bo'yicha */
function buildCondition(ctx, data) {
  const { views } = ctx;
  const out = makeCollector(views);
  const notes = [];
  const defects = (data.defects || []).filter((d) => (d.status || 'active') === 'active');
  for (const si of [SHEET.cond1, SHEET.cond2]) {
    const v = views[si];
    // km sarlavhasi: ketma-ket 3-5 xonali sonlar qatori
    let kmRow = -1;
    const kmCol = new Map();
    for (let r = 0; r < v.tpl.rows.length && kmRow < 0; r++) {
      const found = [];
      for (let c = 0; c < v.tpl.cols.length; c++) {
        const n = toNumber(val(views, si, r, c));
        if (n && n >= 100 && n <= 99999 && Number.isInteger(n)) found.push([n, c]);
      }
      if (found.length >= 3) { kmRow = r; found.forEach(([n, c]) => kmCol.set(n, c)); }
    }
    if (kmRow < 0) continue;
    for (const rule of COND_RULES) {
      const r = findRow(v, 2, rule.row, kmRow + 1);
      if (r < 0) continue;
      for (const [km, c] of kmCol) {
        const n = defects.filter((d) => num(d.km) === km && rule.test(d)).length;
        out.set(si, r, c, n || '', `${text(val(views, si, r, 2)).slice(0, 40)}: ${km} km`);
      }
    }
    if (si === SHEET.cond1) {
      const outside = defects.filter((d) => !kmCol.has(num(d.km)));
      if (outside.length) notes.push(`${outside.length} ta nosozlik jadvaldagi kilometrlardan tashqarida.`);
    }
  }
  if (!defects.length) notes.push('Faol nosozlik yo‘q — ko‘rsatkichlar bo‘sh qoladi.');
  notes.push('Yo‘l o‘lchash vagoni ballari dasturda hali yo‘q — 1–3 qatorlar qo‘lda to‘ldiriladi.');
  return { changes: out.changes, notes };
}

export const PROVIDERS = [
  { id: 'cover', title: '1-bet: natijalar', from: 'Jurnalning o‘zidan (2–7 betlar)', sheets: [SHEET.cover], needs: [], build: buildCover },
  { id: 'tabel', title: '2–3 bet: xodimlar va tabel', from: 'HR: xodimlar, tabel', sheets: [SHEET.tabel], needs: ['employees', 'timesheet'], build: buildTabel },
  { id: 'defects', title: '4–7 bet: nosozliklar joyi', from: 'Defektlar', sheets: [SHEET.plan1, SHEET.plan2], needs: ['defects'], build: buildDefects },
  { id: 'mechanics', title: '8–9 bet: mexanizmlar', from: 'Mexanika', sheets: [SHEET.mech1, SHEET.mech2], needs: ['vehicles'], build: buildMechanics },
  { id: 'walkers', title: '10-bet: obxodchiklar', from: 'HR, Defektlar', sheets: [SHEET.walkers], needs: ['employees', 'defects'], build: buildWalkers },
  { id: 'materials', title: '11–12 bet: materiallar', from: 'Izostiklar, Pletlar', sheets: [SHEET.mat1, SHEET.mat2], needs: ['izostiklar', 'plets'], build: buildMaterials },
  { id: 'condition', title: '13–14 bet: yo‘l holati', from: 'Defektlar', sheets: [SHEET.cond1, SHEET.cond2], needs: ['defects'], build: buildCondition },
];

/**
 * Kerakli ma'lumotlarni API'dan olish.
 * @param {string[]} needs
 * @param {{bolinmaId: string, month: string}} ctx
 * @param {{get: Function}} api
 */
export async function fetchNeeds(needs, { bolinmaId, month }, api) {
  const [y, m] = month.split('-').map(Number);
  const b = encodeURIComponent(bolinmaId);
  const loaders = {
    employees: () => api.get(`/api/hr/employees?bolinma_id=${b}`),
    timesheet: () => api.get(`/api/timesheet/${y}/${m}?bolinma_id=${b}`),
    defects: () => api.get(`/api/defects/${b}`),
    vehicles: () => api.get(`/api/mechanics/vehicles?bolinma_id=${b}`),
    izostiklar: () => api.get(`/api/izostiklar/${b}`),
    plets: () => api.get(`/api/plets/${b}`),
  };
  const data = {};
  const errors = [];
  await Promise.all([...new Set(needs)].map(async (n) => {
    try {
      const r = await loaders[n]();
      data[n] = Array.isArray(r) ? r : r && Array.isArray(r.data) ? r.data : r && Array.isArray(r.rows) ? r.rows : r;
    } catch (e) {
      errors.push(`${n}: ${e.message || 'xatolik'}`);
      data[n] = n === 'timesheet' ? {} : [];
    }
  }));
  return { data, errors };
}
