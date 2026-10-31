/**
 * PU-29 me'yorlari, jadval tuzilishi va Excel eksport testlari.
 * Me'yor qiymatlari eski public/js/pu29.js bilan solishtirib tekshirilgan (34 000+ holat, farq yo'q).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { cellLevel, gaugeLevel, recordIssues, recordStatus, liveStats, normalizeCategory, normText, COLUMNS, CELLS } from '../../src/components/pu29/norms.js';
import { HEADER, TOTAL_COLS, headerCells, recordCells } from '../../src/components/pu29/layout.js';
import { buildXlsx, XS } from '../../src/components/pu29/pu29Xlsx.js';
import { readXlsx } from '../pu74/readXlsx.mjs';

const A = { marka: '1/11', lineCategory: 'asosiy', type: 'R-65' };

test('yo‘l turini aniqlash', () => {
  assert.equal(normalizeCategory('ASOSIY'), 'asosiy');
  assert.equal(normalizeCategory("Qabul qilish - Jo'nash"), 'qabul');
  assert.equal(normalizeCategory('Boshqa'), 'boshqa');
  assert.equal(normalizeCategory(''), 'boshqa');
});

test('koliya kengligi: kesimlar, marka va yo‘l turi', () => {
  assert.equal(gaugeLevel(1520, 0, '1/11', 'asosiy'), 'green');
  assert.equal(gaugeLevel(1526, 0, '1/11', 'asosiy'), 'yellow');
  assert.equal(gaugeLevel(1530, 0, '1/11', 'asosiy'), 'red');
  assert.equal(gaugeLevel(1530, 4, '1/11', 'asosiy'), 'green', 'o‘tkazgich egri chizig‘i o‘rtasi +10');
  assert.equal(gaugeLevel(1511, 4, '1/11', 'asosiy'), 'red', 'mutlaq chegara 1512');
  assert.equal(gaugeLevel(1525, 6, '1/11', 'asosiy'), 'yellow');
  assert.equal(gaugeLevel(1525, 6, '1/9', 'qabul'), 'green', 'qabul 1/9 boKovoy = 1524');
  assert.equal(gaugeLevel(1531, 4, '1/9', 'qabul'), 'green', 'qabul 1/9 o‘rtasi 1521 +10');
  assert.equal(gaugeLevel('', 0, '1/11', 'asosiy'), '');
});

test('boshqa o‘lchovlar', () => {
  assert.equal(cellLevel('ur', -7, A), 'yellow');
  assert.equal(cellLevel('ur', 11, A), 'red');
  assert.equal(cellLevel('g', 46, A, 0), 'green');
  assert.equal(cellLevel('g', 46, A, 1), 'yellow');
  assert.equal(cellLevel('g', 49, { ...A, marka: '1/9' }, 0), 'green');
  assert.equal(cellLevel('w', 7, A), 'yellow');
  assert.equal(cellLevel('w', 7, { ...A, type: 'R-50' }), 'yellow');
  assert.equal(cellLevel('w', 6, { ...A, type: 'R-43' }), 'red');
  assert.equal(cellLevel('chip', 160, A), 'yellow');
  assert.equal(cellLevel('chip', 160, { ...A, lineCategory: 'qabul' }), 'green');
  assert.equal(cellLevel('gruz', 55, { ...A, marka: '1/9' }), 'red');
  assert.equal(cellLevel('p1', 1471, A), 'red');
  assert.equal(cellLevel('p1', 1474, { ...A, marka: '1/9' }), 'red');
  assert.equal(cellLevel('p2', 1436, A), 'red');
  assert.equal(cellLevel('ponijenie', 1.6, A), 'yellow');
  assert.equal(cellLevel('shag', 150, A), 'red');
  assert.equal(cellLevel('shag', 2, A), 'green');
  assert.equal(cellLevel('pm50', -40, A), 'yellow');
  assert.equal(cellLevel('d5160', 5172, A), 'red');
  assert.equal(cellLevel('ugon', 1338, A), 'green', 'ilgari 1520 me’yori bilan doim qizil edi');
  assert.equal(cellLevel('ugon', 1342, A), 'red');
  assert.equal(cellLevel('kor', 'неисправно', A), 'red');
  assert.equal(cellLevel('kor', 'Исправно', A), 'green');
  assert.equal(cellLevel('brusya', 'кустовая гниль', A), 'yellow');
  assert.equal(cellLevel('brusya', 'неисправно', A), 'red');
  assert.equal(cellLevel('prileganie', 'зазор 5 мм', A), 'red');
  assert.equal(cellLevel('sh', '1520,5', A, 0), 'green', 'vergul bilan yozilgan son');
  assert.equal(cellLevel('sh', 'abc', A, 0), '');
});

test('tekshiruv xulosasi', () => {
  assert.equal(recordStatus({}, A), 'none');
  assert.equal(recordStatus({ sh0: 1520, ur0: 2 }, A), 'ok');
  assert.equal(recordStatus({ sh0: 1520, ur0: 8 }, A), 'warning');
  const issues = recordIssues({ sh0: 1530, ur0: 8, w0: 3, gruz: 70 }, A);
  assert.deepEqual(issues.map((i) => [i.key, i.level]), [['sh0', 'red'], ['gruz', 'red'], ['ur0', 'yellow']]);
  assert.match(issues[0].label, /Стык рамных рельсов/);
  assert.equal(recordStatus({ sh0: 1530 }, A), 'danger');
  assert.deepEqual(liveStats({ gruz: '45', w0: 3, w2b: '5', g1: 44 }), { load: 45, wear: 5, gutter: 44 });
  assert.match(normText('g', A, 0), /45–48/);
});

test('jadval tuzilishi eski jurnal bilan bir xil', () => {
  const h = headerCells();
  const width = Math.max(...h.map((x) => x.c + x.cs));
  assert.equal(width, TOTAL_COLS);
  assert.equal(TOTAL_COLS, 40);
  const covered = new Set();
  h.forEach((x) => { for (let i = 0; i < x.rs; i++) for (let j = 0; j < x.cs; j++) covered.add(`${x.r + i},${x.c + j}`); });
  assert.equal(covered.size, 3 * TOTAL_COLS, 'sarlavhada bo‘sh joy yo‘q');
  const leaf = [];
  h.forEach((x) => { if (x.r + x.rs === 3) for (let j = 0; j < x.cs; j++) leaf[x.c + j] = x.id; });
  const expected = ['date', 'ur_sh', ...COLUMNS.slice(0, 14).map((c) => c.id), 'pr_bk', ...COLUMNS.slice(14).map((c) => c.id)];
  assert.deepEqual(leaf, expected);
  assert.equal(new Set(CELLS.map((c) => c.key)).size, CELLS.length, 'maydon kalitlari takrorlanmaydi');
  const rc = recordCells({ sh0: 1530 }, A, '31.10.2026');
  const body = new Set();
  rc.forEach((x) => { for (let i = 0; i < (x.rs || 1); i++) body.add(`${x.r + i},${x.c}`); });
  assert.equal(body.size, 2 * TOTAL_COLS);
  assert.equal(rc.find((x) => x.v === 1530).level, 'red');
  assert.equal(HEADER.length, 3);
});

test('Excel: kataklar, birlashtirish, ranglar', async () => {
  const bytes = await buildXlsx([{ name: 'Стр 1', cells: [
    { r: 0, c: 0, v: 'Sarlavha', cs: 3, s: XS.title },
    { r: 1, c: 0, v: 1530, s: XS.red }, { r: 1, c: 1, v: '1520', s: XS.green }, { r: 1, c: 2, v: 'Test & <x>', s: XS.cell },
  ] }]);
  const wb = await readXlsx(bytes);
  assert.equal(wb.sheets[0].name, 'Стр 1');
  assert.equal(wb.sheets[0].cells['0,0'].v, 'Sarlavha');
  assert.equal(wb.sheets[0].cells['1,0'].v, 1530);
  assert.equal(wb.sheets[0].cells['1,1'].v, 1520, 'son matni songa aylanadi');
  assert.equal(wb.sheets[0].cells['1,2'].v, 'Test & <x>');
});

test('sxema nuqtalari va telefon bosqichlari barcha maydonlarni qamrab oladi', async () => {
  const { NODES, OTHER_KEYS, STEPS, worstLevel, nodeDetail, fieldInfo } = await import('../../src/components/pu29/switchSchema.js');
  const all = new Set(CELLS.map((c) => c.key));
  const inNodes = new Set([...NODES.flatMap((n) => n.keys), ...OTHER_KEYS]);
  const inSteps = new Set(STEPS.flatMap((s) => s.keys));
  assert.deepEqual([...all].filter((k) => !inNodes.has(k)), [], 'sxemada yo‘q maydon');
  assert.deepEqual([...all].filter((k) => !inSteps.has(k)), [], 'telefon bosqichlarida yo‘q maydon');
  assert.equal(inSteps.size, STEPS.flatMap((s) => s.keys).length, 'bosqichlarda takror yo‘q');
  assert.ok([...inNodes].every((k) => all.has(k)));
  assert.equal(worstLevel(['sh1', 'ur1'], { sh1: 1534, ur1: 4 }, A), 'red');
  assert.equal(worstLevel(['sh1'], {}, A), '');
  const d = nodeDetail(NODES[1], { sh1: 1527 }, { sh1: 1524 }, A);
  assert.equal(d[0].trend, 'up');
  assert.equal(d[0].level, 'green');
  assert.match(fieldInfo('p1b').label, /yon yo‘l/);
});
