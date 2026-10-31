/**
 * PU-74 jurnali xizmati: brigada + oy bo'yicha tahrirlarni saqlash va tasdiqlash jarayoni.
 *
 * Holatlar:
 *   draft     — qoralama, to'ldirilmoqda
 *   submitted — tekshiruvga topshirildi (bo'linma foydalanuvchisi endi o'zgartira olmaydi)
 *   returned  — tekshiruvchi izoh bilan qaytardi (yana tahrirlanadi)
 *   approved  — tasdiqlandi, qulflangan (faqat admin qayta ochadi)
 *
 * Rollar (server/routes/auth.js ALLOWED_ROLES):
 *   bolinma    — to'ldiradi va topshiradi
 *   department — tekshiradi: tasdiqlaydi yoki qaytaradi
 *   admin      — hammasi + tasdiqlanganini qayta ochish
 *
 * Express'ga bog'liq emas: handlerlar (req, res) qabul qiladi, shuning uchun alohida test qilinadi.
 */
const fs = require('fs');
const path = require('path');
const { safeObject } = require('../utils/safe');
const { canonBolinma } = require('./pu29');

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const BRIGADE_RE = /^\d{1,2}-brigada$/;
const MAX_EDITS = 20000;
const MAX_VALUE_LEN = 500;

const STATUSES = ['draft', 'submitted', 'returned', 'approved'];

/** Kim nima qila oladi */
const TRANSITIONS = {
    submit: { from: ['draft', 'returned'], to: 'submitted', roles: ['admin', 'bolinma', 'department'] },
    approve: { from: ['submitted'], to: 'approved', roles: ['admin', 'department'] },
    return: { from: ['submitted'], to: 'returned', roles: ['admin', 'department'] },
    reopen: { from: ['approved', 'submitted'], to: 'draft', roles: ['admin'] },
};

function canEdit(status, role) {
    if (status === 'approved') return false;
    if (status === 'submitted') return role === 'admin' || role === 'department';
    return true;
}

/** Tahrirlar obyektini tekshiradi: kalit "varaq_qator_ustun", qiymat son yoki qisqa matn */
function sanitizeEdits(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return { error: 'edits obyekt bo‘lishi kerak' };
    }
    const keys = Object.keys(input);
    if (keys.length > MAX_EDITS) return { error: 'Juda ko‘p o‘zgarish' };
    const out = {};
    for (const k of keys) {
        if (!/^\d{1,2}_\d{1,4}_\d{1,4}$/.test(k)) return { error: `Noto‘g‘ri katak kaliti: ${k}` };
        const v = input[k];
        if (typeof v === 'number') {
            if (!Number.isFinite(v)) return { error: `Noto‘g‘ri son: ${k}` };
            out[k] = v;
        } else if (typeof v === 'string') {
            if (v.length > MAX_VALUE_LEN) return { error: `Matn juda uzun: ${k}` };
            out[k] = v;
        } else if (v === null) {
            out[k] = '';
        } else {
            return { error: `Noto‘g‘ri qiymat: ${k}` };
        }
    }
    return { edits: out };
}

function rowToJournal(row, role) {
    return {
        bolinma: row.bolinma_id,
        brigade: row.brigade,
        month: row.month,
        edits: safeObject(row.edits),
        status: row.status || 'draft',
        version: Number(row.version) || 1,
        comment: row.comment || '',
        updated_by: row.updated_by || null,
        updated_at: row.updated_at || null,
        submitted_by: row.submitted_by || null,
        submitted_at: row.submitted_at || null,
        approved_by: row.approved_by || null,
        approved_at: row.approved_at || null,
        can_edit: canEdit(row.status || 'draft', role),
    };
}

