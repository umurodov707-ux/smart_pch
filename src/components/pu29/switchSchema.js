/**
 * PU-29: strelka sxemasidagi o'lchov nuqtalari va telefonda kiritish bosqichlari.
 * Har bir nuqta/bosqich jurnal jadvalidagi maydonlarga (norms.js COLUMNS) bog'langan —
 * shuning uchun sxema, telefon rejimi va jadval doim bir xil ma'lumotni ko'rsatadi.
 */
import { CELLS, cellLevel, normText } from './norms.js';

const CELL_BY_KEY = new Map(CELLS.map((c) => [c.key, c]));

/** Maydon haqida: yorliq, turi, kesim */
export function fieldInfo(key) {
  const c = CELL_BY_KEY.get(key);
  if (!c) return null;
  const two = !!c.col.bottom;
  let suffix = '';
  if (two) {
    if (c.type === 'sh') suffix = ' — kenglik (Ш)';
    else if (c.type === 'ur') suffix = ' — sath (Ур)';
    else suffix = c.row === 'bottom' ? ' — yon yo‘l (Бк)' : ' — to‘g‘ri yo‘l (Пр)';
  }
  return { key, type: c.type, sec: c.sec || 0, label: `${c.col.label}${suffix}`, short: c.type === 'sh' ? 'Kenglik (Ш)' : c.type === 'ur' ? 'Sath (Ур)' : c.col.label + (two && c.row === 'bottom' ? ' (бок.)' : two ? ' (прям.)' : '') };
}

const L = { green: 1, yellow: 2, red: 3 };
/** Bir nechta maydonning eng yomon darajasi; hech biri o'lchanmagan bo'lsa '' */
export function worstLevel(keys, values = {}, meta = {}) {
  let best = '';
  for (const k of keys) {
    const f = CELL_BY_KEY.get(k);
    if (!f) continue;
    const lv = cellLevel(f.type, values[k], meta, f.sec || 0);
    if (lv && (!best || L[lv] > L[best])) best = lv;
  }
  return best;
}

/** Sxemadagi nuqtalar (eski jadvaldagi kesimlar bo'yicha) */
export const NODES = [
  { id: 'stik', no: 1, title: 'Rama relslari stigi', keys: ['sh0', 'ur0'] },
  { id: 'ostr', no: 2, title: 'Ostryak uchi', keys: ['sh1', 'ur1', 't0', 't0b', 't1', 't1b', 't2', 't2b', 't3', 't3b', 't4', 't4b', 'w2', 'w2b', 'w3', 'w3b', 'w4'] },
  { id: 'koren', no: 3, title: 'Ostryak ildizi', keys: ['sh2', 'ur2', 'sh3', 'ur3'] },
  { id: 'egri', no: 4, title: 'O‘tkazgich egri chizig‘i o‘rtasi', keys: ['sh4', 'ur4'] },
  { id: 'kr_t', no: 5, title: 'Krestovina — to‘g‘ri yo‘l', keys: ['sh5', 'ur5', 'sh7', 'ur7', 'sh8', 'ur8', 'sh9', 'ur9', 'sh10', 'ur10', 'ugon', 'p1', 'p2', 'g0', 'g1', 'g2', 'g3', 'w0', 'w1', 'chip'] },
  { id: 'kr_y', no: 6, title: 'Krestovina — yon yo‘l', keys: ['sh6', 'ur6', 'p1b', 'p2b', 'g0b', 'g1b', 'g2b', 'g3b'] },
  { id: 'orqa_t', no: 7, title: 'Orqa stik — to‘g‘ri yo‘l', keys: ['sh12', 'ur12'] },
  { id: 'orqa_y', no: 8, title: 'Orqa stik — yon yo‘l', keys: ['sh13', 'ur13'] },
];
/** Sxemada ko'rinmaydigan ko'rsatkichlar (yuk, brusyalar, tenglashtiruvchi stik) */
export const OTHER_KEYS = ['gruz', 'brusya', 't7', 't7b', 't8', 't8b', 'pm50', 'd5160'];

