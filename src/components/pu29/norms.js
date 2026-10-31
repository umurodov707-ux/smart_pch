/**
 * PU-29: strelkali o'tkazgich o'lchovlari me'yorlari va jurnal ustunlari.
 *
 * Me'yorlar eski PU-29 kodidan (public/js/pu29.js) aynan ko'chirilgan — marka (1/11, 1/9, 1/6),
 * yo'l turi (asosiy / qabul-jo'nash / boshqa) va rels turi (R-65, R-50, R-43) hisobga olinadi.
 * Yagona o'zgarish: "Угон сердечника (1338 мм)" ilgari koliya kengligi me'yori (1520) bilan
 * tekshirilib doim qizil chiqardi — endi 1338 ± 3 мм bilan tekshiriladi.
 *
 * Darajalar: 'green' | 'yellow' | 'red' | '' (bo'sh yoki baholanmaydi)
 */

export const LINE_CATEGORIES = [
  { id: 'asosiy', label: 'Asosiy yo‘l', ru: 'Главный' },
  { id: 'qabul', label: 'Qabul qilish – jo‘nash', ru: 'Приёмо-отправочный' },
  { id: 'boshqa', label: 'Boshqa yo‘llar', ru: 'Прочие' },
];
export const MARKAS = ['1/11', '1/9', '1/6'];
export const RAIL_TYPES = ['R-65', 'R-50', 'R-43'];

export function normalizeCategory(cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (c.includes('asosiy') || c.includes('глав')) return 'asosiy';
  if (c.includes('qabul') || c.includes('jonash') || c.includes('jo‘nash') || c.includes("jo'nash") || c.includes('приём') || c.includes('прием')) return 'qabul';
  return 'boshqa';
}

const num = (v) => {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return NaN;
  return /^[-+]?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
};
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

// ---------------------------------------------------------------------------
// Me'yorlar (eski koddan)
// ---------------------------------------------------------------------------
const S = (nom, green, yellow, name) => ({ nom, green, yellow, name });
const BASE_SECTIONS = [
  S(1520, [1518, 1524], [1514, 1528], 'Стык рамных рельсов'),
  S(1524, [1522, 1528], [1518, 1532], 'У острия остряка'),
  S(1520, [1518, 1524], [1514, 1528], 'Корень (прямой)'),
  S(1520, [1518, 1524], [1514, 1528], 'Корень (боковой)'),
  S(1520, [1518, 1530], [1514, 1534], 'Середина переводной кривой'),
  S(1520, [1517, 1523], [1513, 1527], 'В крестовине (прямой)'),
  S(1520, [1517, 1523], [1513, 1527], 'В крестовине (боковой)'),
  S(1520, [1518, 1524], [1514, 1528], 'Прочие сечения'),
];

export function gaugeNorms(marka, lineCategory) {
  const cat = normalizeCategory(lineCategory);
  const sections = BASE_SECTIONS.map((s) => ({ ...s }));
  if (cat === 'qabul' && marka === '1/9') {
    sections[4] = S(1521, [1519, 1531], [1515, 1535], 'Середина переводной кривой');
    sections[6] = S(1524, [1521, 1527], [1517, 1531], 'В крестовине (боковой) по боковому');
  } else if (cat === 'qabul' && marka === '1/6') {
    sections[6] = S(1524, [1521, 1527], [1517, 1531], 'В крестовине (боковой) по боковому');
  }
  return { sections, dangerAbs: [1512, 1548] };
}

export function gaugeLevel(value, sectionIdx, marka, lineCategory) {
  const v = num(value);
  if (Number.isNaN(v)) return '';
  const { sections, dangerAbs } = gaugeNorms(marka, lineCategory);
  const s = sections[Math.min(sectionIdx, sections.length - 1)];
  if (v < dangerAbs[0] || v > dangerAbs[1]) return 'red';
  if (v >= s.green[0] && v <= s.green[1]) return 'green';
  if (v >= s.yellow[0] && v <= s.yellow[1]) return 'yellow';
  return 'red';
}

