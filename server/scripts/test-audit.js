/**
 * Audit tuzatishlari testlari: node --test server/scripts/test-audit.js
 * (rollar, bo'linma filtri, kalit-qiymat ombori, xato matnlarini yashirish, JSON)
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_kalit_'.repeat(4);
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const Module = require('module');

// express o'rnatilmagan muhitda ham marshrut fayllarini yuklash uchun kichik o'rinbosarlar
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === 'express') {
        const fake = () => ({});
        fake.Router = () => { const r = {}; for (const m of ['get', 'post', 'put', 'patch', 'delete', 'use']) r[m] = () => r; return r; };
        return fake;
    }
    if (request === '../db' || request.endsWith(path.join('server', 'db'))) {
        return { get() {}, all() {}, run() {}, serialize(cb) { cb(); }, prepare() { return { run() {}, finalize() {} }; } };
    }
    try { return origLoad.apply(this, arguments); } catch (e) {
        // o'rnatilmagan tashqi paket (multer, node-fetch...) — bo'sh o'rinbosar
        if (!request.startsWith('.') && e.code === 'MODULE_NOT_FOUND') {
            const fn = function () { return proxy; };
            const proxy = new Proxy(fn, { get: (t, k) => (k === 'prototype' ? {} : proxy), apply: () => proxy, construct: () => proxy });
            return proxy;
        }
        throw e;
    }
};

const roles = require('../middleware/roles');
const { bolinmaFilter, resolveBolinma, variants, NONE } = require('../middleware/bolinmaScope');
const storage = require('../routes/storage')._internals;
const { scrub, GENERIC } = require('../middleware/safeErrors');
const { safeParse } = require('../utils/safeJson');

const U = {
    admin: { role: 'admin', username: 'admin', bolinmalar: [], departments: [] },
    b1: { role: 'bolinma', username: 'brigadir', bolinmalar: ["1-bo'linma"], departments: [] },
    b10: { role: 'bolinma', username: 'bolinma10', bolinmalar: [], departments: [] },
    noNum: { role: 'bolinma', username: 'ali', bolinmalar: [], departments: [] },
    disp: { role: 'department', username: 'dispetcher', bolinmalar: [], departments: ['dispetcher'] },
    buh: { role: 'department', username: 'bugalteriya', bolinmalar: [], departments: ['bugalteriya'] },
    metro2: { role: 'department', username: 'm', bolinmalar: ["2-bo'linma"], departments: '["metrologiya"]' },
    legacySub: { role: 'subdivision', username: 'bolinma3', bolinmalar: [] },
};

test('rollar: faqat admin / department / bolinma; bo‘lim departments ichida', () => {
    assert.ok(roles.isAdmin(U.admin));
    assert.ok(roles.isDispatcher(U.disp));
    assert.ok(roles.isDispatcher(U.admin));
    assert.ok(!roles.isDispatcher(U.b1));
    assert.ok(!roles.isDispatcher({ role: 'bolinma', username: 'dispetcher', departments: ['dispetcher'] }), 'bo‘linma dispetcher bo‘la olmaydi');
    assert.ok(roles.inDepartment(U.buh, 'bugalteriya'));
    assert.ok(roles.inDepartment(U.buh, 'buxgalteriya'), 'eski yozilish');
    assert.ok(!roles.inDepartment(U.b1, 'bugalteriya'));
    assert.ok(roles.inDepartment(U.metro2, 'metrologiya'), 'departments matn ko‘rinishida');
    assert.strictEqual(roles.roleOf(U.legacySub), 'bolinma', 'eski "subdivision" → bolinma');
    assert.ok(roles.inDepartment({ role: 'department', departments: ['ishlab'] }, 'ishlab-chiqarish'));
});

test('bo‘linma filtri: 1 va 10 aralashmaydi, raqamsiz foydalanuvchi hech narsa ko‘rmaydi', () => {
    assert.ok(variants("1-bo'linma").includes('bolinma1'));
    assert.ok(!variants("1-bo'linma").includes('bolinma10'));
    const f1 = bolinmaFilter(U.b1, 'all');
    assert.ok(f1.params.includes("1-bo'linma") && f1.params.includes('bolinma1'));
    assert.ok(!f1.params.some((p) => /10/.test(p)));
    assert.deepStrictEqual(bolinmaFilter(U.b1, 'bolinma2').params, f1.params, 'boshqa bo‘linma so‘ralsa ham o‘ziniki');
    assert.ok(bolinmaFilter(U.b10, null).params.includes('bolinma10'));
    assert.deepStrictEqual(bolinmaFilter(U.noNum, null).params, [NONE], 'ilgari jim turib 1-bo‘linma berilardi');
    assert.strictEqual(bolinmaFilter(U.admin, 'all'), null);
    assert.ok(bolinmaFilter(U.admin, 'bolinma4').params.includes("4-bo'linma"));
    assert.strictEqual(bolinmaFilter(U.disp, null), null, 'biriktirilmagan bo‘lim — hammasi');
    assert.ok(bolinmaFilter(U.metro2, null).params.includes("2-bo'linma"));
    assert.strictEqual(bolinmaFilter(U.b1, null, 'e.bolinma_id').sql.startsWith('e.bolinma_id IN ('), true);
});

test('yozish uchun bo‘linma: cheklangan foydalanuvchi o‘zinikidan chiqmaydi', () => {
    assert.strictEqual(resolveBolinma(U.b1, 'bolinma2'), "1-bo'linma");
    assert.strictEqual(resolveBolinma(U.b1, 'bolinma1'), "1-bo'linma");
    assert.strictEqual(resolveBolinma(U.noNum, "1-bo'linma"), NONE);
    assert.strictEqual(resolveBolinma(U.admin, 'bolinma5'), "5-bo'linma");
    assert.strictEqual(resolveBolinma(U.admin, 'all'), null);
});

test('kalit-qiymat ombori: shaxsiy kalitlar va boshqa bo‘linmalar', () => {
    const { isPrivate, keyBolinma, mergeForScope, visible } = storage;
    for (const k of ['currentUser', 'jwtToken', 'smart_pch_users', 'pu74_bolinma', 'my_token_x', 'pu29_draft_1_2']) assert.ok(isPrivate(k), k);
    assert.ok(!isPrivate('materialActs'));
    assert.strictEqual(keyBolinma('pu28_section2_bolinma3'), "3-bo'linma");
    assert.strictEqual(keyBolinma("pu28_char_data_3-bo'linma"), "3-bo'linma");
    assert.strictEqual(keyBolinma('materialActs'), null);
    const scope1 = ["1-bo'linma"];
    assert.strictEqual(visible(scope1, 'currentUser', { role: 'admin' }), undefined, 'admin profili boshqalarga bormaydi');
    assert.strictEqual(visible(scope1, 'pu28_section2_bolinma3', [1]), undefined);
    const acts = [{ id: 1, bolinma_id: 'bolinma1' }, { id: 2, bolinma_id: 'bolinma2' }, { id: 3 }];
    assert.deepStrictEqual(visible(scope1, 'materialActs', acts).map((a) => a.id), [1, 3]);
    assert.strictEqual(visible(null, 'materialActs', acts).length, 3);
    // 1-bo'linma o'z ro'yxatini yozdi — 2-bo'linma yozuvi yo'qolmaydi, begona yozuv qo'shilmaydi
    const merged = mergeForScope(scope1, acts, [{ id: 1, bolinma_id: 'bolinma1', x: 'yangi' }, { id: 9, bolinma_id: 'bolinma2' }]);
    assert.deepStrictEqual(merged.map((a) => a.id).sort(), [1, 2]);
    assert.strictEqual(merged.find((a) => a.id === 1).x, 'yangi');
    assert.deepStrictEqual(mergeForScope(null, acts, [{ id: 5 }]), [{ id: 5 }], 'admin to‘liq yozadi');
});

test('5xx javobida SQL matni ko‘rinmaydi', () => {
    const req = { method: 'GET', originalUrl: '/api/x' };
    const orig = console.error; console.error = () => {};
    try {
        assert.strictEqual(scrub({ message: 'SQLITE_ERROR: no such column: foo' }, req).message, GENERIC);
        const r = scrub({ message: 'Save error', error: 'relation "x" does not exist' }, req);
        assert.strictEqual(r.message, 'Save error');
        assert.strictEqual(r.error, undefined);
        assert.deepStrictEqual(scrub({ message: 'Akt topilmadi' }, req), { message: 'Akt topilmadi' }, 'oddiy xabar o‘zgarmaydi');
        assert.strictEqual(scrub({ error: 'Cannot read properties of undefined' }, req).message, GENERIC);
    } finally { console.error = orig; }
});

test('buzilgan JSON so‘rovni yiqitmaydi', () => {
    assert.deepStrictEqual(safeParse('{"a":1}', {}), { a: 1 });
    assert.deepStrictEqual(safeParse('{buzilgan', []), []);
    assert.deepStrictEqual(safeParse(null, []), []);
    assert.deepStrictEqual(safeParse({ a: 1 }, null), { a: 1 });
});

test('marshrut fayllari yuklanadi (sintaksis va importlar)', () => {
    for (const f of ['hr', 'timesheet', 'metrology', 'materials', 'murojaat', 'okno', 'workflow', 'files', 'sand', 'imzo', 'reports', 'izostiklar', 'pu74_monthly', 'storage', 'marketplace', 'pu28', 'defects']) {
        assert.doesNotThrow(() => require(`../routes/${f}`), f);
    }
});

test('real vaqt xabarlari faqat tegishli bo‘linmaga', () => {
    const { roomsFor, emitScoped } = require('../utils/emit');
    assert.deepStrictEqual(roomsFor(U.admin), ['scope:all']);
    assert.deepStrictEqual(roomsFor(U.b1), ["scope:1-bo'linma"]);
    assert.deepStrictEqual(roomsFor(U.noNum), [], 'bo‘linmasiz — hech qaysi xona');
    const sent = [];
    const io = { to(r) { const rooms = [r]; const chain = { to(x) { rooms.push(x); return chain; }, emit(ev, p) { sent.push({ rooms, ev, p }); } }; return chain; } };
    emitScoped(io, 'bolinma3', 'x', 1);
    assert.deepStrictEqual(sent[0].rooms, ['scope:all', "scope:3-bo'linma"]);
    emitScoped(io, null, 'y', 2);
    assert.deepStrictEqual(sent[1].rooms, ['scope:all']);
});
