/**
 * PU-74 jurnali modeli.
 *
 * - Brigada Excel faylidan (SheetJS) qiymat va formulalarni o'qiydi
 * - Foydalanuvchi tahrirlarini qo'llaydi (eski versiya bilan bir xil kalit: "varaq_qator_ustun")
 * - Formulalarni qayta hisoblaydi (SUM, + - * /, boshqa varaqqa havola)
 * - Har bir varaqning tuzilishini aniqlaydi: kun ustunlari, ish qatorlari juftligi,
 *   "жами" va "проверит" qatorlari, ikki betli varaqning bo'linish chizig'i
 *
 * Bu fayl React'ga bog'liq emas — alohida test qilinadi.
 */

export const cellKey = (r, c) => `${r},${c}`;
export const editKey = (si, r, c) => `${si}_${r}_${c}`;

// ---------------------------------------------------------------------------
// Excel manzillari
// ---------------------------------------------------------------------------
export function colIndex(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function decodeRef(ref) {
  const m = /^\$?([A-Z]{1,3})\$?(\d+)$/i.exec(ref.trim());
  if (!m) return null;
  return { r: parseInt(m[2], 10) - 1, c: colIndex(m[1]) };
}

// ---------------------------------------------------------------------------
// Qiymatlar
// ---------------------------------------------------------------------------
export function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null;
  return parseFloat(s);
}

/** Ekranda ko'rsatish: 0 -> bo'sh, kasrlar yaxlitlanadi, vergul bilan. */
export function formatValue(v, { blankZero = true } = {}) {
  if (v === null || v === undefined) return '';
  const n = typeof v === 'number' ? v : (typeof v === 'string' && /^\s*-?\d+([.,]\d+)?\s*$/.test(v) ? toNumber(v) : null);
  if (n === null) {
    const s = String(v);
    return s === 'None' ? '' : s.replace(/\s+$/, '');
  }
  if (blankZero && Math.abs(n) < 1e-9) return '';
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  const digits = Math.abs(n) >= 10 ? 1 : Math.abs(n) >= 1 ? 2 : 3;
  return n.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}

// ---------------------------------------------------------------------------
// Workbook -> model
// ---------------------------------------------------------------------------

/**
 * SheetJS workbook'ini neytral modelga aylantiradi.
 * @returns {{sheets: {name: string, cells: Object<string, {v:any, f?:string}>}[]}}
 */
export function fromSheetJS(XLSX, wb) {
  return {
    sheets: wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const cells = {};
      if (ws && ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let r = range.s.r; r <= range.e.r; r++) {
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (!cell) continue;
            const e = { v: cell.v === undefined ? null : cell.v };
            if (cell.f) e.f = String(cell.f);
            if (e.v === null && !e.f) continue;
            cells[cellKey(r, c)] = e;
          }
        }
      }
      return { name, cells };
    }),
  };
}

// ---------------------------------------------------------------------------
// Formulalar
// ---------------------------------------------------------------------------

const TOKEN_RE = /\s*(?:('(?:[^']|'')+'|[A-Za-z_Ѐ-ӿ][\wЀ-ӿ.\- ]*?)!)?(\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?)|\s*(\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)|\s*([A-Z]+)\s*\(|\s*([-+*/^(),;%])/y;

function tokenize(src) {
  const tokens = [];
  TOKEN_RE.lastIndex = 0;
  let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    TOKEN_RE.lastIndex = pos;
    const m = TOKEN_RE.exec(src);
    if (!m) throw new Error(`Formulani tushunib bo'lmadi: ${src}`);
    pos = TOKEN_RE.lastIndex;
    if (m[2]) {
      let sheet = m[1] || null;
      if (sheet && sheet.startsWith("'")) sheet = sheet.slice(1, -1).replace(/''/g, "'");
      tokens.push({ t: 'ref', sheet, ref: m[2] });
    } else if (m[3]) tokens.push({ t: 'num', v: parseFloat(m[3]) });
    else if (m[4]) tokens.push({ t: 'fn', name: m[4].toUpperCase() });
    else tokens.push({ t: 'op', v: m[5] });
  }
  return tokens;
}

