/**
 * Kunlik tezkor hisobotning 11 bo'limi.
 *
 * Ma'lumot formati eski ilova (public/js/dispatcher.js → structuredData) bilan bir xil,
 * shuning uchun ikkala interfeys ham bitta hisobot bilan ishlaydi.
 *
 *   key      — bo'lim kaliti
 *   data     — structuredData dagi massiv nomi
 *   cols     — ustunlar: { k: maydon, label, type?: 'num'|'time'|'text', w?: px, req?: true }
 *   required — yuborishdan oldin to'ldirilishi shart (yoki "bugun yo'q" deb belgilanadi, agar noneOk)
 */
export const SECTIONS = [
  {
    key: 'reja', data: 'planData', group: 'Reja va bajarilgan ish', title: 'Ertangi kun rejasi', required: true,
    hint: 'Ertaga bajariladigan ishlar: qayerda, nima, nechta odam va qanday texnika.',
    cols: [
      { k: 'area', label: 'PDB', w: 90 },
      { k: 'location', label: 'Joy (km, pk)', req: true },
      { k: 'work', label: 'Ish', req: true },
      { k: 'staff', label: 'Odam', type: 'num', w: 80 },
      { k: 'machines', label: 'Texnika', w: 140 },
    ],
  },
  {
    key: 'spravka', data: 'spravkaData', group: 'Reja va bajarilgan ish', title: 'Bajarilgan ishlar', required: true,
    hint: 'Bugun bajarilgan ishlar (spravka): kim rahbarlik qildi, nima aniqlandi va tuzatildi.',
    cols: [
      { k: 'area', label: 'PDB', w: 90 },
      { k: 'putey', label: 'Yo‘l ishi', req: true },
      { k: 'obxod', label: 'Obxod' },
      { k: 'isso', label: 'ISSO' },
      { k: 'kont', label: 'Odam', type: 'num', w: 70 },
      { k: 'mech', label: 'Mexanizm', w: 110 },
      { k: 'leader', label: 'Mas’ul rahbar', w: 130 },
      { k: 'vyav', label: 'Aniqlandi' },
      { k: 'ustr', label: 'Tuzatildi' },
    ],
  },
  {
    key: 'oyna', data: 'oynaData', group: 'Reja va bajarilgan ish', title: 'Texnik ish oynalari', noneOk: true,
    hint: 'Harakat to‘xtatilgan holda ish olib boriladigan vaqt oralig‘lari.',
    cols: [
      { k: 'time', label: 'Vaqt', w: 120, req: true },
      { k: 'loc', label: 'Bekat / peregon', req: true },
      { k: 'work', label: 'Ish' },
      { k: 'type', label: 'Turi', w: 100 },
      { k: 'machines', label: 'Texnika', w: 120 },
      { k: 'status', label: 'Holati', w: 110 },
    ],
  },
  {
    key: 'temp', data: 'tempData', group: 'Yo‘l holati', title: 'Rels harorati', required: true,
    hint: 'Har bir o‘lchovni alohida qatorga yozing. 45° va undan yuqori qiymat qizil bilan belgilanadi.',
    cols: [
      { k: 'time', label: 'Vaqt', type: 'time', w: 90, req: true },
      { k: 'info', label: 'Joy (km, pk) / izoh', req: true },
      { k: 'area', label: 'PDB', w: 90 },
      { k: 'rail', label: 'Rels, °C', type: 'num', w: 100, req: true },
      { k: 'air', label: 'Havo, °C', type: 'num', w: 100 },
    ],
  },
  {
    key: 'defekt', data: 'defektData', group: 'Yo‘l holati', title: 'Nuqsonlar', noneOk: true,
    hint: 'Defektoskopiya yoki ko‘rikda topilgan rels nuqsonlari va ko‘rilgan chora.',
    cols: [
      { k: 'loc', label: 'Joy (km, pk)', req: true, w: 140 },
      { k: 'station', label: 'Bekat / peregon' },
      { k: 'code', label: 'Kodi', w: 80, req: true },
      { k: 'size', label: 'O‘lchami', w: 90 },
      { k: 'side', label: 'Tomon', w: 80 },
      { k: 'action', label: 'Chora' },
      { k: 'area', label: 'PDB', w: 80 },
    ],
  },
  {
    key: 'ogoh', data: 'generalWarnRows', alsoRead: ['dayWarnRows'], group: 'Yo‘l holati', title: 'Ogohlantirishlar', required: true, noneOk: true,
    hint: 'Tezlik cheklovlari. Bo‘lmasa “Bugun yo‘q” deb belgilang.',
    cols: [
      { k: 'km', label: 'Joy (km, pk)', req: true, w: 130 },
      { k: 'station', label: 'Bekat / peregon' },
      { k: 'path', label: 'Yo‘l', w: 70 },
      { k: 'speed', label: 'Tezlik, km/s', type: 'num', w: 100, req: true },
      { k: 'time', label: 'Muddati', w: 120 },
      { k: 'reason', label: 'Sababi' },
      { k: 'resp', label: 'Mas’ul', w: 120 },
    ],
  },
  {
    key: 'obxod', data: 'obxodData', group: 'Yo‘l holati', title: 'Piyoda tekshiruv', noneOk: true,
    hint: 'Obxodchilar tekshirgan uchastkalar va topilgan kamchiliklar.',
    cols: [
      { k: 'area', label: 'PDB', w: 90 },
      { k: 'name', label: 'Xodim', req: true },
      { k: 'km', label: 'Uchastka (km)', w: 140 },
      { k: 'tel', label: 'Telefon', w: 130 },
      { k: 'kamchilik', label: 'Kamchiliklar' },
    ],
  },
  {
    key: 'razryadka', data: 'razryadkaData', group: 'Yo‘l holati', title: 'Razryadka', noneOk: true,
    hint: 'Uzun relslarda kuchlanishni bo‘shatish ishlari.',
    cols: [
      { k: 'station', label: 'Bekat / peregon', req: true },
      { k: 'path', label: 'Yo‘l', w: 70 },
      { k: 'startKM', label: 'Boshi (km)', w: 100 },
      { k: 'endKM', label: 'Oxiri (km)', w: 100 },
      { k: 'railType', label: 'Rels', w: 70 },
      { k: 'factTemp', label: 'Harorat, °C', type: 'num', w: 100 },
      { k: 'elongation', label: 'Uzayish, mm', w: 100 },
      { k: 'reason', label: 'Sababi' },
    ],
  },
  {
    key: 'attendance', data: 'attendance', group: 'Odamlar va resurslar', title: 'Davomat', required: true,
    hint: 'Ro‘yxatdagi xodimlar soni = ishda + safarda + ta’tilda + kasal + o‘qishda + boshqa.',
    cols: [
      { k: 'area', label: 'PDB / brigada', req: true },
      { k: 'total', label: 'Ro‘yxatda', type: 'num', w: 90, req: true },
      { k: 'fact', label: 'Ishda', type: 'num', w: 80, req: true },
      { k: 'trip', label: 'Safarda', type: 'num', w: 80 },
      { k: 'otpusk', label: 'Ta’tilda', type: 'num', w: 80 },
      { k: 'sick', label: 'Kasal', type: 'num', w: 70 },
      { k: 'study', label: 'O‘qishda', type: 'num', w: 80 },
      { k: 'other', label: 'Boshqa', type: 'num', w: 80 },
    ],
  },
  {
    key: 'material', data: 'materialsData', group: 'Odamlar va resurslar', title: 'Materiallar sarfi', noneOk: true,
    hint: 'Bugun ishlatilgan materiallar.',
    cols: [
      { k: 'name', label: 'Material', req: true },
      { k: 'qty', label: 'Miqdori', type: 'num', w: 100, req: true },
      { k: 'unit', label: 'O‘lchov', w: 90 },
      { k: 'loc', label: 'Qayerda ishlatildi' },
    ],
  },
  {
    key: 'transport', data: 'transportData', group: 'Odamlar va resurslar', title: 'Motorelsli transport', noneOk: true, optional: true,
    hint: 'Ishlatilgan drezina, AGMU va boshqalar.',
    cols: [
      { k: 'type', label: 'Turi', req: true, w: 130 },
      { k: 'num', label: 'Raqami', w: 100 },
      { k: 'name', label: 'Mashinist' },
      { k: 'time', label: 'Vaqti', w: 110 },
      { k: 'loc', label: 'Qayerda' },
    ],
  },
];

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));

