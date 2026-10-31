/**
 * Bo'linmalar ajratilishi testlari: node --test server/scripts/test-bolinma-scope.js
 */
const test = require('node:test');
const assert = require('node:assert');

let DatabaseSync;
try { ({ DatabaseSync } = require('node:sqlite')); } catch (e) {
    test('node:sqlite yo‘q — o‘tkazib yuborildi', { skip: true }, () => {});
    return;
}
// guard'ga test bazasi beriladi (haqiqiy db.js yuklanmaydi)
const { bolinmaGuard, scopeOf, canSee, canon, filterPayload, RECORD_ROUTES } = require('../middleware/bolinmaScope');

function makeDb() {
    const raw = new DatabaseSync(':memory:');
    raw.exec(`CREATE TABLE defects (id INTEGER PRIMARY KEY, bolinma_id TEXT, km INTEGER, issue TEXT);
              CREATE TABLE material_acts (id INTEGER PRIMARY KEY, bolinma_num TEXT, work_desc TEXT);
              CREATE TABLE employees (id INTEGER PRIMARY KEY, bolinma_id TEXT, full_name TEXT);`);
    const ins = (sql, rows) => { const st = raw.prepare(sql); rows.forEach((r) => st.run(...r)); };
    ins('INSERT INTO defects VALUES (?, ?, ?, ?)', [[1, "1-bo'linma", 4120, 'a'], [2, 'bolinma2', 4200, 'b'], [3, null, 0, 'umumiy']]);
    ins('INSERT INTO material_acts VALUES (?, ?, ?)', [[7, '2', 'x']]);
    ins('INSERT INTO employees VALUES (?, ?, ?)', [[5, 'bolinma1', 'Nazarov'], [6, "2-bo'linma", 'Karimov']]);
    return { get: (sql, p, cb) => { try { cb(null, raw.prepare(sql).get(...p)); } catch (e) { cb(e); } } };
}

const U = {
    b1: { role: 'bolinma', username: 'brigadir', bolinmalar: ["1-bo'linma"] },
    b1legacy: { role: 'bolinma', username: 'bolinma1', bolinmalar: [] },
    b2: { role: 'bolinma', username: 'x', bolinmalar: '["bolinma2"]' },
    none: { role: 'bolinma', username: 'ali', bolinmalar: [] },
    deptAll: { role: 'department', bolinmalar: [], departments: ['iqtisod'] },
    deptTwo: { role: 'department', bolinmalar: ["2-bo'linma", '3-bo‘linma'], departments: ['ishlab-chiqarish'] },
    admin: { role: 'admin', bolinmalar: [] },
};

function run(prefix, { user, method = 'GET', path = '/', query = {}, body, payload }, database) {
    return new Promise((resolve) => {
        const res = {
            statusCode: 200,
            status(c) { this.statusCode = c; return this; },
            json(d) { resolve({ status: this.statusCode, data: d, nextCalled }); return this; },
        };
        let nextCalled = false;
        const req = { user, method, path, query, body };
        bolinmaGuard(prefix, { db: database })(req, res, () => {
            nextCalled = true;
            // marshrut javobi
            res.json(payload !== undefined ? payload : { ok: true });
        });
    });
}

test('nomlarni bir xil ko‘rinishga keltirish', () => {
    assert.strictEqual(canon('bolinma3'), "3-bo'linma");
    assert.strictEqual(canon("3-bo'linma"), "3-bo'linma");
    assert.strictEqual(canon('3-bo‘linma'), "3-bo'linma");
    assert.strictEqual(canon("Bo'linma 3"), "3-bo'linma");
    assert.strictEqual(canon('2-sex'), '2-sex');
    assert.strictEqual(canon('iqtisod'), null);
    assert.strictEqual(canon('3'), null, 'oddiy son bo‘linma emas (masalan, ID)');
});

test('kim nimani ko‘radi', () => {
    assert.deepStrictEqual(scopeOf(U.b1), ["1-bo'linma"]);
    assert.deepStrictEqual(scopeOf(U.b1legacy), ["1-bo'linma"], 'eski hisob — nomidan');
    assert.deepStrictEqual(scopeOf(U.b2), ["2-bo'linma"]);
    assert.deepStrictEqual(scopeOf(U.none), [], 'bo‘linmasi yo‘q — hech narsa');
    assert.strictEqual(scopeOf(U.deptAll), null);
    assert.deepStrictEqual(scopeOf(U.deptTwo), ["2-bo'linma", "3-bo'linma"]);
    assert.strictEqual(scopeOf(U.admin), null);
    assert.ok(canSee(["1-bo'linma"], 'bolinma1'));
    assert.ok(!canSee(["1-bo'linma"], "2-bo'linma"));
    assert.ok(canSee(["1-bo'linma"], null), 'umumiy yozuv');
});