/**
 * Hisoblovchi. getCell(sheetIndex, r, c) -> son.
 * Qo'llab-quvvatlanadi: + - * / ^ %, qavslar, SUM/MIN/MAX/AVERAGE/ROUND/ABS, oraliqlar.
 */
function evaluateFormula(src, si, ctx) {
  const tokens = tokenize(src);
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];

  const sheetIdx = (name) => {
    if (!name) return si;
    const idx = ctx.sheetIndexByName(name);
    if (idx < 0) throw new Error(`Varaq topilmadi: ${name}`);
    return idx;
  };

  const refValues = (tok) => {
    const s = sheetIdx(tok.sheet);
    const [a, b] = tok.ref.split(':');
    const p = decodeRef(a);
    const q = b ? decodeRef(b) : p;
    const out = [];
    for (let r = Math.min(p.r, q.r); r <= Math.max(p.r, q.r); r++) {
      for (let c = Math.min(p.c, q.c); c <= Math.max(p.c, q.c); c++) out.push(ctx.getCell(s, r, c));
    }
    return out;
  };

  function args() {
    const list = [];
    if (peek() && peek().t === 'op' && peek().v === ')') { take(); return list; }
    for (;;) {
      const tok = peek();
      if (tok && tok.t === 'ref' && tok.ref.includes(':')) {
        const next = tokens[i + 1];
        if (next && next.t === 'op' && (next.v === ',' || next.v === ';' || next.v === ')')) {
          take();
          list.push(refValues(tok));
        } else list.push([expr()]);
      } else list.push([expr()]);
      const sep = take();
      if (!sep || sep.t !== 'op') throw new Error('Formula tugallanmagan');
      if (sep.v === ')') return list;
      if (sep.v !== ',' && sep.v !== ';') throw new Error('Kutilmagan belgi');
    }
  }

  function primary() {
    const tok = take();
    if (!tok) throw new Error('Formula tugallanmagan');
    if (tok.t === 'num') return tok.v;
    if (tok.t === 'ref') {
      if (tok.ref.includes(':')) return refValues(tok).reduce((a, b) => a + b, 0);
      return refValues(tok)[0];
    }
    if (tok.t === 'fn') {
      const vals = args().flat().map((x) => (Number.isFinite(x) ? x : 0));
      switch (tok.name) {
        case 'SUM': return vals.reduce((a, b) => a + b, 0);
        case 'MIN': return vals.length ? Math.min(...vals) : 0;
        case 'MAX': return vals.length ? Math.max(...vals) : 0;
        case 'AVERAGE': return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        case 'ABS': return Math.abs(vals[0] || 0);
        case 'ROUND': { const d = vals[1] || 0; const k = 10 ** d; return Math.round((vals[0] || 0) * k) / k; }
        default: throw new Error(`Funksiya qo'llab-quvvatlanmaydi: ${tok.name}`);
      }
    }
    if (tok.t === 'op' && tok.v === '(') {
      const v = expr();
      const close = take();
      if (!close || close.v !== ')') throw new Error('Qavs yopilmagan');
      return v;
    }
    if (tok.t === 'op' && (tok.v === '-' || tok.v === '+')) {
      const v = unary();
      return tok.v === '-' ? -v : v;
    }
    throw new Error(`Kutilmagan belgi: ${tok.v}`);
  }
  function unary() {
    let v = primary();
    while (peek() && peek().t === 'op' && peek().v === '%') { take(); v /= 100; }
    return v;
  }
  function power() {
    let v = unary();
    while (peek() && peek().t === 'op' && peek().v === '^') { take(); v **= unary(); }
    return v;
  }
  function term() {
    let v = power();
    while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
      const op = take().v;
      const rhs = power();
      if (op === '*') v *= rhs;
      else v = rhs === 0 ? 0 : v / rhs; // Excel #DIV/0! o'rniga 0
    }
    return v;
  }
  function expr() {
    let v = term();
    while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = take().v;
      const rhs = term();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  const result = expr();
  if (i < tokens.length) throw new Error(`Ortiqcha belgi: ${src}`);
  return Number.isFinite(result) ? result : 0;
}

