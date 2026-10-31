/**
 * PU-29 server xizmati testlari: node --test server/scripts/test-pu29.js
 */
const test = require('node:test');
const assert = require('node:assert');

let DatabaseSync;
try { ({ DatabaseSync } = require('node:sqlite')); } catch (e) {
    test('node:sqlite mavjud emas — o‘tkazib yuborildi', { skip: true }, () => {});
    return;
}
const { initSchema } = require('../schema_manager');
const { createPu29Service, canonBolinma } = require('../services/pu29');

function makeDb() {
    const raw = new DatabaseSync(':memory:');
    return {
        isPostgres: false,
        exec: async (sql) => raw.exec(sql),
        get: (sql, p, cb) => { try { cb(null, raw.prepare(sql).get(...p)); } catch (e) { cb(e); } },
        all: (sql, p, cb) => { try { cb(null, raw.prepare(sql).all(...p)); } catch (e) { cb(e); } },
        run: (sql, p, cb) => { try { const r = raw.prepare(sql).run(...p); cb && cb.call({ lastID: Number(r.lastInsertRowid), changes: Number(r.changes) }, null); } catch (e) { cb && cb(e); } },
    };
}
const call = (h, { params = {}, body, query = {}, user }) => new Promise((resolve) => {
    const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(d) { resolve({ status: this.statusCode, data: d }); } };
    h({ params, body, query, user }, res);
});
const U = {
    b1: { id: 1, username: 'brigadir1', role: 'bolinma', bolinmalar: ["1-bo'linma"], departments: [] },
    b1old: { id: 4, username: 'eski', role: 'bolinma', bolinmalar: ['bolinma1'], departments: [] },
    b2: { id: 2, username: 'brigadir2', role: 'bolinma', bolinmalar: ["2-bo'linma"], departments: [] },
    prod: { id: 5, username: 'ishlab', role: 'department', bolinmalar: [], departments: ['ishlab-chiqarish'] },
    admin: { id: 3, username: 'admin', role: 'admin', bolinmalar: [], departments: [] },
};
async function setup() {
    const db = makeDb();
    await initSchema(db);
    let t = Date.parse('2026-10-31T08:00:00Z');
    const s = createPu29Service(db, { now: () => t });
    return { s, tick: (ms) => { t += ms; } };
}

test('bo‘linma nomlarini bir xil ko‘rinishga keltirish', () => {
    assert.strictEqual(canonBolinma('bolinma3'), "3-bo'linma");
    assert.strictEqual(canonBolinma("3-bo'linma"), "3-bo'linma");
    assert.strictEqual(canonBolinma('3-bo‘linma'), "3-bo'linma");
    assert.strictEqual(canonBolinma('../x'), null);
});

test('strelkalar: eski ro‘yxat bilan to‘ldiriladi, soxta o‘lchovlarsiz', async () => {
    const { s } = await setup();
    const r = await call(s.listSwitches, { params: { bolinma: "1-bo'linma" }, user: U.b1 });
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(r.data.switches.map((x) => x.switch_number), ['1', '2', '3', '100']);
    assert.strictEqual(r.data.switches[0].meta.station, 'Navbaxor');
    assert.ok(r.data.switches.every((x) => x.last === null && x.checks === 0));
    // eski 'bolinma1' ko'rinishidagi foydalanuvchi ham kiradi
    assert.strictEqual((await call(s.listSwitches, { params: { bolinma: 'bolinma1' }, user: U.b1old })).status, 200);
});

test('ruxsatlar', async () => {
    const { s } = await setup();
    assert.strictEqual((await call(s.listSwitches, { params: { bolinma: "1-bo'linma" }, user: U.b2 })).status, 403);
    assert.strictEqual((await call(s.listSwitches, { params: { bolinma: "1-bo'linma" }, user: U.prod })).status, 200);
    assert.strictEqual((await call(s.listSwitches, { params: { bolinma: "1-bo'linma" }, user: U.admin })).status, 200);
    assert.strictEqual((await call(s.addSwitch, { params: { bolinma: "1-bo'linma" }, body: { switch_number: '7' }, user: U.b2 })).status, 403);
});

