/**
 * Kunlik hisobotlar: node --test server/scripts/test-daily-reports.js
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_kalit_'.repeat(4);
const test = require('node:test');
const assert = require('node:assert');

let DatabaseSync;
try { ({ DatabaseSync } = require('node:sqlite')); } catch (e) {
    test('node:sqlite yo‘q — o‘tkazib yuborildi', { skip: true }, () => {});
    return;
}
const { initSchema } = require('../schema_manager');
const { createDailyReportsService, localParts } = require('../services/dailyReports');

function makeDb() {
    const raw = new DatabaseSync(':memory:');
    return {
        raw,
        isPostgres: false,
        exec: async (sql) => raw.exec(sql),
        get: (sql, p, cb) => { try { cb(null, raw.prepare(sql).get(...p)); } catch (e) { cb(e); } },
        all: (sql, p, cb) => { try { cb(null, raw.prepare(sql).all(...p)); } catch (e) { cb(e); } },
        run: (sql, p, cb) => {
            try { const r = raw.prepare(sql).run(...p); if (cb) cb.call({ lastID: Number(r.lastInsertRowid), changes: Number(r.changes) }, null); } catch (e) { if (cb) cb(e); }
        },
    };
}

const U = {
    b1: { id: 1, username: 'brigadir1', role: 'bolinma', bolinmalar: ["1-bo'linma"], departments: [] },
    b1legacy: { id: 5, username: 'bolinma1', role: 'bolinma', bolinmalar: [], departments: [] },
    b3: { id: 3, username: 'b3', role: 'bolinma', bolinmalar: ['bolinma3'], departments: [] },
    disp: { id: 2, username: 'dispetcher', role: 'department', bolinmalar: [], departments: ['dispetcher'] },
    mex: { id: 4, username: 'mexanik', role: 'department', bolinmalar: [], departments: ['mexanika'] },
    admin: { id: 9, username: 'admin', role: 'admin', bolinmalar: [], departments: [] },
};

async function setup(nowIso) {
    const db = makeDb();
    const log = console.log; const err = console.error; console.log = () => {};
    await initSchema(db);
    console.log = log; console.error = err;
    let clock = Date.parse(nowIso);
    const emitted = [];
    const io = { to(r) { const rooms = [r]; const c = { to(x) { rooms.push(x); return c; }, emit(ev, p) { emitted.push({ rooms, ev, p }); } }; return c; } };
    const s = createDailyReportsService(db, { now: () => clock });
    const call = (h, { user, body = {}, params = {}, query = {} }) => new Promise((resolve) => {
        const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(d) { resolve({ status: this.statusCode, data: d }); } };
        h({ user, body, params, query, app: { get: () => io } }, res);
    });
    return { s, call, db, emitted, setClock: (iso) => { clock = Date.parse(iso); } };
}

test('Toshkent vaqti: tungi 02:30 dagi hisobot shu kunga yoziladi (ilgari kechagi kunga)', async () => {
    assert.deepStrictEqual(localParts(Date.parse('2026-10-31T21:30:00Z')), { date: '2026-11-01', time: '02:30' });
    const t = await setup('2026-10-31T21:30:00Z'); // Toshkentda 1-noyabr 02:30
    const r = await t.call(t.s.submit, { user: U.b1, body: { structuredData: { planData: [1] } } });
    assert.strictEqual(r.status, 200, JSON.stringify(r.data));
    assert.strictEqual(r.data.date, '2026-11-01');
    assert.strictEqual(r.data.time, '02:30');
});

test('bo‘linma nomlari: "bolinma1" va "1-bo‘linma" bitta bo‘linma; dispetcher ko‘radi', async () => {
    const t = await setup('2026-10-31T12:00:00Z');
    let r = await t.call(t.s.submit, { user: U.b1, body: { bolinma_id: 'bolinma1', structuredData: { a: 1 } } });
    assert.strictEqual(r.status, 200, 'ilgari 403 edi');
    r = await t.call(t.s.submit, { user: U.b1legacy, body: { bolinma_id: "1-bo'linma", structuredData: { a: 2 } } });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.version, 2, 'eski nomli hisob ham o‘sha hisobotni yangilaydi');
    // eski ko'rinishda saqlangan yozuv ham topiladi
    t.db.raw.prepare("INSERT INTO reports (bolinma_id, date, time, structuredData) VALUES ('bolinma3', '2026-10-31', '17:00', '{\"x\":1}')").run();
    r = await t.call(t.s.list, { user: U.disp, query: { date: '2026-10-31' } });
    assert.deepStrictEqual(r.data.map((x) => x.bolinma_key).sort(), ['bolinma1', 'bolinma3']);
    assert.ok(r.data.every((x) => x.status === 'submitted'));
    r = await t.call(t.s.submit, { user: U.b3, body: { structuredData: { y: 1 } } });
    assert.strictEqual(r.data.version, 2, 'eski "bolinma3" yozuvi yangilandi, ikkinchisi yaratilmadi');
    assert.strictEqual(t.db.raw.prepare('SELECT COUNT(*) c FROM reports').get().c, 2);
});

test('kim yubora oladi', async () => {
    const t = await setup('2026-10-31T12:00:00Z');
    assert.strictEqual((await t.call(t.s.submit, { user: U.b1, body: { bolinma_id: 'bolinma2' } })).status, 403);
    assert.strictEqual((await t.call(t.s.submit, { user: U.mex, body: { bolinma_id: 'bolinma2' } })).status, 403, 'mexanika bo‘limi emas');
    assert.strictEqual((await t.call(t.s.submit, { user: U.disp, body: {} })).status, 400, 'dispetcher bo‘linmani tanlashi kerak');
    assert.strictEqual((await t.call(t.s.submit, { user: U.disp, body: { bolinma_id: 'bolinma6' } })).status, 200, 'dispetcher bo‘linma nomidan kiritadi');
    assert.strictEqual((await t.call(t.s.submit, { user: U.b1, body: { date: '2026-11-01' } })).status, 400, 'kelajak');
    assert.strictEqual((await t.call(t.s.submit, { user: U.b1, body: { date: '2026-10-30' } })).status, 200, 'kecha');
    assert.strictEqual((await t.call(t.s.submit, { user: U.b1, body: { date: '2026-10-29' } })).status, 403, 'undan eskisi — faqat dispetcher');
    assert.strictEqual((await t.call(t.s.submit, { user: U.disp, body: { bolinma_id: 'bolinma1', date: '2026-10-29' } })).status, 200);
    assert.strictEqual((await t.call(t.s.submit, { user: U.b1, body: { structuredData: 'matn' } })).status, 400);
});

test('tarix, ko‘rib chiqish va real vaqt xabarlari', async () => {
    const t = await setup('2026-10-31T12:00:00Z');
    const a = await t.call(t.s.submit, { user: U.b1, body: { structuredData: { v: 1 } } });
    assert.deepStrictEqual(t.emitted[0].rooms, ['scope:all', "scope:1-bo'linma"]);
    assert.strictEqual(t.emitted[0].ev, 'report_submitted');
    const id = a.data.id;
    assert.strictEqual((await t.call(t.s.review, { user: U.b1, params: { id }, body: { action: 'accept' } })).status, 403, 'bo‘linma o‘zini qabul qila olmaydi');
    assert.strictEqual((await t.call(t.s.review, { user: U.disp, params: { id }, body: { action: 'return' } })).status, 400, 'izohsiz qaytarib bo‘lmaydi');
    let r = await t.call(t.s.review, { user: U.disp, params: { id }, body: { action: 'return', comment: 'Davomat jami mos emas' } });
    assert.strictEqual(r.data.status, 'returned');
    r = await t.call(t.s.list, { user: U.b1, query: { date: '2026-10-31' } });
    assert.strictEqual(r.data[0].review_comment, 'Davomat jami mos emas', 'bo‘linma izohni ko‘radi');
    t.setClock('2026-10-31T13:10:00Z');
    await t.call(t.s.submit, { user: U.b1, body: { structuredData: { v: 2 } } });
    r = await t.call(t.s.list, { user: U.disp, query: { date: '2026-10-31' } });
    assert.strictEqual(r.data[0].status, 'submitted', 'qayta yuborilgach yana ko‘rib chiqiladi');
    assert.strictEqual(r.data[0].structuredData.v, 2);
    assert.strictEqual(r.data[0].time, '18:10');
    await t.call(t.s.review, { user: U.disp, params: { id }, body: { action: 'accept' } });
    const v = await t.call(t.s.versions, { user: U.disp, params: { id } });
    assert.deepStrictEqual(v.data.map((x) => x.action), ['submit', 'return', 'resubmit', 'accept']);
    assert.deepStrictEqual(v.data.map((x) => x.username), ['brigadir1', 'dispetcher', 'brigadir1', 'dispetcher']);
    assert.ok(t.emitted.some((e) => e.ev === 'report_reviewed' && e.p.status === 'accepted'));
});

test('eslatma faqat dispetcherdan va faqat tanlangan bo‘linmalarga', async () => {
    const t = await setup('2026-10-31T13:40:00Z');
    assert.strictEqual((await t.call(t.s.remind, { user: U.b1, body: { bolinmalar: ['bolinma2'] } })).status, 403);
    assert.strictEqual((await t.call(t.s.remind, { user: U.disp, body: { bolinmalar: [] } })).status, 400);
    const r = await t.call(t.s.remind, { user: U.disp, body: { bolinmalar: ['bolinma6', "8-bo'linma", 'x'] } });
    assert.strictEqual(r.data.sent, 2);
    assert.deepStrictEqual(t.emitted.map((e) => e.rooms[1]), ["scope:6-bo'linma", "scope:8-bo'linma"]);
    assert.strictEqual(t.emitted[0].p.at, '18:40');
});