/**
 * Tahrirlarni qo'llab, barcha formulalarni qayta hisoblaydi.
 * Qo'lda tahrirlangan formula katagi qayta hisoblanmaydi (eski versiyadagidek).
 * @returns {{sheets: {name, cells}[], errors: string[]}}
 */
export function computeWorkbook(model, edits = {}) {
  const sheets = model.sheets.map((s) => ({ name: s.name, cells: { ...s.cells } }));
  const byName = new Map(sheets.map((s, i) => [s.name.trim(), i]));
  const errors = [];

  for (const [k, raw] of Object.entries(edits || {})) {
    const m = /^(\d+)_(\d+)_(\d+)$/.exec(k);
    if (!m) continue;
    const [si, r, c] = [+m[1], +m[2], +m[3]];
    if (!sheets[si]) continue;
    const prev = sheets[si].cells[cellKey(r, c)] || {};
    const n = toNumber(raw);
    sheets[si].cells[cellKey(r, c)] = { ...prev, v: n === null ? raw : n, f: undefined, edited: true, original: prev.v, originalF: prev.f };
  }

  const state = new Map(); // "si|r,c" -> 1 hisoblanmoqda, 2 tayyor
  const ctx = {
    sheetIndexByName: (name) => {
      const idx = byName.get(name.trim());
      return idx === undefined ? -1 : idx;
    },
    getCell(si, r, c) {
      const sheet = sheets[si];
      if (!sheet) return 0;
      const key = cellKey(r, c);
      const cell = sheet.cells[key];
      if (!cell) return 0;
      if (cell.f) {
        const sk = `${si}|${key}`;
        const st = state.get(sk);
        if (st === 1) { errors.push(`Aylanma havola: ${sheet.name} ${key}`); return 0; }
        if (st !== 2) {
          state.set(sk, 1);
          try {
            sheet.cells[key] = { ...cell, v: evaluateFormula(cell.f, si, ctx) };
          } catch (e) {
            errors.push(`${sheet.name} ${key}: ${e.message}`);
            // hisoblab bo'lmasa, Excel saqlagan qiymat qoladi
          }
          state.set(sk, 2);
        }
        return toNumber(sheet.cells[key].v) || 0;
      }
      return toNumber(cell.v) || 0;
    },
  };

  sheets.forEach((sheet, si) => {
    for (const key of Object.keys(sheet.cells)) {
      if (sheet.cells[key].f) {
        const [r, c] = key.split(',').map(Number);
        ctx.getCell(si, r, c);
      }
    }
  });
  return { sheets, errors };
}

// ---------------------------------------------------------------------------
// Varaq tuzilishi
// ---------------------------------------------------------------------------

const norm = (v) => (v === null || v === undefined ? '' : String(v).trim().toLowerCase());

/**
 * @param {object} tpl   pu74Template.json dagi varaq
 * @param {object} cells hisoblangan qiymatlar
 */