function createPu74JournalService(db, { publicDir = path.join(__dirname, '..', '..', 'public'), now = () => new Date() } = {}) {
    const q = {
        get: (sql, params) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))),
        all: (sql, params) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])))),
        run: (sql, params) => new Promise((resolve, reject) => db.run(sql, params, function onRun(err) { return err ? reject(err) : resolve(this); })),
    };

    function brigadeExists(brigade) {
        if (!BRIGADE_RE.test(brigade)) return false;
        return fs.existsSync(path.join(publicDir, `${brigade}.xlsx`));
    }

    const userName = (req) => (req.user && (req.user.username || String(req.user.id))) || 'nomaʼlum';
    const role = (req) => (req.user && req.user.role) || '';

    /** Bo'linma o'z jurnalini ko'radi; admin va bo'limlar (tekshiruvchilar) hammasini */
    function canAccess(req, bolinma) {
        const u = req.user || {};
        if (u.role === 'admin' || u.role === 'department') return true;
        return (u.bolinmalar || []).some((b) => canonBolinma(b) === bolinma);
    }

    function validate(req, res) {
        const { brigade, month } = req.params;
        const bolinma = canonBolinma(req.params.bolinma);
        if (!bolinma) {
            res.status(400).json({ message: 'Noto‘g‘ri bo‘linma' });
            return null;
        }
        if (!canAccess(req, bolinma)) {
            res.status(403).json({ message: 'Bu bo‘linma jurnaliga ruxsat yo‘q' });
            return null;
        }
        if (!brigadeExists(brigade)) {
            res.status(404).json({ message: 'Brigada topilmadi' });
            return null;
        }
        if (month !== undefined && !MONTH_RE.test(month)) {
            res.status(400).json({ message: 'Oy YYYY-MM ko‘rinishida bo‘lishi kerak' });
            return null;
        }
        return { bolinma, brigade, month };
    }

    const fail = (res, err) => {
        console.error('[pu74-journal]', err && err.message);
        res.status(500).json({ message: 'Serverda ichki xatolik' });
    };

    return {
        canEdit,
        sanitizeEdits,

        /** GET /:brigade — brigadaning barcha oylari */
        async list(req, res) {
            const p = validate(req, res);
            if (!p) return;
            try {
                const rows = await q.all(
                    'SELECT brigade, month, status, version, updated_by, updated_at, approved_by, approved_at FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? ORDER BY month DESC',
                    [p.bolinma, p.brigade],
                );
                res.json({ months: rows.map((r) => ({ ...r, version: Number(r.version) || 1 })) });
            } catch (e) { fail(res, e); }
        },

        /** GET /:brigade/:month */
        async get(req, res) {
            const p = validate(req, res);
            if (!p) return;
            try {
                const row = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                if (!row) return res.status(404).json({ message: 'Bu oy uchun jurnal ochilmagan' });
                res.json(rowToJournal(row, role(req)));
            } catch (e) { fail(res, e); }
        },

        /**
         * PUT /:brigade/:month  { edits, version }
         * version — klient oxirgi ko'rgan versiya. Mos kelmasa 409 (boshqa birov o'zgartirgan).
         * Yangi oy uchun version yuborilmaydi (yoki 0).
         */
        async save(req, res) {
            const p = validate(req, res);
            if (!p) return;
            const body = req.body || {};
            const clean = sanitizeEdits(body.edits);
            if (clean.error) return res.status(400).json({ message: clean.error });
            const json = JSON.stringify(clean.edits);
            const who = userName(req);
            const ts = now().toISOString();
            try {
                const row = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                if (!row) {
                    try {
                        await q.run(
                            'INSERT INTO pu74_journals (bolinma_id, brigade, month, edits, status, version, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [p.bolinma, p.brigade, p.month, json, 'draft', 1, who, ts],
                        );
                    } catch (e) {
                        // bir vaqtda ikki kishi ochgan bo'lsa
                        return res.status(409).json({ message: 'Jurnal boshqa foydalanuvchi tomonidan ochildi, qayta yuklang' });
                    }
                    const created = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                    return res.status(201).json(rowToJournal(created, role(req)));
                }
                if (!canEdit(row.status, role(req))) {
                    return res.status(423).json({ message: 'Jurnal qulflangan (topshirilgan yoki tasdiqlangan)', journal: rowToJournal(row, role(req)) });
                }
                const expected = Number(body.version);
                if (!Number.isFinite(expected) || expected !== Number(row.version)) {
                    return res.status(409).json({ message: 'Jurnalni boshqa foydalanuvchi o‘zgartirdi', journal: rowToJournal(row, role(req)) });
                }
                const result = await q.run(
                    'UPDATE pu74_journals SET edits = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE bolinma_id = ? AND brigade = ? AND month = ? AND version = ?',
                    [json, who, ts, p.bolinma, p.brigade, p.month, row.version],
                );
                if (result && result.changes === 0) {
                    const fresh = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                    return res.status(409).json({ message: 'Jurnalni boshqa foydalanuvchi o‘zgartirdi', journal: rowToJournal(fresh, role(req)) });
                }
                const saved = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                const io = req.app && req.app.get && req.app.get('io');
                if (io) io.emit('pu74_journal_updated', { bolinma: p.bolinma, brigade: p.brigade, month: p.month, version: Number(saved.version) });
                res.json(rowToJournal(saved, role(req)));
            } catch (e) { fail(res, e); }
        },

        /** POST /:brigade/:month/status  { action: submit|approve|return|reopen, comment } */
        async setStatus(req, res) {
            const p = validate(req, res);
            if (!p) return;
            const { action, comment } = req.body || {};
            const t = TRANSITIONS[action];
            if (!t) return res.status(400).json({ message: 'Noma’lum amal' });
            if (!t.roles.includes(role(req))) return res.status(403).json({ message: 'Bu amal uchun ruxsat yo‘q' });
            if (action === 'return' && !(typeof comment === 'string' && comment.trim())) {
                return res.status(400).json({ message: 'Qaytarish sababini yozing' });
            }
            try {
                const row = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                if (!row) return res.status(404).json({ message: 'Bu oy uchun jurnal ochilmagan' });
                if (!t.from.includes(row.status)) {
                    return res.status(409).json({ message: `Hozirgi holatda (${row.status}) bu amalni bajarib bo‘lmaydi`, journal: rowToJournal(row, role(req)) });
                }
                const who = userName(req);
                const ts = now().toISOString();
                const set = ['status = ?', 'version = version + 1', 'comment = ?'];
                const params = [t.to, typeof comment === 'string' ? comment.slice(0, 1000) : ''];
                if (action === 'submit') { set.push('submitted_by = ?', 'submitted_at = ?'); params.push(who, ts); }
                if (action === 'approve') { set.push('approved_by = ?', 'approved_at = ?'); params.push(who, ts); }
                if (action === 'reopen') { set.push('approved_by = NULL', 'approved_at = NULL'); }
                params.push(p.bolinma, p.brigade, p.month, row.status);
                const result = await q.run(`UPDATE pu74_journals SET ${set.join(', ')} WHERE bolinma_id = ? AND brigade = ? AND month = ? AND status = ?`, params);
                if (result && result.changes === 0) {
                    return res.status(409).json({ message: 'Holat boshqa foydalanuvchi tomonidan o‘zgartirildi, qayta yuklang' });
                }
                const saved = await q.get('SELECT * FROM pu74_journals WHERE bolinma_id = ? AND brigade = ? AND month = ?', [p.bolinma, p.brigade, p.month]);
                res.json(rowToJournal(saved, role(req)));
            } catch (e) { fail(res, e); }
        },
    };
}

module.exports = { createPu74JournalService, sanitizeEdits, canEdit, TRANSITIONS, STATUSES, MONTH_RE };
