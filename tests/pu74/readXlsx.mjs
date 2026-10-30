/**
 * Testlar uchun kichik xlsx o'quvchi (tashqi kutubxonasiz).
 * Natija journalModel.fromSheetJS bilan bir xil ko'rinishda: { sheets: [{ name, cells: {"r,c": {v, f?}} }] }
 * Umumiy (shared) formulalar har bir katak uchun siljitib yoziladi — Excel va SheetJS kabi.
 */
import { readZip } from '../../src/components/pu74/xlsxExport.js';
import { colIndex } from '../../src/components/pu74/journalModel.js';

const decodeXml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d)).replace(/&amp;/g, '&');
const attr = (tag, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag); return m ? m[1] : null; };
const colName = (c) => { let s = ''; let n = c + 1; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

/** Formuladagi nisbiy havolalarni dr qator va dc ustunga siljitish ('Varaq nomi' ichiga tegmaydi) */
export function shiftFormula(f, dr, dc) {
  return f.split(/('(?:[^']|'')*')/).map((part, i) => (i % 2 ? part : part.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)(?![\d(])/g, (all, cAbs, col, rAbs, row) => {
    const c = cAbs ? col : colName(colIndex(col) + dc);
    const r = rAbs ? row : String(Number(row) + dr);
    return `${cAbs}${c}${rAbs}${r}`;
  }))).join('');
}

export async function readXlsx(bytes) {
  const entries = await readZip(bytes);
  const dec = new TextDecoder();
  const files = new Map(entries.map((e) => [e.name, dec.decode(e.data)]));
  const strings = [];
  for (const m of (files.get('xl/sharedStrings.xml') || '').matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    strings.push(decodeXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join('')));
  }
  const rels = new Map();
  for (const m of files.get('xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b[^>]*>/g)) rels.set(attr(m[0], 'Id'), attr(m[0], 'Target'));
  const sheets = [];
  for (const m of files.get('xl/workbook.xml').matchAll(/<sheet\b[^>]*>/g)) {
    const name = decodeXml(attr(m[0], 'name'));
    const target = rels.get(attr(m[0], 'r:id')).replace(/^\/?(xl\/)?/, 'xl/');
    const xml = files.get(target);
    const cells = {};
    const shared = new Map();
    for (const cm of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = attr(cm[0], 'r');
      const p = /^([A-Z]+)(\d+)$/.exec(ref);
      const r = Number(p[2]) - 1;
      const c = colIndex(p[1]);
      const inner = cm[2] || '';
      const t = attr(`<c${cm[1]}>`, 't');
      const fTag = /<f\b([^>]*?)(?:\/>|>([\s\S]*?)<\/f>)/.exec(inner);
      let f;
      if (fTag) {
        const si = attr(`<f${fTag[1]}>`, 'si');
        if (fTag[2]) { f = decodeXml(fTag[2]); if (si !== null) shared.set(si, { f, r, c }); }
        else if (si !== null && shared.has(si)) { const base = shared.get(si); f = shiftFormula(base.f, r - base.r, c - base.c); }
      }
      const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
      let v = null;
      if (t === 's' && vm) v = strings[Number(vm[1])];
      else if (t === 'inlineStr') v = decodeXml([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(''));
      else if ((t === 'str' || t === 'e') && vm) v = decodeXml(vm[1]);
      else if (t === 'b' && vm) v = vm[1] === '1';
      else if (vm) v = Number(vm[1]);
      if (v === null && !f) continue;
      cells[`${r},${c}`] = f ? { v, f } : { v };
    }
    sheets.push({ name, cells });
  }
  return { sheets };
}
