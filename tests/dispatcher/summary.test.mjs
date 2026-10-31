import test from 'node:test';
import assert from 'node:assert';
import { SECTIONS, sectionState, reportProgress, emptyReport, normalizeReport, cleanReport } from '../../src/components/dispatcher/sections.js';
import { boardRows, counts, lineMarks, totals, telegramText, excelSheets, railClass } from '../../src/components/dispatcher/summary.js';
import { parseKm, bolinmaNum } from '../../src/components/dispatcher/line.js';
import { buildXlsx, XS } from '../../src/components/pu29/pu29Xlsx.js';

const full = () => ({
  ...emptyReport(),
  planData: [{ location: '4030 km', work: 'Shpal' }],
  spravkaData: [{ putey: 'Rels almashtirish' }],
  tempData: [{ time: '14:00', info: '4102 km 3 pk', rail: '44' }, { time: '08:00', info: '4102 km', rail: '24' }],
  generalWarnRows: [{ km: '4098 km', speed: '40' }],
  attendance: [{ area: 'PDB-5', total: '26', fact: '23', otpusk: '2', sick: '1' }],
  defektData: [{ loc: '4109 km 4 pk', code: '21.2' }],
});

test('bo‘lim holatlari: to‘ldirilgan, bugun yo‘q, bo‘sh, xato', () => {
  const sd = full();
  const temp = SECTIONS.find((s) => s.key === 'temp');
  assert.strictEqual(sectionState(sd, temp).state, 'done');
  assert.strictEqual(sectionState(sd, temp).count, 2);
  const oyna = SECTIONS.find((s) => s.key === 'oyna');
  assert.strictEqual(sectionState(sd, oyna).state, 'empty');
  assert.strictEqual(sectionState({ ...sd, none: { oyna: true } }, oyna).state, 'none');
  // bo'sh qator hisobga olinmaydi
  assert.strictEqual(sectionState({ ...sd, oynaData: [{ time: '', loc: '' }] }, oyna).state, 'empty');
  // majburiy maydon
  const bad = sectionState({ ...sd, tempData: [{ time: '14:00', info: '4102 km' }] }, temp);
  assert.strictEqual(bad.state, 'error');
  assert.match(bad.problems[0], /Rels, °C kiritilmagan/);
  assert.match(sectionState({ ...sd, tempData: [{ time: '1', info: 'x', rail: 'issiq' }] }, temp).problems.join(), /son bo‘lishi kerak/);
});

test('davomat jami tekshiriladi (dispetcher qaytarishining eng ko‘p sababi)', () => {
  const att = SECTIONS.find((s) => s.key === 'attendance');
  assert.strictEqual(sectionState(full(), att).state, 'done');
  const st = sectionState({ attendance: [{ area: 'PDB-5', total: '19', fact: '17', sick: '1' }] }, att);
  assert.strictEqual(st.state, 'error');
  assert.match(st.problems[0], /ro‘yxatda 19, yozilgani 18/);
});

test('yuborishga tayyorlik', () => {
  let p = reportProgress(emptyReport());
  assert.strictEqual(p.canSubmit, false);
  assert.strictEqual(p.blockers.length, 5, 'reja, spravka, harorat, ogohlantirish, davomat');
  p = reportProgress(full());
  assert.strictEqual(p.canSubmit, true, p.blockers.join('; '));
  assert.strictEqual(p.filled, 6);
  const noWarn = { ...full(), generalWarnRows: [], none: { ogoh: true } };
  assert.strictEqual(reportProgress(noWarn).canSubmit, true, 'ogohlantirish “bugun yo‘q” bo‘lishi mumkin');
  assert.strictEqual(reportProgress({ ...full(), tempData: [] }).canSubmit, false, 'harorat “yo‘q” bo‘la olmaydi');
});

test('eski format bilan moslik', () => {
  const legacy = { planData: [{ work: 'x' }], dayWarnRows: [{ km: '4058', speed: '25' }], tempData: [{ rail: '30' }] };
  const n = normalizeReport(legacy);
  assert.deepStrictEqual(Object.keys(n).sort(), [...SECTIONS.map((s) => s.data), 'dayWarnRows', 'none'].sort());
  const ogoh = SECTIONS.find((s) => s.key === 'ogoh');
  assert.strictEqual(sectionState(n, ogoh).count, 1, 'eski kunlik ogohlantirishlar ham sanaladi');
  const c = cleanReport({ ...full(), planData: [{ work: 'x' }, { work: '' }] });
  assert.strictEqual(c.planData.length, 1);
});

test('dispetcher jadvali, liniya belgilari va jami', () => {
  const reports = [
    { id: 1, bolinma_id: "3-bo'linma", status: 'submitted', time: '17:52', structuredData: full() },
    { id: 2, bolinma_id: 'bolinma4', status: 'accepted', time: '17:31', structuredData: { ...full(), tempData: [{ time: '14:00', info: '4137 km', rail: '47' }] } },
    { id: 3, bolinma_id: "5-bo'linma", status: 'returned', time: '17:58', structuredData: emptyReport() },
  ];
  const rows = boardRows(reports, '18:40');
  assert.strictEqual(rows.length, 10);
  assert.deepStrictEqual(counts(rows), { all: 10, submitted: 1, returned: 1, missing: 7, accepted: 1 });
  assert.strictEqual(rows[0].late, true, '18:00 dan keyin yubormagan — kechikdi');
  assert.strictEqual(boardRows([], '17:00')[0].late, false);
  assert.strictEqual(rows[2].facts.maxRail, 44);
  assert.strictEqual(rows[2].facts.attFact, 23);
  const m = lineMarks(rows);
  assert.deepStrictEqual(m.warns.map((w) => [w.km, w.speed, w.n]), [[4098, 40, 3], [4098, 40, 4]]);
  assert.deepStrictEqual(m.defects.map((d) => d.km), [4109, 4109]);
  const t = totals(rows);
  assert.strictEqual(t.hottest.v, 47); assert.strictEqual(t.hottestN, 4);
  assert.strictEqual(t.attTotal, 52);
  assert.strictEqual(railClass(47), 'hot'); assert.strictEqual(railClass(43), 'warm'); assert.strictEqual(railClass(30), '');
  const tg = telegramText('2026-10-31', rows, '18:40');
  assert.match(tg, /^PCH-16, 31\.10\.2026, 18:40 holati/);
  assert.match(tg, /Yubordi: 3\/10 \(yubormagan: 1, 2, 6, 7, 8, 9, 10-bo‘linma\)/);
  assert.match(tg, /Rels harorati maks: 47°/);
  assert.match(tg, /Davomat: 46\/52/);
});

test('km ajratish', () => {
  assert.strictEqual(parseKm('4098 km 3 pk'), 4098);
  assert.strictEqual(parseKm('Qorlitog‘ 4137'), 4137);
  assert.strictEqual(parseKm('PDB-1'), null);
  assert.strictEqual(parseKm('2026'), null);
  assert.strictEqual(bolinmaNum("10-bo'linma"), 10);
});

test('yig‘ma Excel yaratiladi', async () => {
  const rows = boardRows([{ id: 1, bolinma_id: "3-bo'linma", status: 'accepted', time: '17:52', structuredData: full() }], '18:40');
  const sheets = excelSheets('2026-10-31', rows, XS);
  assert.strictEqual(sheets.length, 1 + SECTIONS.length);
  const bytes = await buildXlsx(sheets);
  assert.ok(bytes.length > 3000);
  assert.strictEqual(String.fromCharCode(bytes[0], bytes[1]), 'PK');
});
