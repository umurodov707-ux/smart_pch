/**
 * PU-74 jurnali: model, formulalar, eksport va bo'limlardan to'ldirish testlari.
 * Ishga tushirish: npm run test:pu74   (tashqi kutubxona kerak emas, Node 18+)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as M from '../../src/components/pu74/journalModel.js';
import { buildJournalXlsx } from '../../src/components/pu74/xlsxExport.js';
import {
  PROVIDERS, SHEET, fetchNeeds, fillBlanks, sameperson, shortName, timesheetValue,
} from '../../src/components/pu74/integrations.js';
import { readXlsx } from './readXlsx.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEMPLATE = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/components/pu74/pu74Template.json'), 'utf8'));
const fileBytes = (b) => fs.readFileSync(path.join(ROOT, 'server', 'templates', 'pu74', `${b}-brigada.xlsx`));
const cache = new Map();
async function model(b = 1) {
  if (!cache.has(b)) cache.set(b, await readXlsx(fileBytes(b)));
  return cache.get(b);
}
const views = (m, edits = {}) => {
  const { sheets } = M.computeWorkbook(m, edits);
  return TEMPLATE.sheets.map((tpl, si) => ({ tpl, cells: sheets[si].cells, analysis: M.analyzeSheet(tpl, sheets[si].cells) }));
};
const v = (sheets, si, ref) => {
  const p = /^([A-Z]+)(\d+)$/.exec(ref);
  const cell = sheets[si].cells[M.cellKey(Number(p[2]) - 1, M.colIndex(p[1]))];
  return cell ? cell.v : null;
};

// ---------------------------------------------------------------------------
test('formulalar Excel saqlagan natija bilan bir xil (uchala brigada)', async () => {
  for (const b of [1, 2, 3]) {
    const m = await model(b);
    const { sheets, errors } = M.computeWorkbook(m, {});
    assert.deepEqual(errors, []);
    let count = 0;
    m.sheets.forEach((s, si) => {
      for (const [k, cell] of Object.entries(s.cells)) {
        if (!cell.f) continue;
        count++;
        assert.equal(M.formatValue(sheets[si].cells[k].v), M.formatValue(cell.v), `${b}-brigada ${s.name} ${k} = ${cell.f}`);
      }
    });
    assert.equal(count, 1006);
  }
});

test('qiymat o‘zgarsa bog‘liq formulalar qayta hisoblanadi', async () => {
  const m = await model();
  const { sheets } = M.computeWorkbook(m, { '2_6_10': 40 }); // 4-5 bet, K7: 1-kun soati 36 -> 40
  assert.equal(v(sheets, 2, 'K7'), 40);
  assert.equal(Math.round(v(sheets, 2, 'K8') * 10) / 10, 421.9); // hajm = 40 / 0.948 * 10
  assert.equal(v(sheets, 2, 'AA7'), 388);                          // oy jami 384 -> 388
  assert.equal(v(sheets, 2, 'K36'), 68);                           // kun jami 64 -> 68
});

test('formula tahlilchisi', () => {
  const m = { sheets: [{ name: 'A', cells: { '0,0': { v: 2 }, '0,1': { v: 3 }, '0,2': { f: 'SUM(A1:B1)*2-1/4+ROUND(1.26,1)' }, '0,3': { f: '+C1/0' }, '0,4': { f: "+'B b'!A1" } } }, { name: 'B b', cells: { '0,0': { v: 7 } } }] };
  const { sheets, errors } = M.computeWorkbook(m, {});
  assert.equal(sheets[0].cells['0,2'].v, 11.05);
  assert.equal(sheets[0].cells['0,3'].v, 0, 'nolga bo‘lish 0 beradi');
  assert.equal(sheets[0].cells['0,4'].v, 7);
  assert.deepEqual(errors, []);
  const loop = M.computeWorkbook({ sheets: [{ name: 'A', cells: { '0,0': { f: 'B1' }, '0,1': { f: 'A1' } } }] }, {});
  assert.ok(loop.errors.some((e) => /Aylanma/.test(e)));
});

test('formatlash', () => {
  assert.equal(M.formatValue(379.746835), '379,7');
  assert.equal(M.formatValue(0.948), '0,948');
  assert.equal(M.formatValue(0), '');
  assert.equal(M.formatValue(0, { blankZero: false }), '0');
  assert.equal(M.formatValue('8'), '8');
  assert.equal(M.formatValue('Nazarov S '), 'Nazarov S');
});

test('varaq tuzilishi: ikki bet, kunlar, jami va tabel tekshiruvi', async () => {
  const vs = views(await model());
  const p = vs[SHEET.plan1];
  assert.equal(M.findSplit(p.tpl), 10, '4-bet A–J, 5-bet K–AD');
  assert.equal(p.analysis.dayCols.size, 15);
  assert.equal(p.analysis.totalRow, 35);
  assert.equal(p.analysis.checkRow, 37);
  assert.equal(p.analysis.groups.length, 16);
  assert.deepEqual([...p.analysis.mismatches].sort(), ['37,19', '37,20'], '10- va 11-kun tabelga mos emas');
  assert.deepEqual([...p.analysis.offDays].map((c) => p.analysis.dayCols.get(c)), [6, 7, 8, 13, 14]);
  assert.equal(M.findSplit(vs[SHEET.tabel].tpl), 13);
  assert.equal(M.findSplit(vs[SHEET.cover].tpl), -1);
});

test('yangi oy: reja qoladi, kunlik qiymatlar tozalanadi', async () => {
  const m = await model();
  const edits = M.carryOverEdits(m, TEMPLATE.sheets, { '2_6_10': 40 });
  const { sheets } = M.computeWorkbook(m, edits);
  assert.equal(v(sheets, 2, 'K7'), '');
  assert.equal(v(sheets, 2, 'AA7'), 0);
  assert.equal(v(sheets, 2, 'J7'), 390, 'topshiriq qoladi');
  assert.match(String(v(sheets, 2, 'C7')), /^Выправка/);
  assert.equal(v(sheets, 1, 'B11'), 'Nazarov S', 'xodimlar qoladi');
  assert.equal(v(sheets, 1, 'S11'), 0, 'tabel soatlari tozalandi');
});

test('oylar', () => {
  assert.equal(M.monthLabel('2026-11'), 'Noyabr 2026');
  assert.equal(M.shiftMonth('2026-12', 1), '2027-01');
  assert.equal(M.shiftMonth('2026-01', -1), '2025-12');
  assert.equal(M.currentMonth(new Date(2026, 9, 30)), '2026-10');
});

test('Excel eksport: qiymatlar yoziladi, shakl va formulalar saqlanadi', async () => {
  const m = await model();
  const edits = { '2_6_10': 40, '1_10_1': 'Test & <Ism>', '2_7_10': 5, '9_8_20': 4.5 };
  const { sheets } = M.computeWorkbook(m, edits);
  const out = await buildJournalXlsx(fileBytes(1), sheets);
  const back = await readXlsx(out);
  const re = M.computeWorkbook(back, {});
  sheets.forEach((s, si) => {
    for (const [k, cell] of Object.entries(s.cells)) {
      const got = re.sheets[si].cells[k];
      assert.equal(M.formatValue(got && got.v), M.formatValue(cell.v), `${s.name} ${k}`);
      if (cell.f && !cell.edited) assert.ok(got && got.f, `${s.name} ${k} formulasi saqlanishi kerak`);
    }
  });
  assert.equal(v(back.sheets, 2, 'K8'), 5, 'qo‘lda yozilgan formula katagi qiymat bo‘ladi');
  assert.equal(back.sheets[2].cells[M.cellKey(7, 10)].f, undefined);
  assert.equal(v(back.sheets, 1, 'B11'), 'Test & <Ism>');
  const { readZip } = await import('../../src/components/pu74/xlsxExport.js');
  const entries = await readZip(out);
  const wb = new TextDecoder().decode(entries.find((e) => e.name === 'xl/workbook.xml').data);
  assert.match(wb, /fullCalcOnLoad="1"/, 'Excel ochilganda qayta hisoblaydi');
  assert.ok(!entries.some((e) => e.name === 'xl/calcChain.xml'));
  const orig = await readZip(fileBytes(1));
  assert.equal(entries.length, orig.length - (orig.some((e) => e.name === 'xl/calcChain.xml') ? 1 : 0));
  const styles = (list) => new TextDecoder().decode(list.find((e) => e.name === 'xl/styles.xml').data);
  assert.equal(styles(entries), styles(orig), 'uslublar o‘zgarmagan');
});

// ---------------------------------------------------------------------------
// Bo'limlardan to'ldirish
// ---------------------------------------------------------------------------
const EMPLOYEES = [
  { id: 11, full_name: 'Nazarov Sardor Akmalovich', tabel_number: '216', rank: '4-razryad', status: 'active', position: 'монтёр пути' },
  { id: 12, full_name: 'Adambayev Aziz', tabel_number: '204', rank: '3', status: 'active', position: 'путевой обходчик', vacation_start_date: '2026-11-20', vacation_end_date: '2026-11-21' },
  { id: 13, full_name: 'Yangi Xodim', tabel_number: '500', rank: '2', status: 'active', position: 'обходчик' },
  { id: 14, full_name: 'Ketgan Odam', status: 'inactive' },
];
const DATA = {
  employees: EMPLOYEES,
  timesheet: { '11_1': 'Я', '11_3': 'Б', '11_16': '7', '13_1': 'Я' },
  defects: [
    { km: 4120, pk: 3, degree: 4, issue: 'Ширина колеи', status: 'active' },
    { km: 4124, pk: 1, degree: 3, issue: 'Дефект рельса', status: 'active' },
    { km: 4125, pk: 2, degree: 2, issue: 'Негодные шпалы', status: 'active' },
    { km: 4999, pk: 1, degree: 1, issue: 'Boshqa', status: 'active' },
  ],
  vehicles: [{ name: 'ЭШП-9', number: '01', status: 'active' }, { name: 'ЭШП-9', number: '02', status: 'repair' }],
  izostiklar: [{ last_date: '2026-11-05', history: [{ date: '2026-11-05', action: 'Rebuilt' }] }, { last_date: '2026-11-20' }, { last_date: '2025-01-01' }],
  plets: [{ plet_number: '7', start_km: 4120, end_km: 4121, length: 800, install_date: '12.11.2026' }],
};
async function run(id) {
  const m = await model();
  const vs = views(m);
  const ctx = {
    views: vs, month: '2026-11', styles: TEMPLATE.styles, bolinmaId: "1-bo'linma",
    original: (si, r, c) => { const x = m.sheets[si].cells[M.cellKey(r, c)]; return x ? x.v : null; },
  };
  const res = PROVIDERS.find((p) => p.id === id).build(ctx, DATA);
  const at = (si, ref) => {
    const p = /^([A-Z]+)(\d+)$/.exec(ref);
    const ch = res.changes.find((x) => x.si === si && x.r === Number(p[2]) - 1 && x.c === M.colIndex(p[1]));
    return ch ? ch.value : undefined;
  };
  return { ...res, at };
}

test('yordamchilar: ism solishtirish, belgilar, bo‘sh joylarni to‘ldirish', () => {
  assert.ok(sameperson('Nazarov S', 'Nazarov Sardor'));
  assert.ok(sameperson("G'aybullayev A", 'Gʻaybullayev Akmal'));
  assert.ok(sameperson('Назаров С', 'Nazarov Sardor'));
  assert.ok(!sameperson('Nazarov S', 'Nazarov Bobur'));
  assert.equal(shortName('Nazarov Sardor Akmalovich'), 'Nazarov S.');
  assert.equal(timesheetValue('Я'), 8);
  assert.equal(timesheetValue('7'), 7);
  assert.equal(timesheetValue('Б'), 'Б');
  assert.equal(timesheetValue('В'), '');
  assert.equal(fillBlanks('Выполнение задания в чел/час.______', [680]), 'Выполнение задания в чел/час. 680 ');
});

test('2–3 bet: tabel HR bilan', async () => {
  const r = await run('tabel');
  assert.equal(r.at(SHEET.tabel, 'C11'), undefined, '1-kun 8 edi, Я = 8 — o‘zgarmaydi');
  assert.equal(r.at(SHEET.tabel, 'E11'), 'Б', '3-kun kasallik');
  assert.equal(r.at(SHEET.tabel, 'F11'), undefined, 'HR tabelida yo‘q kun tegilmaydi');
  assert.equal(r.at(SHEET.tabel, 'C12'), 7, '16-kun pastki qatorda');
  assert.equal(r.at(SHEET.tabel, 'U11'), 4, 'razryad');
  assert.ok(r.notes.some((n) => /topilmadi/.test(n) && /Satturdiyev Q/.test(n)));
  assert.ok(r.notes.some((n) => /Yangi X/.test(n)), 'tabelda bor, jurnalda yo‘q xodim');
});

test('4–7 bet: nosozliklar ish turiga qarab', async () => {
  const r = await run('defects');
  assert.match(String(r.at(SHEET.plan1, 'B25')), /4120 km pk 3$/);      // kolea kengligi qatori
  assert.equal(r.at(SHEET.plan2, 'B25'), r.at(SHEET.plan1, 'B25'), '6–7 betga ham');
  assert.equal(r.at(SHEET.plan1, 'B31'), undefined, '4124 km pk 1 rels qatorida allaqachon bor — takrorlanmaydi');
  assert.equal(r.at(SHEET.plan1, 'B27'), '4125 km pk 2');               // shpal
  assert.ok(r.notes.some((n) => /4999 km/.test(n)));
});

test('1-bet: natijalar hisobi', async () => {
  const r = await run('cover');
  const texts = r.changes.map((c) => String(c.value));
  assert.ok(texts.some((t) => /участка на ноябрь м-ц 2026 г\./.test(t)));
  assert.ok(texts.some((t) => /расчетный 9 чел\. 1384 чел\.\/час/.test(t)));
  assert.ok(texts.some((t) => /наряд-задания 96\.5%/.test(t)), '1384 / (716 + 718)');
  assert.ok(texts.some((t) => /нормы выработки 100%/.test(t)));
});

test('8–9, 10, 11–12, 13–14 betlar', async () => {
  const mech = await run('mechanics');
  assert.equal(mech.at(SHEET.mech1, 'E7'), 1, 'faqat ishlayotgan ЭШП-9');
  assert.ok(mech.notes.some((n) => /repair/.test(n)));

  const walk = await run('walkers');
  assert.equal(walk.at(SHEET.walkers, 'C7'), 'Yangi X.', 'bo‘sh qatorga obxodchi');

  const mat = await run('materials');
  assert.equal(mat.changes.filter((c) => c.si === SHEET.mat1).length, 2, '5-kun: yangi yotqizildi + eski olindi');
  assert.equal(mat.changes.filter((c) => c.si === SHEET.mat2).length, 2, '20-kun');
  assert.ok(mat.notes.some((n) => /№7/.test(n)));

  const cond = await run('condition');
  assert.equal(cond.at(SHEET.cond1, 'K8'), 1, '4124 km: o‘tkir defektli rels');
  assert.equal(cond.at(SHEET.cond1, 'L9'), 1, '4125 km: yaroqsiz shpallar');
});

test('fetchNeeds: to‘g‘ri manzillar, xato bo‘lsa davom etadi', async () => {
  const calls = [];
  const api = { get: async (u) => { calls.push(u); if (u.includes('mechanics')) throw new Error('500'); return u.includes('timesheet') ? { '1_1': 'Я' } : { data: [{ id: 1 }] }; } };
  const { data, errors } = await fetchNeeds(['employees', 'timesheet', 'vehicles'], { bolinmaId: "1-bo'linma", month: '2026-11' }, api);
  assert.deepEqual(data.employees, [{ id: 1 }]);
  assert.deepEqual(data.timesheet, { '1_1': 'Я' });
  assert.deepEqual(data.vehicles, []);
  assert.equal(errors.length, 1);
  assert.ok(calls.includes('/api/timesheet/2026/11?bolinma_id=1-bo\'linma'));
});