export function analyzeSheet(tpl, cells) {
  const nRows = tpl.rows.length;
  const nCols = tpl.cols.length;
  const get = (r, c) => (cells[cellKey(r, c)] ? cells[cellKey(r, c)].v : null);

  // birlashtirishlar xaritasi
  const anchorOf = new Map();
  for (const [r1, c1, r2, c2] of tpl.merges) {
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) anchorOf.set(cellKey(r, c), [r1, c1, r2, c2]);
  }

  // 1) kun ustunlari: ketma-ket 1..N yoki 16..31 bo'lgan qator
  let dayRow = -1;
  const dayCols = new Map(); // c -> kun raqami
  for (let r = 0; r < nRows && dayRow < 0; r++) {
    let run = [];
    for (let c = 0; c <= nCols; c++) {
      const n = c < nCols ? toNumber(get(r, c)) : null;
      const prev = run.length ? run[run.length - 1] : null;
      if (n !== null && Number.isInteger(n) && n >= 1 && n <= 31 && (!prev || n === prev.n + 1)) {
        run.push({ c, n });
      } else {
        if (run.length >= 10 && (run[0].n === 1 || run[0].n === 16)) {
          dayRow = r;
          run.forEach(({ c: cc, n: nn }) => dayCols.set(cc, nn));
          break;
        }
        run = n !== null && Number.isInteger(n) && (n === 1 || n === 16) ? [{ c, n }] : [];
      }
    }
  }

  // 2) jadval sarlavhasi: "№" bilan boshlanadigan qator
  let headerTop = -1;
  for (let r = 0; r < nRows && headerTop < 0; r++) {
    for (let c = 0; c < Math.min(3, nCols); c++) {
      if (/^№/.test(norm(get(r, c)))) { headerTop = r; break; }
    }
  }
  // sarlavha oxiri: kun qatori yoki birinchi raqamli "1" qatordan oldingi qator
  let headerBottom = dayRow;
  if (headerTop >= 0) {
    for (let r = headerTop + 1; r < nRows; r++) {
      const n = toNumber(get(r, 0));
      if (n === 1 && r > dayRow) { headerBottom = Math.max(headerBottom, r - 1); break; }
    }
  }
  if (headerBottom < headerTop) headerBottom = headerTop;

  // 3) jami va tekshiruv qatorlari
  let totalRow = -1;
  let checkRow = -1;
  for (let r = headerBottom + 1; r < nRows; r++) {
    for (let c = 0; c < Math.min(6, nCols); c++) {
      const s = norm(get(r, c));
      if (totalRow < 0 && /^(жами|итого)(?![а-яё])/.test(s)) totalRow = r;
      if (checkRow < 0 && /^провер/.test(s)) checkRow = r;
    }
  }

  // 4) ish guruhlari: "№" ustunidagi raqam + uning ostidagi (birlashtirilgan) davomi
  const groups = [];
  const dataEnd = totalRow >= 0 ? totalRow : nRows;
  for (let r = headerBottom + 1; r < dataEnd; r++) {
    const n = toNumber(get(r, 0));
    if (n === null || !Number.isInteger(n) || n <= 0) continue;
    const m = anchorOf.get(cellKey(r, 0));
    let end = m ? m[2] : r;
    // birlashtirilmagan bo'lsa ham keyingi qatorda faqat kun qiymatlari bo'lsa — juftlik
    if (!m && r + 1 < dataEnd && get(r + 1, 0) === null && dayCols.size) {
      const hasLabel = [1, 2].some((c) => get(r + 1, c) !== null && toNumber(get(r + 1, c)) === null);
      if (!hasLabel) end = r + 1;
    }
    groups.push({ start: r, end, no: n });
  }

  const dayList = [...dayCols.keys()];
  for (const g of groups) {
    let active = false;
    if (dayList.length) {
      for (let r = g.start; r <= g.end && !active; r++) {
        for (const c of dayList) { const n = toNumber(get(r, c)); if (n) { active = true; break; } }
      }
    } else active = true;
    g.active = active;
  }

  // 5) ishsiz kunlar (jami qatorida 0)
  const offDays = new Set();
  if (totalRow >= 0) {
    for (const c of dayList) if (!toNumber(get(totalRow, c))) offDays.add(c);
  }

  // 6) tabel bilan mos kelmaydigan kataklar
  const mismatches = new Set();
  if (totalRow >= 0 && checkRow >= 0) {
    for (const c of dayList) {
      const a = toNumber(get(totalRow, c)) || 0;
      const b = toNumber(get(checkRow, c)) || 0;
      if (Math.abs(a - b) > 0.01) mismatches.add(cellKey(checkRow, c));
    }
  }

  return { dayRow, dayCols, headerTop, headerBottom, totalRow, checkRow, groups, offDays, mismatches, anchorOf };
}