test('manzil, query va body’dagi boshqa bo‘linma — 403', async () => {
    const d = makeDb();
    assert.strictEqual((await run('/api/defects', { user: U.b1, path: "/2-bo'linma" }, d)).status, 403);
    assert.strictEqual((await run('/api/defects', { user: U.b1, path: '/2-bo%27linma' }, d)).status, 403);
    assert.strictEqual((await run('/api/defects', { user: U.b1, path: '/bolinma1' }, d)).status, 200);
    assert.strictEqual((await run('/api/hr', { user: U.b1, path: '/employees', query: { bolinma_id: 'bolinma2' } }, d)).status, 403);
    assert.strictEqual((await run('/api/hr', { user: U.b1, path: '/employees', query: { bolinma_id: 'all' } }, d)).status, 200);
    assert.strictEqual((await run('/api/defects', { user: U.b1, method: 'POST', path: '/', body: { bolinma_id: "2-bo'linma", km: 1 } }, d)).status, 403);
    assert.strictEqual((await run('/api/pu28', { user: U.b1, method: 'POST', path: '/bulk-sync', body: { records: [{ bolinma_id: 'bolinma1' }, { bolinma_id: 'bolinma3' }] } }, d)).status, 403);
    assert.strictEqual((await run('/api/defects', { user: U.b1, method: 'POST', path: '/', body: { bolinma_id: "1-bo'linma" } }, d)).status, 200);
    assert.strictEqual((await run('/api/pu80', { user: U.b1, path: '/records/iqtisod' }, d)).status, 200, 'bo‘lim nomi — bo‘linma emas');
});

test('ID bo‘yicha boshqa bo‘linma yozuvini o‘zgartirish/o‘chirish — 403', async () => {
    const d = makeDb();
    assert.strictEqual((await run('/api/defects', { user: U.b1, method: 'PUT', path: '/2/fix' }, d)).status, 403);
    assert.strictEqual((await run('/api/defects', { user: U.b1, method: 'PUT', path: '/1/fix' }, d)).status, 200);
    assert.strictEqual((await run('/api/defects', { user: U.b2, method: 'PUT', path: '/3/fix' }, d)).status, 200, 'umumiy yozuv');
    assert.strictEqual((await run('/api/hr', { user: U.b2, method: 'DELETE', path: '/employees/5' }, d)).status, 403);
    assert.strictEqual((await run('/api/hr', { user: U.b1legacy, method: 'DELETE', path: '/employees/5' }, d)).status, 200);
    assert.strictEqual((await run('/api/materials', { user: U.b1, method: 'POST', path: '/acts/7/approve' }, d)).status, 403, 'eski bolinma_num ustuni');
    assert.strictEqual((await run('/api/hr', { user: U.admin, method: 'DELETE', path: '/employees/6' }, d)).status, 200);
});

test('ro‘yxatlardan boshqa bo‘linmalar olib tashlanadi', async () => {
    const d = makeDb();
    const rows = [{ id: 1, bolinma_id: "1-bo'linma" }, { id: 2, bolinma_id: 'bolinma2' }, { id: 3, bolinma_id: null }];
    let r = await run('/api/defects', { user: U.b1, payload: rows }, d);
    assert.deepStrictEqual(r.data.map((x) => x.id), [1, 3]);
    r = await run('/api/hr', { user: U.b2, path: '/employees', payload: { data: rows, total: 3 } }, d);
    assert.deepStrictEqual(r.data.data.map((x) => x.id), [2, 3]);
    assert.strictEqual(r.data.total, 3);
    r = await run('/api/defects', { user: U.deptTwo, payload: rows }, d);
    assert.deepStrictEqual(r.data.map((x) => x.id), [2, 3]);
    r = await run('/api/defects', { user: U.admin, payload: rows }, d);
    assert.strictEqual(r.data.length, 3);
    r = await run('/api/murojaat', { user: U.b1, path: '/x', payload: { id: 9, bolinma_id: 'bolinma2', text: 'maxfiy' } }, d);
    assert.strictEqual(r.status, 403, 'bitta yozuv ham');
    r = await run('/api/defects', { user: U.none, payload: rows }, d);
    assert.deepStrictEqual(r.data.map((x) => x.id), [3], 'bo‘linmasiz foydalanuvchi faqat umumiy yozuvlarni ko‘radi');
    assert.deepStrictEqual(filterPayload({ a: 1 }, []), { a: 1 });
    const agg = filterPayload({ success: true, data: { plets: rows, pkz_rails: rows.slice(0, 2) } }, ["1-bo'linma"]);
    assert.deepStrictEqual(agg.data.plets.map((x) => x.id), [1, 3], 'yig‘ma javob ichidagi ro‘yxatlar ham');
    assert.deepStrictEqual(agg.data.pkz_rails.map((x) => x.id), [1]);
});

test('barcha /:id marshrutlari jadvallarga bog‘langan', () => {
    for (const [prefix, list] of Object.entries(RECORD_ROUTES)) {
        assert.ok(prefix.startsWith('/api/'));
        for (const [re, table] of list) assert.ok(re instanceof RegExp && /^[a-z_0-9]+$/.test(table), prefix);
    }
});