export function wearNorms(railType) {
  if (railType === 'R-50') return { greenMax: 5, yellowMax: 7, text: '0–5 мм' };
  if (railType === 'R-43') return { greenMax: 4, yellowMax: 5.5, text: '0–4 мм' };
  return { greenMax: 6, yellowMax: 8, text: '0–6 мм' };
}

export function gutterNorms(marka, gutterIdx) {
  const first = gutterIdx === 0; // J1 — kontrrels, qolganlari J2 (usovik, gorlo, koren)
  if (marka === '1/9') return first ? { green: [46, 50], yellow: [44, 52], text: '46–50' } : { green: [42, 46], yellow: [40, 48], text: '42–46' };
  if (marka === '1/6') return first ? { green: [48, 52], yellow: [46, 54], text: '48–52' } : { green: [44, 48], yellow: [42, 50], text: '44–48' };
  return first ? { green: [45, 48], yellow: [43, 50], text: '45–48' } : { green: [41, 44], yellow: [39, 46], text: '41–44' };
}

export function distanceNorms(marka) {
  if (marka === '1/9') return { kMin: 1475, text: '≥ 1475 мм' };
  if (marka === '1/6') return { kMin: 1480, text: '≥ 1480 мм' };
  return { kMin: 1472, text: '≥ 1472 мм' };
}

export function chippingLevel(value, lineCategory) {
  const v = num(value);
  if (Number.isNaN(v)) return '';
  if (v <= 0) return 'green';
  const cat = normalizeCategory(lineCategory);
  const [y, r] = cat === 'asosiy' ? [150, 191] : cat === 'qabul' ? [225, 286] : [300, 381];
  if (v >= r) return 'red';
  if (v >= y) return 'yellow';
  return 'green';
}

export function loadLimit(marka) {
  return marka === '1/9' ? 50 : marka === '1/6' ? 30 : 60;
}

const BAD_WORDS = ['неиспр', 'дефект', 'neisp', 'def', 'xavfli'];
const has = (s, words) => words.some((w) => s.includes(w));

/**
 * Bitta katak darajasi.
 * @param {string} type ustun turi
 * @param {*} value
 * @param {{marka, lineCategory, type}} meta strelka ma'lumotlari
 * @param {number} sec kesim (sh) yoki jelob (g) indeksi
 */
export function cellLevel(type, value, meta = {}, sec = 0) {
  if (isEmpty(value)) return '';
  const v = num(value);
  const str = String(value).toLowerCase().trim();
  const marka = meta.marka || '1/11';
  switch (type) {
    case 'sh': return gaugeLevel(value, sec, marka, meta.lineCategory);
    case 'ur': if (Number.isNaN(v)) return ''; return Math.abs(v) > 10 ? 'red' : Math.abs(v) > 6 ? 'yellow' : 'green';
    case 'ugon': if (Number.isNaN(v)) return ''; return Math.abs(v - 1338) > 3 ? 'red' : 'green';
    case 'g': {
      if (Number.isNaN(v)) return '';
      const n = gutterNorms(marka, sec);
      if (v < n.yellow[0] || v > n.yellow[1]) return 'red';
      if (v < n.green[0] || v > n.green[1]) return 'yellow';
      return 'green';
    }
    case 'w': {
      if (Number.isNaN(v)) return '';
      const n = wearNorms(meta.type || 'R-65');
      return v > n.yellowMax ? 'red' : v > n.greenMax ? 'yellow' : 'green';
    }
    case 'chip': return chippingLevel(value, meta.lineCategory);
    case 'gruz': if (Number.isNaN(v)) return ''; return v > loadLimit(marka) ? 'red' : 'green';
    case 'p1': if (Number.isNaN(v)) return ''; return v < distanceNorms(marka).kMin ? 'red' : 'green';
    case 'p2': if (Number.isNaN(v)) return ''; return v > 1435 ? 'red' : 'green';
    case 'ponijenie':
    case 'otstavanie': if (Number.isNaN(v)) return ''; return v >= 2 ? 'red' : v >= 1.5 ? 'yellow' : 'green';
    case 'kor':
      if (!Number.isNaN(v)) return v < 4 || v > 6 ? 'red' : 'green';
      if (has(str, BAD_WORDS)) return 'red';
      if (has(str, ['исправно', 'soz', 'ok', 'норма'])) return 'green';
      return '';
    case 'shag': if (Number.isNaN(v)) return ''; return v < 100 ? (v > 3 ? 'red' : 'green') : (v < 152 ? 'red' : 'green');
    case 'prileganie':
      if (has(str, ['неприлег', 'зазор', 'gap', 'tirqish', 'yopishmagan'])) return 'red';
      if (has(str, ['плотное', 'zich', 'ok', 'норма', 'нет просвета', 'просвета нет'])) return 'green';
      return '';
    case 'brusya':
      if (has(str, ['негодн', 'yaroqsiz', 'авар', 'неиспр', 'neisp'])) return 'red';
      if (has(str, ['куст', 'гниль', 'chir', 'yor', 'трещин'])) return 'yellow';
      if (has(str, ['испр', 'soz', 'ok'])) return 'green';
      return '';
    case 'prim_1520': if (Number.isNaN(v)) return ''; return v < 1512 || v > 1548 ? 'red' : v < 1519 || v > 1521 ? 'yellow' : 'green';
    case 'ostrie_1524': if (Number.isNaN(v)) return ''; return v < 1512 || v > 1548 ? 'red' : v < 1523 || v > 1525 ? 'yellow' : 'green';
    case 'pm50': if (Number.isNaN(v)) return ''; return Math.abs(v) > 50 ? 'red' : Math.abs(v) > 30 ? 'yellow' : 'green';
    case 'd5160': if (Number.isNaN(v)) return ''; return v < 5150 || v > 5170 ? 'red' : v < 5155 || v > 5165 ? 'yellow' : 'green';
    default: return '';
  }
}