/**
 * Ikki betli varaqni qayerdan bo'lish kerak (ustun indeksi).
 * Bet raqamlari pastki qatorda turadi; har bir bet raqami o'z beti markazida.
 * Birlashtirilgan katakni kesib o'tmaydigan eng yaqin chegara tanlanadi.
 */
export function findSplit(tpl) {
  if (!tpl.pageNumbers || tpl.pageNumbers.length < 2) return -1;
  const cols = tpl.cols;
  const x = [0];
  cols.forEach((w) => x.push(x[x.length - 1] + w));
  const total = x[x.length - 1];
  const [left, right] = [...tpl.pageNumbers].sort((a, b) => a[1] - b[1]);
  const centerOf = (c) => {
    const m = tpl.merges.find(([r1, c1, r2, c2]) => r1 <= left[0] && left[0] <= r2 && c1 <= c && c <= c2);
    return m ? (x[m[1]] + x[m[3] + 1]) / 2 : (x[c] + x[c + 1]) / 2;
  };
  const cl = centerOf(left[1]);
  const cr = centerOf(right[1]);
  const target = (2 * cl + (2 * cr - total)) / 2;

  const crosses = (b) => tpl.merges.some(([, c1, , c2]) => c1 < b && b <= c2);
  let best = -1;
  let bestDist = Infinity;
  for (let b = 1; b < cols.length; b++) {
    if (crosses(b)) continue;
    const d = Math.abs(x[b] - target);
    if (d < bestDist) { bestDist = d; best = b; }
  }
  return best;
}

/** Varaq nomidan qisqa yorliq: "4-5 бетлар" -> "4–5", "8- бет" -> "8". */
export function sheetLabel(name) {
  const nums = (name.match(/\d+/g) || []);
  if (!nums.length) return name;
  return nums.length > 1 ? `${nums[0]}–${nums[1]}` : nums[0];
}

// ---------------------------------------------------------------------------
// Oylar
// ---------------------------------------------------------------------------
export const MONTH_NAMES = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export function currentMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonth(d);
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/**
 * Yangi oy uchun boshlang'ich tahrirlar: o'tgan oyning reja qismi (ish nomlari,
 * joylari, normalar, xodimlar) saqlanadi, kunlik qiymatlar tozalanadi.
 * Formulali kataklarga tegilmaydi — ular o'zi qayta hisoblanadi.
 */
export function carryOverEdits(model, templateSheets, prevEdits = {}) {
  const { sheets } = computeWorkbook(model, prevEdits);
  const next = { ...prevEdits };
  templateSheets.forEach((tpl, si) => {
    const cells = sheets[si] ? sheets[si].cells : {};
    const a = analyzeSheet(tpl, cells);
    if (!a.dayCols.size) return;
    for (const g of a.groups) {
      for (let r = g.start; r <= g.end; r++) {
        for (const c of a.dayCols.keys()) {
          const cell = cells[cellKey(r, c)];
          if (!cell || (cell.f && !cell.edited)) continue;
          if (cell.v === null || cell.v === undefined || cell.v === '') continue;
          next[editKey(si, r, c)] = '';
        }
      }
    }
  });
  // asl faylda ham bo'sh bo'lgan kataklar uchun "bo'sh" tahriri kerak emas
  for (const [k, v] of Object.entries(next)) {
    if (v !== '') continue;
    const [si, r, c] = k.split('_').map(Number);
    const orig = model.sheets[si] && model.sheets[si].cells[cellKey(r, c)];
    if (!orig || orig.v === null || orig.v === '' ) delete next[k];
  }
  return next;
}