/** Telefonda kiritish bosqichlari — strelka bo'ylab yurish tartibida */
export const STEPS = [
  { id: 'stik', node: 'stik', title: 'Rama relslari stigi', hint: 'Strelka oldidagi rama relslari tutashgan joy', keys: ['sh0', 'ur0'] },
  { id: 'ostr', node: 'ostr', title: 'Ostryak uchida', hint: 'Ostryak uchi ro‘parasida', keys: ['sh1', 'ur1'] },
  { id: 'ostr_h', node: 'ostr', title: 'Ostryaklar holati', hint: 'Pasayish, orqada qolish, КОР, qadam, yopishish', keys: ['t0', 't0b', 't1', 't1b', 't2', 't2b', 't3', 't3b', 't4', 't4b'] },
  { id: 'koren', node: 'koren', title: 'Ostryak ildizida', hint: 'To‘g‘ri va yon yo‘nalish', keys: ['sh2', 'ur2', 'sh3', 'ur3'] },
  { id: 'egri', node: 'egri', title: 'Egri chiziq o‘rtasida', hint: 'O‘tkazgich egri chizig‘ining o‘rtasi', keys: ['sh4', 'ur4'] },
  { id: 'krest', node: 'kr_t', title: 'Krestovinada', hint: 'To‘g‘ri va yon yo‘l, ННК nuqtalari', keys: ['sh5', 'ur5', 'sh6', 'ur6', 'sh7', 'ur7', 'sh8', 'ur8', 'sh9', 'ur9', 'sh10', 'ur10', 'ugon'] },
  { id: 'kontr', node: 'kr_t', title: 'Kontrrels va jeloblar', hint: 'Сердечник–контррельс, контррельс–усовик, jelob kengligi', keys: ['p1', 'p1b', 'p2', 'p2b', 'g0', 'g0b', 'g1', 'g1b', 'g2', 'g2b', 'g3', 'g3b'] },
  { id: 'orqa', node: 'orqa_t', title: 'Krestovina orqa stigida', hint: 'To‘g‘ri va yon yo‘l', keys: ['sh12', 'ur12', 'sh13', 'ur13'] },
  { id: 'iznos', node: 'kr_t', title: 'Yeyilish', hint: 'Serdechnik, usovik, ostryak, rama relsi; uvalanish', keys: ['w0', 'w1', 'w2', 'w2b', 'w3', 'w3b', 'w4', 'chip'] },
  { id: 'boshqa', node: null, title: 'Boshqa ko‘rsatkichlar', hint: 'Yuk, brusyalar, tenglashtiruvchi stik', keys: ['gruz', 'brusya', 't7', 't7b', 't8', 't8b', 'pm50', 'd5160'] },
];

/** Matnli maydonlar uchun tez tanlov */
export const CHOICES = {
  kor: ['Исправно', 'Неисправно'],
  prileganie: ['Плотное', 'Неприлегание'],
  brusya: ['Исправно', 'Кустовая гниль', 'Негодные'],
};
export const isTextField = (type) => type in CHOICES;

/** Nuqta tafsiloti: oxirgi va oldingi tekshiruv qiymatlari, o'zgarish */
export function nodeDetail(node, last = {}, prev = null, meta = {}) {
  return node.keys.map((k) => {
    const f = fieldInfo(k);
    const v = last[k];
    const p = prev ? prev[k] : undefined;
    const n = Number(String(v ?? '').replace(',', '.'));
    const pn = Number(String(p ?? '').replace(',', '.'));
    let trend = '';
    if (v !== undefined && v !== '' && p !== undefined && p !== '' && Number.isFinite(n) && Number.isFinite(pn) && n !== pn) trend = n > pn ? 'up' : 'down';
    return { ...f, value: v, prev: p, level: cellLevel(f.type, v, meta, f.sec), norm: normText(f.type, meta, f.sec), trend };
  }).filter((d) => d.value !== undefined && d.value !== '' || (d.prev !== undefined && d.prev !== ''));
}

/** Sxema geometriyasi: markaga qarab krestovina burchagi (ko'rinarli bo'lishi uchun kattalashtirilgan) */
export const MARKA_SLOPE = { '1/11': 0.16, '1/9': 0.19, '1/6': 0.26 };