/** Ustun uchun hozirgi strelkaga mos me'yor matni */
export function normText(type, meta = {}, sec = 0) {
  const marka = meta.marka || '1/11';
  switch (type) {
    case 'sh': { const s = gaugeNorms(marka, meta.lineCategory).sections[Math.min(sec, 7)]; return `${s.green[0]}–${s.green[1]} мм (ном. ${s.nom})`; }
    case 'ur': return '±6 мм (xavfli > ±10)';
    case 'ugon': return '1338 ± 3 мм';
    case 'g': return `${gutterNorms(marka, sec).text} мм`;
    case 'w': return wearNorms(meta.type || 'R-65').text;
    case 'chip': { const c = normalizeCategory(meta.lineCategory); return c === 'asosiy' ? '0–149 мм' : c === 'qabul' ? '0–224 мм' : '0–299 мм'; }
    case 'gruz': return `≤ ${loadLimit(marka)} млн. т`;
    case 'p1': return distanceNorms(marka).text;
    case 'p2': return '≤ 1435 мм';
    case 'ponijenie': case 'otstavanie': return '< 1,5 мм (xavfli ≥ 2)';
    case 'kor': return '4–6 мм / исправно';
    case 'shag': return '≥ 152 мм';
    case 'prileganie': return 'плотное';
    case 'brusya': return 'исправно';
    case 'prim_1520': return '1519–1521 мм';
    case 'ostrie_1524': return '1523–1525 мм';
    case 'pm50': return '±30 мм (xavfli > ±50)';
    case 'd5160': return '5155–5165 мм';
    default: return '';
  }
}

// ---------------------------------------------------------------------------
// Jurnal ustunlari (eski jadval bilan aynan bir xil tartibda)
// Har bir ustun: id (sarlavha/me'yor kaliti), top — 1-qator katagi, bottom — 2-qator katagi.
// Bitta katakli (ikki qatorga cho'zilgan) ustunlarda bottom yo'q.
// ---------------------------------------------------------------------------
const pair = (id, label, topKey, topType, bottomKey, bottomType, sec) => ({ id, label, top: { key: topKey, type: topType, sec }, bottom: { key: bottomKey, type: bottomType, sec } });
const single = (id, label, key, type, sec) => ({ id, label, top: { key, type, sec } });

