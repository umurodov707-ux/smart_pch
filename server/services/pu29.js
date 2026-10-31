/**
 * PU-29: strelkali o'tkazgichlarni tekshirish jurnali — server mantig'i.
 *
 * Har bir bo'linmada strelkalar ro'yxati (pu29_pages) va har bir strelka uchun
 * tekshiruvlar hamda ordinata o'lchovlari (pu29_entries).
 *
 * Qoidalar (eski interfeys bilan bir xil):
 *  - yozuv yaratilgandan keyin 3 soat davomida tahrirlanadi, keyin qulflanadi
 *    (faqat admin o'zgartira oladi) — jurnal yozuvini keyinroq "to'g'rilab" bo'lmaydi
 *  - bo'linma foydalanuvchisi faqat o'z bo'linmasini ko'radi; admin va
 *    "ishlab-chiqarish" bo'limi hammasini
 *
 * Express'ga bog'liq emas: handlerlar (req, res) oladi va alohida test qilinadi.
 */
const { safeObject } = require('../utils/safe');

const LOCK_MS = 3 * 60 * 60 * 1000;
const KINDS = ['check', 'ordinat'];
const MAX_FIELDS = 200;
const MAX_VALUE = 300;
const META_FIELDS = ['station', 'pathNumber', 'lineCategory', 'type', 'marka', 'switchType', 'yearOfManufacture', 'sleeperType', 'km', 'pk', 'note'];

/** Eski interfeysdagi strelkalar ro'yxati — bo'linma birinchi marta ochilganda qo'shiladi (o'lchovlarsiz) */
const LEGACY_SWITCHES = {
    1: { station: 'Navbaxor', list: ['1', '2', '3', '100'] },
    2: { station: 'Yaxshilik', list: ['1', '2', '3', '4', '5', '6', '10', '100', '102'] },
    3: { station: 'Parvoz', list: ['1', '2', '3', '100', '101'] },
    4: { station: "Qorlitog'", list: ['1', '2', '4', '5', '6', '100'] },
    5: { station: 'Kiyikli', list: ['1', '2', '3', '201'] },
    6: { station: 'Xizirbobo', list: ['1', '2', '3', '5', '6'] },
    7: { station: 'Jayxun', list: ['1', '2', '4', '100', '101'] },
    9: { station: 'Dautepa', list: ['1', '2', '3', '4', '5', '6', '8', '10'] },
    10: { station: 'Turon', list: ['1', '2', '3', '201', '203'] },
};