test('strelka qo‘shish, ma’lumot, tekshiruv, qulflash, o‘chirish', async () => {
    const { s, tick } = await setup();
    const B = { bolinma: "2-bo'linma" };
    await call(s.listSwitches, { params: B, user: U.b2 });
    let r = await call(s.addSwitch, { params: B, body: { switch_number: '15', meta: { marka: '1/9', lineCategory: 'qabul', evil: 'x' } }, user: U.b2 });
    assert.strictEqual(r.status, 201);
    assert.deepStrictEqual(r.data.meta, { marka: '1/9', lineCategory: 'qabul' });
    assert.strictEqual((await call(s.addSwitch, { params: B, body: { switch_number: '15' }, user: U.b2 })).status, 409);

    r = await call(s.updateSwitch, { params: { ...B, sw: '15' }, body: { meta: { station: 'Yaxshilik', km: '4120' } }, user: U.b2 });
    assert.deepStrictEqual(r.data.meta, { marka: '1/9', lineCategory: 'qabul', station: 'Yaxshilik', km: '4120' });

    assert.strictEqual((await call(s.addEntry, { params: { ...B, sw: '15' }, body: { date: '31.10.2026', data: {} }, user: U.b2 })).status, 400);
    assert.strictEqual((await call(s.addEntry, { params: { ...B, sw: '15' }, body: { date: '2026-10-31', data: { 'a.b': 1 } }, user: U.b2 })).status, 400);
    r = await call(s.addEntry, { params: { ...B, sw: '15' }, body: { date: '2026-10-31', data: { sh0: '1522', ur0: 4, empty: '  ' } }, user: U.b2 });
    assert.strictEqual(r.status, 201);
    assert.deepStrictEqual(r.data.data, { sh0: '1522', ur0: 4 });
    assert.strictEqual(r.data.can_edit, true);
    const id = r.data.id;

    r = await call(s.updateEntry, { params: { id }, body: { data: { sh0: '1530' } }, user: U.b2 });
    assert.strictEqual(r.data.data.sh0, '1530');
    assert.strictEqual((await call(s.updateEntry, { params: { id }, body: { data: {} }, user: U.b1 })).status, 403, 'boshqa bo‘linma');

    r = await call(s.listSwitches, { params: B, user: U.b2 });
    const sw = r.data.switches.find((x) => x.switch_number === '15');
    assert.strictEqual(sw.checks, 1);
    assert.strictEqual(sw.last.data.sh0, '1530');

    tick(3 * 3600 * 1000 + 1);
    r = await call(s.updateEntry, { params: { id }, body: { data: { sh0: '1520' } }, user: U.b2 });
    assert.strictEqual(r.status, 423, '3 soatdan keyin qulflanadi');
    assert.strictEqual((await call(s.deleteEntry, { params: { id }, user: U.b2 })).status, 423);
    assert.strictEqual((await call(s.updateEntry, { params: { id }, body: { data: { sh0: '1521' } }, user: U.admin })).status, 200, 'admin o‘zgartira oladi');

    // ordinata alohida
    await call(s.addEntry, { params: { ...B, sw: '15' }, body: { kind: 'ordinat', date: '2026-10-31', data: { m2: '236' } }, user: U.b2 });
    r = await call(s.listEntries, { params: { ...B, sw: '15' }, query: { kind: 'ordinat' }, user: U.b2 });
    assert.strictEqual(r.data.entries.length, 1);
    r = await call(s.listEntries, { params: { ...B, sw: '15' }, query: {}, user: U.b2 });
    assert.strictEqual(r.data.entries.length, 1);

    assert.strictEqual((await call(s.deleteSwitch, { params: { ...B, sw: '15' }, user: U.b2 })).status, 409, 'tekshiruvi bor');
    assert.strictEqual((await call(s.deleteSwitch, { params: { ...B, sw: '15' }, user: U.admin })).status, 200);
    assert.strictEqual((await call(s.listEntries, { params: { ...B, sw: '15' }, query: {}, user: U.b2 })).data.entries.length, 0);
    assert.strictEqual((await call(s.addEntry, { params: { ...B, sw: '99' }, body: { date: '2026-10-31', data: {} }, user: U.b2 })).status, 404);
});