export const COLUMNS = [
  // Отклонения от нормы (Ш / Ур)
  pair('styk_ram', 'Стык рамных рельсов', 'sh0', 'sh', 'ur0', 'ur', 0),
  pair('u_ostriya', 'У острия остряка', 'sh1', 'sh', 'ur1', 'ur', 1),
  pair('koren_pryam', 'Корень остряка (прямой)', 'sh2', 'sh', 'ur2', 'ur', 2),
  pair('koren_bok', 'Корень остряка (боковой)', 'sh3', 'sh', 'ur3', 'ur', 3),
  pair('per_krivaya', 'В середине переводной кривой', 'sh4', 'sh', 'ur4', 'ur', 4),
  pair('krest_pryam', 'В крестовине (прямой)', 'sh5', 'sh', 'ur5', 'ur', 5),
  pair('krest_bok', 'В крестовине (боковой)', 'sh6', 'sh', 'ur6', 'ur', 6),
  // Стрелочных переводов (ННК)
  pair('ser_nnk', 'В середине ННК', 'sh7', 'sh', 'ur7', 'ur', 7),
  pair('per_styk', 'В переднем стыке крестовины', 'sh8', 'sh', 'ur8', 'ur', 8),
  pair('v_gorle', 'В горле крестовины', 'sh9', 'sh', 'ur9', 'ur', 9),
  pair('ost_serd', 'В острие сердечника', 'sh10', 'sh', 'ur10', 'ur', 10),
  single('ugon_serd', 'Угон сердечника (1338 мм)', 'ugon', 'ugon'),
  pair('zad_pryam', 'В заднем стыке крестовины (прямой)', 'sh12', 'sh', 'ur12', 'ur', 12),
  pair('zad_bok', 'В заднем стыке крестовины (боковой)', 'sh13', 'sh', 'ur13', 'ur', 13),
  // Расстояние (Пр / Бк)
  pair('serd_kontr', 'Сердечник – контррельс', 'p1', 'p1', 'p1b', 'p1'),
  pair('kontr_usov', 'Контррельс – усовик', 'p2', 'p2', 'p2b', 'p2'),
  // Ширина желоба
  pair('v_kontr', 'Желоб в контррельсе', 'g0', 'g', 'g0b', 'g', 0),
  pair('v_krest', 'Желоб в крестовине', 'g1', 'g', 'g1b', 'g', 1),
  pair('v_gorle2', 'Желоб в горле', 'g2', 'g', 'g2b', 'g', 2),
  pair('v_korne', 'Желоб в корне остряка', 'g3', 'g', 'g3b', 'g', 3),
  // Износ
  single('iznos_serd', 'Износ сердечника', 'w0', 'w'),
  single('iznos_usov', 'Износ усовика', 'w1', 'w'),
  pair('bok_kriv', 'Бок. износ остряка (кривой)', 'w2', 'w', 'w2b', 'w'),
  pair('bok_pryam', 'Бок. износ остряка (прямой)', 'w3', 'w', 'w3b', 'w'),
  single('bok_ram', 'Бок. износ рамного рельса', 'w4', 'w'),
  single('chip', 'Выкрашивание', 'chip', 'chip'),
  pair('ponijenie', 'Понижение остряка', 't0', 'ponijenie', 't0b', 'ponijenie'),
  pair('otstavanie', 'Отставание остряка', 't1', 'otstavanie', 't1b', 'otstavanie'),
  pair('kor', 'КОР', 't2', 'kor', 't2b', 'kor'),
  pair('shag', 'Шаг остряка', 't3', 'shag', 't3b', 'shag'),
  pair('prileganie', 'Прилегание', 't4', 'prileganie', 't4b', 'prileganie'),
  single('gruz', 'Грузонапряжённость', 'gruz', 'gruz'),
  single('brusya', 'Дефекты брусьев', 'brusya', 'brusya'),
  // Уравнительный стык
  pair('prim_1520', 'Примыкание 1520', 't7', 'prim_1520', 't7b', 'prim_1520'),
  pair('ostrie_1524', 'Острие 1524', 't8', 'ostrie_1524', 't8b', 'ostrie_1524'),
  single('pm50', 'Зазор ±50 мм', 'pm50', 'pm50'),
  single('d5160', 'Длина плети 5160', 'd5160', 'd5160'),
];