/** "bolinma3", "3-bo'linma", "3-bo‘linma" -> "3-bo'linma" */
function canonBolinma(id) {
    const s = String(id || '').trim();
    const m = /^(?:bolinma\s*)?(\d{1,3})(?:\s*-?\s*bo.?linma)?$/i.exec(s.replace(/[‘’ʻʼ`]/g, "'"));
    return m ? `${Number(m[1])}-bo'linma` : null;
}

const SWITCH_RE = /^[0-9A-Za-zА-Яа-я\-/ ]{1,20}$/;

function cleanValues(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Ma’lumot obyekt bo‘lishi kerak' };
    const keys = Object.keys(input);
    if (keys.length > MAX_FIELDS) return { error: 'Juda ko‘p maydon' };
    const out = {};
    for (const k of keys) {
        if (!/^[a-z_0-9]{1,20}$/i.test(k)) return { error: `Noto‘g‘ri maydon: ${k}` };
        const v = input[k];
        if (v === null || v === undefined) continue;
        if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
        else if (typeof v === 'string') {
            if (v.length > MAX_VALUE) return { error: `Qiymat juda uzun: ${k}` };
            if (v.trim() !== '') out[k] = v.trim();
        } else return { error: `Noto‘g‘ri qiymat: ${k}` };
    }
    return { values: out };
}

function cleanMeta(input) {
    const out = {};
    if (!input || typeof input !== 'object') return out;
    for (const k of META_FIELDS) {
        if (input[k] === undefined || input[k] === null) continue;
        out[k] = String(input[k]).slice(0, 120);
    }
    return out;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function createPu29Service(db, { now = () => Date.now() } = {}) {
    const q = {
        get: (sql, p) => new Promise((res, rej) => db.get(sql, p, (e, r) => (e ? rej(e) : res(r)))),
        all: (sql, p) => new Promise((res, rej) => db.all(sql, p, (e, r) => (e ? rej(e) : res(r || [])))),
        run: (sql, p) => new Promise((res, rej) => db.run(sql, p, function onRun(e) { return e ? rej(e) : res(this); })),
    };
    const who = (req) => (req.user && (req.user.username || String(req.user.id))) || 'nomaʼlum';
    const isAdmin = (req) => req.user && req.user.role === 'admin';
    const canAccess = (req, bolinma) => {
        const u = req.user || {};
        if (u.role === 'admin') return true;
        if ((u.departments || []).includes('ishlab-chiqarish')) return true;
        return (u.bolinmalar || []).some((b) => canonBolinma(b) === bolinma);
    };
    const fail = (res, e) => { console.error('[pu29]', e && e.message); res.status(500).json({ message: 'Serverda ichki xatolik' }); };

    function guard(req, res) {
        const bolinma = canonBolinma(req.params.bolinma);
        if (!bolinma) { res.status(400).json({ message: 'Noto‘g‘ri bo‘linma' }); return null; }
        if (!canAccess(req, bolinma)) { res.status(403).json({ message: 'Ruxsat yo‘q' }); return null; }
        const sw = req.params.sw !== undefined ? String(req.params.sw).trim() : undefined;
        if (sw !== undefined && !SWITCH_RE.test(sw)) { res.status(400).json({ message: 'Noto‘g‘ri strelka raqami' }); return null; }
        return { bolinma, sw };
    }

    const entryOut = (r, req) => {
        const created = Date.parse(r.created_at) || 0;
        const locked = now() - created > LOCK_MS;
        return {
            id: Number(r.id), kind: r.kind, date: r.date, data: safeObject(r.data),
            created_by: r.created_by, created_at: r.created_at, updated_by: r.updated_by, updated_at: r.updated_at,
            locked, can_edit: !locked || isAdmin(req),
        };
    };

    async function seedIfEmpty(bolinma) {
        const n = await q.get('SELECT COUNT(*) AS n FROM pu29_pages WHERE bolinma_id = ?', [bolinma]);
        if (Number(n && n.n) > 0) return;
        const seed = LEGACY_SWITCHES[parseInt(bolinma, 10)];
        if (!seed) return;
        for (const sw of seed.list) {
            try {
                await q.run('INSERT INTO pu29_pages (bolinma_id, switch_number, meta, updated_at) VALUES (?, ?, ?, ?)',
                    [bolinma, sw, JSON.stringify({ station: seed.station }), new Date(now()).toISOString()]);
            } catch (e) { /* parallel so'rov allaqachon qo'shgan */ }
        }
    }

    async function loadEntry(req, res) {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ message: 'Noto‘g‘ri ID' }); return null; }
        const row = await q.get('SELECT * FROM pu29_entries WHERE id = ?', [id]);
        if (!row) { res.status(404).json({ message: 'Yozuv topilmadi' }); return null; }
        if (!canAccess(req, row.bolinma_id)) { res.status(403).json({ message: 'Ruxsat yo‘q' }); return null; }
        return row;
    }

    return {
        canonBolinma,
        LOCK_MS,

        /** GET /:bolinma/switches — strelkalar, ma'lumotlari va oxirgi tekshiruvi */
        async listSwitches(req, res) {
            const p = guard(req, res); if (!p) return;
            try {
                await seedIfEmpty(p.bolinma);
                const pages = await q.all('SELECT switch_number, meta, updated_at FROM pu29_pages WHERE bolinma_id = ?', [p.bolinma]);
                const entries = await q.all(
                    "SELECT switch_number, date, data, created_at FROM pu29_entries WHERE bolinma_id = ? AND kind = 'check' ORDER BY date DESC, id DESC",
                    [p.bolinma],
                );
                const last = new Map();
                const count = new Map();
                for (const e of entries) {
                    if (!last.has(e.switch_number)) last.set(e.switch_number, { date: e.date, data: safeObject(e.data) });
                    count.set(e.switch_number, (count.get(e.switch_number) || 0) + 1);
                }
                const out = pages.map((r) => ({
                    switch_number: r.switch_number,
                    meta: safeObject(r.meta),
                    last: last.get(r.switch_number) || null,
                    checks: count.get(r.switch_number) || 0,
                }));
                out.sort((a, b) => String(a.switch_number).localeCompare(String(b.switch_number), undefined, { numeric: true }));
                res.json({ bolinma: p.bolinma, switches: out });
            } catch (e) { fail(res, e); }
        },

        /** POST /:bolinma/switches { switch_number, meta } */
        async addSwitch(req, res) {
            const p = guard(req, res); if (!p) return;
            const sw = String((req.body && req.body.switch_number) || '').trim();
            if (!SWITCH_RE.test(sw)) return res.status(400).json({ message: 'Strelka raqamini kiriting' });
            try {
                const exists = await q.get('SELECT 1 AS x FROM pu29_pages WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, sw]);
                if (exists) return res.status(409).json({ message: `№ ${sw} strelka allaqachon bor` });
                await q.run('INSERT INTO pu29_pages (bolinma_id, switch_number, meta, updated_at) VALUES (?, ?, ?, ?)',
                    [p.bolinma, sw, JSON.stringify(cleanMeta(req.body.meta)), new Date(now()).toISOString()]);
                res.status(201).json({ switch_number: sw, meta: cleanMeta(req.body.meta), last: null, checks: 0 });
            } catch (e) { fail(res, e); }
        },

        /** PUT /:bolinma/switches/:sw { meta } */
        async updateSwitch(req, res) {
            const p = guard(req, res); if (!p) return;
            try {
                const row = await q.get('SELECT meta FROM pu29_pages WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, p.sw]);
                if (!row) return res.status(404).json({ message: 'Strelka topilmadi' });
                const meta = { ...safeObject(row.meta), ...cleanMeta(req.body && req.body.meta) };
                await q.run('UPDATE pu29_pages SET meta = ?, updated_at = ? WHERE bolinma_id = ? AND switch_number = ?',
                    [JSON.stringify(meta), new Date(now()).toISOString(), p.bolinma, p.sw]);
                res.json({ switch_number: p.sw, meta });
            } catch (e) { fail(res, e); }
        },

        /** DELETE /:bolinma/switches/:sw — tekshiruvi bor strelkani faqat admin o'chiradi */
        async deleteSwitch(req, res) {
            const p = guard(req, res); if (!p) return;
            try {
                const n = await q.get('SELECT COUNT(*) AS n FROM pu29_entries WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, p.sw]);
                if (Number(n && n.n) > 0 && !isAdmin(req)) {
                    return res.status(409).json({ message: 'Strelkada tekshiruvlar bor — faqat admin o‘chira oladi' });
                }
                await q.run('DELETE FROM pu29_entries WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, p.sw]);
                const r = await q.run('DELETE FROM pu29_pages WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, p.sw]);
                if (r && r.changes === 0) return res.status(404).json({ message: 'Strelka topilmadi' });
                res.json({ message: 'O‘chirildi' });
            } catch (e) { fail(res, e); }
        },

        /** GET /:bolinma/switches/:sw/entries?kind=check|ordinat */
        async listEntries(req, res) {
            const p = guard(req, res); if (!p) return;
            const kind = KINDS.includes(req.query && req.query.kind) ? req.query.kind : 'check';
            try {
                const rows = await q.all(
                    'SELECT * FROM pu29_entries WHERE bolinma_id = ? AND switch_number = ? AND kind = ? ORDER BY date DESC, id DESC',
                    [p.bolinma, p.sw, kind],
                );
                res.json({ entries: rows.map((r) => entryOut(r, req)) });
            } catch (e) { fail(res, e); }
        },

        /** POST /:bolinma/switches/:sw/entries { kind, date, data } */
        async addEntry(req, res) {
            const p = guard(req, res); if (!p) return;
            const body = req.body || {};
            const kind = KINDS.includes(body.kind) ? body.kind : 'check';
            if (!DATE_RE.test(String(body.date || ''))) return res.status(400).json({ message: 'Sana YYYY-MM-DD ko‘rinishida bo‘lishi kerak' });
            const clean = cleanValues(body.data || {});
            if (clean.error) return res.status(400).json({ message: clean.error });
            try {
                const sw = await q.get('SELECT 1 AS x FROM pu29_pages WHERE bolinma_id = ? AND switch_number = ?', [p.bolinma, p.sw]);
                if (!sw) return res.status(404).json({ message: 'Strelka topilmadi' });
                const ts = new Date(now()).toISOString();
                const r = await q.run(
                    'INSERT INTO pu29_entries (bolinma_id, switch_number, kind, date, data, created_by, created_at, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [p.bolinma, p.sw, kind, body.date, JSON.stringify(clean.values), who(req), ts, who(req), ts],
                );
                const row = await q.get('SELECT * FROM pu29_entries WHERE id = ?', [r.lastID]);
                res.status(201).json(entryOut(row, req));
            } catch (e) { fail(res, e); }
        },

        /** PUT /entries/:id { date, data } — 3 soat ichida (admin har doim) */
        async updateEntry(req, res) {
            try {
                const row = await loadEntry(req, res); if (!row) return;
                const cur = entryOut(row, req);
                if (!cur.can_edit) return res.status(423).json({ message: 'Yozuv qulflangan (3 soatdan oshgan)', entry: cur });
                const body = req.body || {};
                const date = body.date !== undefined ? String(body.date) : row.date;
                if (!DATE_RE.test(date)) return res.status(400).json({ message: 'Sana YYYY-MM-DD ko‘rinishida bo‘lishi kerak' });
                const clean = cleanValues(body.data !== undefined ? body.data : safeObject(row.data));
                if (clean.error) return res.status(400).json({ message: clean.error });
                await q.run('UPDATE pu29_entries SET date = ?, data = ?, updated_by = ?, updated_at = ? WHERE id = ?',
                    [date, JSON.stringify(clean.values), who(req), new Date(now()).toISOString(), row.id]);
                res.json(entryOut(await q.get('SELECT * FROM pu29_entries WHERE id = ?', [row.id]), req));
            } catch (e) { fail(res, e); }
        },

        /** DELETE /entries/:id — 3 soat ichida (admin har doim) */
        async deleteEntry(req, res) {
            try {
                const row = await loadEntry(req, res); if (!row) return;
                if (!entryOut(row, req).can_edit) return res.status(423).json({ message: 'Yozuv qulflangan (3 soatdan oshgan)' });
                await q.run('DELETE FROM pu29_entries WHERE id = ?', [row.id]);
                res.json({ message: 'O‘chirildi' });
            } catch (e) { fail(res, e); }
        },
    };
}

module.exports = { createPu29Service, canonBolinma, cleanValues, LOCK_MS };
