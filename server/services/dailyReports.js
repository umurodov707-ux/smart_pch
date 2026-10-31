/**
 * KUNLIK TEZKOR HISOBOTLAR (bo'linma → dispetcher)
 *
 * Ilgari:
 *   - sana serverning UTC vaqti bilan olinardi: Toshkentda 00:00–05:00 da yuborilgan
 *     hisobot kechagi kunga tushardi; tanlangan sana e'tiborga olinmasdi;
 *   - bo'linma nomi harfma-harf solishtirilardi ("bolinma1" ≠ "1-bo'linma") —
 *     ba'zi bo'linmalar yubora olmasdi, dispetcher esa yuborilganini ko'rmasdi;
 *   - qayta yuborish eskisini izsiz o'chirardi; "yangi hisobot" xabari serverdan chiqmasdi.
 *
 * Endi:
 *   - sana Toshkent vaqti bilan; bo'linma bugun yoki kecha uchun yubora oladi,
 *     dispetcher/admin istalgan o'tgan kun uchun;
 *   - bo'linma nomi yagona ko'rinishda saqlanadi ("3-bo'linma"), eski yozuvlar ham topiladi;
 *   - har bir yuborish va ko'rib chiqish report_versions jadvalida qoladi;
 *   - holat: submitted (ko'rib chiqilmagan) → accepted | returned (izoh bilan).
 */
const { scopeOf, canon, variants } = require('../middleware/bolinmaScope');
const { isDispatcher, isBolinma } = require('../middleware/roles');
const { safeParse } = require('../utils/safeJson');
const { emitScoped } = require('../utils/emit');

const TZ_OFFSET_MIN = Number(process.env.REPORT_TZ_OFFSET_MIN || 300); // Toshkent UTC+5

function localParts(ms) {
    const d = new Date(ms + TZ_OFFSET_MIN * 60000);
    const p = (n) => String(n).padStart(2, '0');
    return {
        date: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`,
        time: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`,
    };
}

