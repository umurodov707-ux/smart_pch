/**
 * PU-29 jadvalining sarlavhasi va qatorlari — eski jurnal (public/js/pu29.js) bilan aynan bir xil.
 * Ekranda ham, Excel'da ham shu tuzilish ishlatiladi.
 */
import { COLUMNS, cellLevel } from './norms.js';

const H = (text, o = {}) => ({ text, ...o });

/** Sarlavha: 3 qator. v — tik yozuv, id — me'yor ma'lumoti (normInfo.json) */
export const HEADER = [
  [
    H('Дата промера', { rs: 3, v: true, id: 'date' }),
    H('Ур / Ш', { rs: 3, v: true, id: 'ur_sh' }),
    H('Отклонения от нормы', { cs: 7, id: 'otstuplenie_group' }),
    H('стрелочных переводов (ННК)', { cs: 7, id: 'strel_group' }),
    H('Прям. / Бок.', { rs: 3, v: true, id: 'pr_bk' }),
    H('Расстояние', { cs: 2, id: 'rasstoyanie_group' }),
    H('Ширина желоба', { cs: 4, id: 'jelob_group' }),
    H('Износ', { cs: 5, id: 'iznos_group' }),
    H('Выкрашивание', { rs: 3, v: true, id: 'chip' }),
    H('Понижение остр. (сеч. 50мм)', { rs: 3, v: true, id: 'ponijenie' }),
    H('Отставание остряка', { rs: 3, v: true, id: 'otstavanie' }),
    H('КОР', { rs: 3, v: true, id: 'kor' }),
    H('Шаг остряка', { rs: 3, v: true, id: 'shag' }),
    H('Прилегание', { rs: 3, v: true, id: 'prileganie' }),
    H('Грузонапряж.', { rs: 3, v: true, id: 'gruz' }),
    H('Дефекты брусьев', { rs: 3, v: true, id: 'brusya' }),
    H('Уравнительный стык', { cs: 4, id: 'uravnit_group' }),
  ],
  [
    H('Стык рамных рельсов', { rs: 2, v: true, id: 'styk_ram' }),
    H('У острия остряка', { rs: 2, v: true, id: 'u_ostriya' }),
    H('Корень остряка', { cs: 2, id: 'koren' }),
    H('В сер. перевод. кривой', { rs: 2, v: true, id: 'per_krivaya' }),
    H('В крестовине', { cs: 2, id: 'v_krest_ne' }),
    H('В середине ННК', { rs: 2, v: true, id: 'ser_nnk' }),
    H('В перед. стыке крест.', { rs: 2, v: true, id: 'per_styk' }),
    H('В горле крестовины', { rs: 2, v: true, id: 'v_gorle' }),
    H('В острие сердечника', { rs: 2, v: true, id: 'ost_serd' }),
    H('Угон сердеч. (1338 мм)', { rs: 2, v: true, id: 'ugon_serd' }),
    H('В заднем стыке крест.', { cs: 2, id: 'zad_styk' }),
    H('Сердечник-Контррельс', { rs: 2, v: true, id: 'serd_kontr' }),
    H('Контррельс-Усовик', { rs: 2, v: true, id: 'kontr_usov' }),
    H('В контррельсе', { rs: 2, v: true, id: 'v_kontr' }),
    H('В крестовине', { rs: 2, v: true, id: 'v_krest' }),
    H('В горле', { rs: 2, v: true, id: 'v_gorle2' }),
    H('В корне остряка', { rs: 2, v: true, id: 'v_korne' }),
    H('Износ сердечника', { rs: 2, v: true, id: 'iznos_serd' }),
    H('Износ усовика', { rs: 2, v: true, id: 'iznos_usov' }),
    H('Бок. износ остряка', { cs: 2, id: 'bok_ostr' }),
    H('Бок. износ рамного', { rs: 2, v: true, id: 'bok_ram' }),
    H('Примыкание 1520', { rs: 2, v: true, id: 'prim_1520' }),
    H('Острие 1524', { rs: 2, v: true, id: 'ostrie_1524' }),
    H('Зазор ±50 мм', { rs: 2, v: true, id: 'pm50' }),
    H('Длина плети 5160', { rs: 2, v: true, id: 'd5160' }),
  ],
  [
    H('Прямой', { id: 'koren_pryam' }), H('Боковой', { id: 'koren_bok' }),
    H('Прямой', { id: 'krest_pryam' }), H('Боковой', { id: 'krest_bok' }),
    H('Прямой', { id: 'zad_pryam' }), H('Боковой', { id: 'zad_bok' }),
    H('Крив.', { id: 'bok_kriv' }), H('Прямой', { id: 'bok_pryam' }),
  ],
];

/** Ustunlar tartibi: [sana, 'Ш/Ур', ...14, 'Пр/Бк', ...qolganlari] */
export const BODY_ORDER = (() => {
  const out = [{ kind: 'date' }, { kind: 'label', top: 'Ш', bottom: 'Ур' }];
  COLUMNS.forEach((col) => {
    if (col.id === 'serd_kontr') out.push({ kind: 'label', top: 'Пр', bottom: 'Бк' });
    out.push({ kind: 'col', col });
  });
  return out;
})();

export const TOTAL_COLS = BODY_ORDER.length;

/**
 * Bitta tekshiruv uchun ikki qator kataklari (Excel uchun).
 * @returns {{r, c, v, rs?, level?, label?}[]} r: 0 yoki 1
 */
export function recordCells(values, meta, dateText) {
  const out = [];
  BODY_ORDER.forEach((item, c) => {
    if (item.kind === 'date') out.push({ r: 0, c, v: dateText, rs: 2, label: true });
    else if (item.kind === 'label') {
      out.push({ r: 0, c, v: item.top, label: true });
      out.push({ r: 1, c, v: item.bottom, label: true });
    } else {
      const { col } = item;
      const t = col.top;
      out.push({ r: 0, c, v: values[t.key] ?? '', rs: col.bottom ? 1 : 2, level: cellLevel(t.type, values[t.key], meta, t.sec || 0) });
      if (col.bottom) {
        const b = col.bottom;
        out.push({ r: 1, c, v: values[b.key] ?? '', level: cellLevel(b.type, values[b.key], meta, b.sec || 0) });
      }
    }
  });
  return out;
}

/** Sarlavhani katakchalarga yoyish (Excel uchun): har bir sarlavha katagining ustun indeksi */
export function headerCells() {
  const taken = new Set();
  const out = [];
  HEADER.forEach((row, r) => {
    let c = 0;
    for (const h of row) {
      while (taken.has(`${r},${c}`)) c++;
      const rs = h.rs || 1;
      const cs = h.cs || 1;
      for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) taken.add(`${r + i},${c + j}`);
      out.push({ r, c, rs, cs, v: h.text, vertical: !!h.v, id: h.id });
      c += cs;
    }
  });
  return out;
}