/** Topshirish muddati (Toshkent vaqti) */
export const DEADLINE = '18:00';
/** Rels harorati chegaralari, °C */
export const RAIL_WARN = 42;
export const RAIL_HOT = 45;

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
export { num };

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

/** Bo'lim qatorlari (eski "dayWarnRows" ham o'qiladi) */
export function rowsOf(sd, section) {
  if (!sd) return [];
  const main = Array.isArray(sd[section.data]) ? sd[section.data] : [];
  const extra = (section.alsoRead || []).flatMap((k) => (Array.isArray(sd[k]) ? sd[k] : []));
  return [...main, ...extra].filter((r) => r && typeof r === 'object');
}

/** Qatorning kamida bitta maydoni to'ldirilganmi (bo'sh qatorlar hisobga olinmaydi) */
export const rowFilled = (section, row) => section.cols.some((c) => !isBlank(row[c.k]));

/**
 * Bo'lim holati: 'done' | 'none' (bugun yo'q) | 'empty' | 'error'
 * + count, problems (matnlar)
 */
export function sectionState(sd, section) {
  const rows = rowsOf(sd, section).filter((r) => rowFilled(section, r));
  const marked = !!(sd && sd.none && sd.none[section.key]);
  const problems = [];
  rows.forEach((r, i) => {
    const missing = section.cols.filter((c) => c.req && isBlank(r[c.k])).map((c) => c.label);
    if (missing.length) problems.push(`${i + 1}-qator: ${missing.join(', ')} kiritilmagan`);
    section.cols.filter((c) => c.type === 'num' && !isBlank(r[c.k]) && num(r[c.k]) === null)
      .forEach((c) => problems.push(`${i + 1}-qator: “${c.label}” son bo‘lishi kerak`));
  });
  if (section.key === 'temp') {
    rows.forEach((r, i) => {
      const t = num(r.rail);
      if (t !== null && (t < -50 || t > 80)) problems.push(`${i + 1}-qator: rels harorati ${t}° — tekshiring`);
    });
  }
  if (section.key === 'attendance') {
    rows.forEach((r, i) => {
      const total = num(r.total);
      if (total === null) return;
      const parts = ['fact', 'trip', 'otpusk', 'sick', 'study', 'other', 'mp'].reduce((s, k) => s + (num(r[k]) || 0), 0);
      if (parts !== total) problems.push(`${i + 1}-qator: ro‘yxatda ${total}, yozilgani ${parts} — mos emas`);
    });
  }
  if (rows.length && problems.length) return { state: 'error', count: rows.length, problems };
  if (rows.length) return { state: 'done', count: rows.length, problems };
  if (marked) return { state: 'none', count: 0, problems };
  return { state: 'empty', count: 0, problems };
}