/** Ustun indeksi: "Ур / Ш" va "Пр / Бк" yorliq ustunlari shu ustunlardan oldin turadi */
export const PR_BK_BEFORE = COLUMNS.findIndex((c) => c.id === 'serd_kontr');

/** Barcha kataklar ro'yxati (tekshiruv uchun) */
export const CELLS = COLUMNS.flatMap((c) => [
  { col: c, row: 'top', ...c.top },
  ...(c.bottom ? [{ col: c, row: 'bottom', ...c.bottom }] : []),
]);

const LEVEL_ORDER = { '': 0, green: 1, yellow: 2, red: 3 };

/** Tekshiruv yozuvidagi barcha chetlanishlar */
export function recordIssues(values = {}, meta = {}) {
  const out = [];
  for (const cell of CELLS) {
    const value = values[cell.key];
    const level = cellLevel(cell.type, value, meta, cell.sec || 0);
    if (level === 'yellow' || level === 'red') {
      const rowLabel = cell.col.bottom ? (cell.type === 'ur' ? ' (уровень)' : cell.row === 'bottom' ? ' (бок.)' : cell.type === 'sh' ? ' (ширина)' : ' (прям.)') : '';
      out.push({
        key: cell.key,
        label: `${cell.col.label}${rowLabel}`,
        value,
        norm: normText(cell.type, meta, cell.sec || 0),
        level,
      });
    }
  }
  return out.sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]);
}

/** Strelka holati: oxirgi tekshiruv bo'yicha */
export function recordStatus(values, meta) {
  if (!values || !Object.values(values).some((v) => !isEmpty(v))) return 'none';
  const issues = recordIssues(values, meta);
  if (issues.some((i) => i.level === 'red')) return 'danger';
  if (issues.length) return 'warning';
  return 'ok';
}

/** Ro'yxat uchun asosiy ko'rsatkichlar (eski dashboarddagi Tonna / Yeyilish / Oraliq) */
export function liveStats(values = {}) {
  const max = (keys) => {
    const list = keys.map((k) => num(values[k])).filter((x) => !Number.isNaN(x));
    return list.length ? Math.max(...list) : null;
  };
  return {
    load: Number.isNaN(num(values.gruz)) ? null : num(values.gruz),
    wear: max(['w0', 'w1', 'w2', 'w2b', 'w3', 'w3b', 'w4']),
    gutter: max(['g0', 'g1', 'g2', 'g3', 'g0b', 'g1b', 'g2b', 'g3b']),
  };
}

// ---------------------------------------------------------------------------
// Ordinatalar
// ---------------------------------------------------------------------------
export const ORDINAT_COLUMNS = [
  { key: 'v_korne', label: 'В корне остр.' },
  { key: 'm2', label: '2 м' }, { key: 'm4', label: '4' }, { key: 'm6', label: '6' }, { key: 'm8', label: '8' },
  { key: 'm10', label: '10' }, { key: 'm12', label: '12' }, { key: 'm14', label: '14' }, { key: 'm16', label: '16' },
  { key: 'm18', label: '18' }, { key: 'm20', label: '20' }, { key: 'v_konse', label: 'В конце переводной кривой' },
];

/** Namunaviy ordinatalar (eski koddagi kabi; loyiha bo'yicha aniqlashtiriladi) */
export function ordinatNorms(railType, marka) {
  if (railType === 'R-65' || railType === 'R-50') {
    if (marka === '1/11') return ['144', '236', '350', '485', '641', '819', '1018', '1238', '1478', '–', '–', ''];
    if (marka === '1/9') return ['144', '260', '419', '622', '868', '1157', '1488', '–', '–', '–', '–', ''];
    if (marka === '1/6') return ['144', '354', '699', '1177', '–', '–', '–', '–', '–', '–', '–', ''];
  }
  return Array(12).fill('');
}

export const DEFAULT_META = {
  station: '', pathNumber: '', lineCategory: 'asosiy', type: 'R-65', marka: '1/11',
  switchType: 'o‘ng', yearOfManufacture: '', sleeperType: 'temir beton', km: '', pk: '',
};