function shiftDate(date, days) {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ['submitted', 'accepted', 'returned'];

/** Eski ilova kalit sifatida "bolinma3" ishlatadi */
function legacyKey(id) {
    const c = canon(id);
    if (!c) return id;
    const n = parseInt(c, 10);
    return c.endsWith('-sex') ? `sex${n}` : `bolinma${n}`;
}

function present(row) {
    if (!row) return row;
    const status = STATUSES.includes(row.status) ? row.status : 'submitted'; // eski 'received'
    return {
        ...row,
        bolinma_id: canon(row.bolinma_id) || row.bolinma_id,
        bolinma_key: legacyKey(row.bolinma_id),
        status,
        version: Number(row.version) || 1,
        structuredData: safeParse(row.structuredData, null),
    };
}

function createDailyReportsService(db, { now = () => Date.now() } = {}) {
    const q = {
        get: (sql, p = []) => new Promise((ok, no) => db.get(sql, p, (e, r) => (e ? no(e) : ok(r)))),
        all: (sql, p = []) => new Promise((ok, no) => db.all(sql, p, (e, r) => (e ? no(e) : ok(r || [])))),
        run: (sql, p = []) => new Promise((ok, no) => db.run(sql, p, function (e) { return e ? no(e) : ok(this || {}); })),
    };
    const fail = (res, e) => {
        console.error('daily reports:', e && e.message);
        return res.status(500).json({ message: 'Hisobotlar bazasida xatolik' });
    };

    async function findReport(bolinma, date) {
        const v = variants(bolinma);
        return q.get(
            `SELECT * FROM reports WHERE date = ? AND bolinma_id IN (${v.map(() => '?').join(', ')}) ORDER BY id LIMIT 1`,
            [date, ...v]
        );
    }

    async function logVersion(row, version, user, action, comment, sData) {
        await q.run(
            'INSERT INTO report_versions (report_id, version, bolinma_id, structuredData, user_id, username, action, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [row.id, version, canon(row.bolinma_id) || row.bolinma_id, sData, user.id || null, user.username || null, action, comment || null, new Date(now()).toISOString()]
        );
    }

    return {
        today: () => localParts(now()).date,

        /** GET /?date=YYYY-MM-DD  (history=true — oxirgi 100 ta) */
        async list(req, res) {
            try {
                let rows;
                if (req.query.history === 'true') {
                    rows = await q.all('SELECT * FROM reports ORDER BY date DESC, id DESC LIMIT 100');
                } else {
                    const date = DATE_RE.test(req.query.date || '') ? req.query.date : localParts(now()).date;
                    rows = await q.all('SELECT * FROM reports WHERE date = ? ORDER BY id', [date]);
                }
                res.json(rows.map(present));
            } catch (e) { fail(res, e); }
        },

        /** GET /history — oxirgi 50 ta */
        async history(req, res) {
            try {
                const rows = await q.all('SELECT * FROM reports ORDER BY date DESC, id DESC LIMIT 50');
                res.json(rows.map(present));
            } catch (e) { fail(res, e); }
        },

        /** POST /  { bolinma_id?, date?, content?, structuredData } */
        async submit(req, res) {
            const user = req.user || {};
            const dispatcher = isDispatcher(user);
            if (!dispatcher && !isBolinma(user)) {
                return res.status(403).json({ message: 'Kunlik hisobotni bo‘linma yoki dispetcher yuboradi' });
            }

            // bo'linma
            const scope = scopeOf(user);
            const want = req.body && req.body.bolinma_id ? canon(req.body.bolinma_id) : null;
            let bolinma;
            if (scope === null) {
                bolinma = want;
                if (!bolinma) return res.status(400).json({ message: 'Bo‘linmani tanlang' });
            } else if (want) {
                if (!scope.includes(want)) return res.status(403).json({ message: 'Ushbu bo‘linma uchun hisobot yuborish huquqingiz yo‘q.' });
                bolinma = want;
            } else {
                bolinma = scope[0];
                if (!bolinma) return res.status(403).json({ message: 'Profilingizga bo‘linma biriktirilmagan' });
            }

            // sana (Toshkent vaqti)
            const nowLocal = localParts(now());
            const date = req.body && req.body.date ? String(req.body.date) : nowLocal.date;
            if (!DATE_RE.test(date)) return res.status(400).json({ message: 'Sana noto‘g‘ri' });
            if (date > nowLocal.date) return res.status(400).json({ message: 'Kelajakdagi kun uchun hisobot yuborib bo‘lmaydi' });
            if (!dispatcher && date < shiftDate(nowLocal.date, -1)) {
                return res.status(403).json({ message: 'Faqat bugungi yoki kechagi hisobotni yuborish/tuzatish mumkin. Eskisini dispetcher tuzatadi.' });
            }

            const sd = req.body && req.body.structuredData;
            if (sd !== undefined && sd !== null && typeof sd !== 'object') {
                return res.status(400).json({ message: 'Hisobot ma’lumotlari noto‘g‘ri' });
            }
            const sData = sd ? JSON.stringify(sd) : null;
            if (sData && sData.length > 2_000_000) return res.status(413).json({ message: 'Hisobot hajmi juda katta' });
            const content = String((req.body && req.body.content) || `Kunlik tezkor hisobot (${date})`).slice(0, 2000);
            const stamp = new Date(now()).toISOString();

            try {
                let row = await findReport(bolinma, date);
                let version;
                if (row) {
                    version = (Number(row.version) || 1) + 1;
                    await q.run(
                        `UPDATE reports SET bolinma_id = ?, content = ?, time = ?, structuredData = ?, user_id = ?,
                         status = 'submitted', version = ?, updated_at = ?, reviewed_by = NULL, reviewed_at = NULL WHERE id = ?`,
                        [bolinma, content, nowLocal.time, sData, user.id || null, version, stamp, row.id]
                    );
                } else {
                    version = 1;
                    const r = await q.run(
                        `INSERT INTO reports (user_id, bolinma_id, content, date, time, structuredData, status, version, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, 'submitted', 1, ?)`,
                        [user.id || null, bolinma, content, date, nowLocal.time, sData, stamp]
                    );
                    row = { id: r.lastID };
                    if (!row.id) row = await findReport(bolinma, date);
                }
                row = { ...row, bolinma_id: bolinma };
                await logVersion(row, version, user, version === 1 ? 'submit' : 'resubmit', null, sData);

                const payload = { id: row.id, bolinma_id: bolinma, bolinma_key: legacyKey(bolinma), date, time: nowLocal.time, version, by: user.username };
                emitScoped(req.app && req.app.get ? req.app.get('io') : null, bolinma, 'report_submitted', payload);
                res.json({ message: version === 1 ? 'Hisobot yuborildi' : 'Hisobot yangilandi', ...payload });
            } catch (e) { fail(res, e); }
        },

        /** POST /:id/review  { action: accept|return, comment } — faqat dispetcher/admin */
        async review(req, res) {
            const user = req.user || {};
            if (!isDispatcher(user)) return res.status(403).json({ message: 'Hisobotni dispetcher ko‘rib chiqadi' });
            const action = req.body && req.body.action;
            const comment = String((req.body && req.body.comment) || '').trim().slice(0, 1000);
            if (!['accept', 'return'].includes(action)) return res.status(400).json({ message: 'Amal noto‘g‘ri' });
            if (action === 'return' && comment.length < 3) {
                return res.status(400).json({ message: 'Qaytarishda nimani tuzatish kerakligini yozing' });
            }
            try {
                const row = await q.get('SELECT * FROM reports WHERE id = ?', [req.params.id]);
                if (!row) return res.status(404).json({ message: 'Hisobot topilmadi' });
                const status = action === 'accept' ? 'accepted' : 'returned';
                const at = new Date(now()).toISOString();
                await q.run('UPDATE reports SET status = ?, review_comment = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?',
                    [status, comment || null, user.username || null, at, row.id]);
                const version = Number(row.version) || 1;
                await logVersion(row, version, user, action, comment, null);
                const payload = { id: row.id, bolinma_id: canon(row.bolinma_id) || row.bolinma_id, bolinma_key: legacyKey(row.bolinma_id), date: row.date, status, comment, by: user.username };
                emitScoped(req.app && req.app.get ? req.app.get('io') : null, row.bolinma_id, 'report_reviewed', payload);
                res.json({ message: status === 'accepted' ? 'Hisobot qabul qilindi' : 'Hisobot qaytarildi', ...payload });
            } catch (e) { fail(res, e); }
        },

        /** GET /:id/versions — kim, qachon, nima qildi */
        async versions(req, res) {
            try {
                const row = await q.get('SELECT id, bolinma_id FROM reports WHERE id = ?', [req.params.id]);
                if (!row) return res.status(404).json({ message: 'Hisobot topilmadi' });
                const list = await q.all('SELECT id, version, user_id, username, action, comment, created_at FROM report_versions WHERE report_id = ? ORDER BY id', [row.id]);
                res.json(list);
            } catch (e) { fail(res, e); }
        },
    };
}

module.exports = { createDailyReportsService, localParts, legacyKey, present };