/** Butun hisobot: nechta bo'lim tayyor, nimalar yetishmaydi */
export function reportProgress(sd) {
  const states = SECTIONS.map((s) => ({ section: s, ...sectionState(sd, s) }));
  const filled = states.filter((x) => x.state === 'done' || x.state === 'none').length;
  const blockers = [];
  states.forEach((x) => {
    if (x.state === 'error') blockers.push(`${x.section.title}: ${x.problems[0]}`);
    else if (x.state === 'empty' && x.section.required) blockers.push(`${x.section.title}: to‘ldirilmagan${x.section.noneOk ? ' (yoki “bugun yo‘q” deb belgilang)' : ''}`);
  });
  return { states, filled, total: SECTIONS.length, canSubmit: blockers.length === 0, blockers };
}

/** Bo'sh hisobot */
export function emptyReport() {
  const sd = { none: {} };
  SECTIONS.forEach((s) => { sd[s.data] = []; });
  sd.dayWarnRows = [];
  return sd;
}

/** Serverdan kelgan (yoki eski) hisobotni to'liq ko'rinishga keltirish */
export function normalizeReport(sd) {
  const out = emptyReport();
  if (!sd || typeof sd !== 'object') return out;
  for (const s of SECTIONS) if (Array.isArray(sd[s.data])) out[s.data] = sd[s.data].map((r) => ({ ...r }));
  if (Array.isArray(sd.dayWarnRows)) out.dayWarnRows = sd.dayWarnRows.map((r) => ({ ...r }));
  out.none = sd.none && typeof sd.none === 'object' ? { ...sd.none } : {};
  return out;
}

/** Yuborishdan oldin: bo'sh qatorlarni olib tashlash */
export function cleanReport(sd) {
  const out = normalizeReport(sd);
  for (const s of SECTIONS) out[s.data] = out[s.data].filter((r) => rowFilled(s, r));
  return out;
}
