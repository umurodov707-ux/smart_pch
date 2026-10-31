/**
 * PU-74 jurnali xizmati testlari.
 * Ishga tushirish: node --test server/scripts/test-pu74-journal.js
 * (Node 22.5+ — ichki node:sqlite ishlatiladi, haqiqiy baza kerak emas)
 */
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

let DatabaseSync;
try {
    ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
    test('node:sqlite mavjud emas — o‘tkazib yuborildi', { skip: true }, () => {});
    return;
}
const { initSchema } = require('../schema_manager');
const { createPu74JournalService, sanitizeEdits } = require('../services/pu74Journal');

/** server/db.js bilan bir xil callback interfeysi */
function makeDb() {
    const raw = new DatabaseSync(':memory:');
    return {
        isPostgres: false,
        exec: async (sql) => raw.exec(sql),
        get: (sql, params, cb) => { try { cb(null, raw.prepare(sql).get(...params)); } catch (e) { cb(e); } },
        all: (sql, params, cb) => { try { cb(null, raw.prepare(sql).all(...params)); } catch (e) { cb(e); } },
        run: (sql, params, cb) => {
            try {
                const r = raw.prepare(sql).run(...params);
                if (cb) cb.call({ lastID: Number(r.lastInsertRowid), changes: Number(r.changes) }, null);
            } catch (e) { if (cb) cb(e); }
        },
    };
}

function call(handler, { params, body, user }) {
    return new Promise((resolve) => {
        const res = {
            statusCode: 200,
            status(c) { this.statusCode = c; return this; },
            json(data) { resolve({ status: this.statusCode, data }); return this; },
        };
        handler({ params, body, user, app: { get: () => null } }, res);
    });
}

const bolinma = { id: 1, username: 'brigadir', role: 'bolinma' };
const dept = { id: 2, username: 'yol_ustasi', role: 'department' };
const admin = { id: 3, username: 'admin', role: 'admin' };

async function setup() {
    const db = makeDb();
    const origLog = console.log; const origErr = console.error;
    await initSchema(db);
    console.log = origLog; console.error = origErr;
    return createPu74JournalService(db, { publicDir: path.join(__dirname, '..', '..', 'public') });
}

test('tahrirlarni tekshirish', () => {
    assert.deepStrictEqual(sanitizeEdits({ '2_6_10': 40, '1_3_4': 'b', '0_1_1': null }).edits, { '2_6_10': 40, '1_3_4': 'b', '0_1_1': '' });
    assert.ok(sanitizeEdits({ 'x': 1 }).error);
    assert.ok(sanitizeEdits({ '1_1_1': { a: 1 } }).error);
    assert.ok(sanitizeEdits({ '1_1_1': 'x'.repeat(501) }).error);
    assert.ok(sanitizeEdits([1, 2]).error);
});

test('noto‘g‘ri brigada va oy', async () => {
    const s = await setup();
    assert.strictEqual((await call(s.get, { params: { brigade: '../etc', month: '2026-10' }, user: admin })).status, 404);
    assert.strictEqual((await call(s.get, { params: { brigade: '9-brigada', month: '2026-10' }, user: admin })).status, 404);
    assert.strictEqual((await call(s.get, { params: { brigade: '1-brigada', month: '2026-13' }, user: admin })).status, 400);
    assert.strictEqual((await call(s.get, { params: { brigade: '1-brigada', month: '2026-11' }, user: admin })).status, 404);
});

test('to‘liq jarayon: ochish, saqlash, versiya, topshirish, qaytarish, tasdiqlash, qayta ochish', async () => {
    const s = await setup();
    const P = { brigade: '1-brigada', month: '2026-11' };

    let r = await call(s.save, { params: P, body: { edits: { '2_6_10': 36 } }, user: bolinma });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.data.version, 1);
    assert.strictEqual(r.data.status, 'draft');

    r = await call(s.save, { params: P, body: { edits: { '2_6_10': 40 }, version: 1 }, user: bolinma });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.version, 2);
    assert.deepStrictEqual(r.data.edits, { '2_6_10': 40 });

    // eski versiya bilan saqlash — ziddiyat
    r = await call(s.save, { params: P, body: { edits: { '2_6_10': 41 }, version: 1 }, user: bolinma });
    assert.strictEqual(r.status, 409);
    assert.deepStrictEqual(r.data.journal.edits, { '2_6_10': 40 });

    // bo'linma tasdiqlay olmaydi
    r = await call(s.setStatus, { params: P, body: { action: 'approve' }, user: bolinma });
    assert.strictEqual(r.status, 403);

    r = await call(s.setStatus, { params: P, body: { action: 'submit' }, user: bolinma });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.status, 'submitted');
    assert.strictEqual(r.data.submitted_by, 'brigadir');
    assert.strictEqual(r.data.can_edit, false);

    // topshirilgandan keyin bo'linma o'zgartira olmaydi
    r = await call(s.save, { params: P, body: { edits: {}, version: r.data.version }, user: bolinma });
    assert.strictEqual(r.status, 423);

    // sababsiz qaytarib bo'lmaydi
    r = await call(s.setStatus, { params: P, body: { action: 'return' }, user: dept });
    assert.strictEqual(r.status, 400);
    r = await call(s.setStatus, { params: P, body: { action: 'return', comment: '10-kun soatlari tabelga mos emas' }, user: dept });
    assert.strictEqual(r.data.status, 'returned');
    assert.strictEqual(r.data.comment, '10-kun soatlari tabelga mos emas');
    assert.strictEqual(r.data.can_edit, true);

    r = await call(s.save, { params: P, body: { edits: { '2_6_10': 44 }, version: r.data.version }, user: bolinma });
    assert.strictEqual(r.status, 200);
    r = await call(s.setStatus, { params: P, body: { action: 'submit' }, user: bolinma });
    r = await call(s.setStatus, { params: P, body: { action: 'approve' }, user: dept });
    assert.strictEqual(r.data.status, 'approved');
    assert.strictEqual(r.data.approved_by, 'yol_ustasi');

    // tasdiqlangan — hech kim o'zgartira olmaydi, faqat admin qayta ochadi
    assert.strictEqual((await call(s.save, { params: P, body: { edits: {}, version: r.data.version }, user: admin })).status, 423);
    assert.strictEqual((await call(s.setStatus, { params: P, body: { action: 'reopen' }, user: dept })).status, 403);
    r = await call(s.setStatus, { params: P, body: { action: 'reopen' }, user: admin });
    assert.strictEqual(r.data.status, 'draft');
    assert.strictEqual(r.data.approved_by, null);

    // noto'g'ri holatdan o'tish
    assert.strictEqual((await call(s.setStatus, { params: P, body: { action: 'approve' }, user: admin })).status, 409);

    r = await call(s.list, { params: { brigade: '1-brigada' }, user: bolinma });
    assert.deepStrictEqual(r.data.months.map((m) => m.month), ['2026-11']);
});

test('ikki kishi bir vaqtda yangi oy ochsa', async () => {
    const s = await setup();
    const P = { brigade: '2-brigada', month: '2026-12' };
    const [a, b] = await Promise.all([
        call(s.save, { params: P, body: { edits: { '1_1_1': 1 } }, user: bolinma }),
        call(s.save, { params: P, body: { edits: { '1_1_1': 2 } }, user: bolinma }),
    ]);
    const codes = [a.status, b.status].sort();
    assert.ok(codes[0] === 201 && (codes[1] === 409 || codes[1] === 200 || codes[1] === 201), codes.join(','));
});
