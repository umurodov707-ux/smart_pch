const express = require('express');
const router = express.Router();
const db = require('../db');
const { safeObject, firstBolinma } = require('../utils/safe');

const VALID_STATUSES = ['draft', 'submitted', 'approved', 'rejected'];

/**
 * Yozuvni frontend uchun normallashtiradi
 * (details bazada JSON string, API'da obyekt bo'lib chiqadi)
 */
function shapeRecord(row) {
    if (!row) return row;
    return { ...row, details: safeObject(row.details) };
}

/**
 * Foydalanuvchi ushbu yozuvga egami?
 */
function canAccess(req, bolinmaId) {
    if (req.user.role === 'admin') return true;
    return req.hasAccessToBolinma(bolinmaId);
}

/**
 * GET /api/pu74/records
 * Fetches granular work acts for a specific bolinma or date range
 */
router.get('/records', (req, res) => {
    const { bolinma_id, date, bridge_id, from, to } = req.query;
    let query = 'SELECT * FROM pu74_data WHERE 1=1';
    const params = [];

    // XAVFSIZLIK: admin bo'lmagan foydalanuvchi faqat o'z bo'linmalarini ko'radi.
    // Ilgari bolinma_id filtri ixtiyoriy edi — ya'ni filtrsiz so'rov
    // BARCHA bo'linmalar ma'lumotini qaytarardi.
    if (req.user.role === 'admin') {
        if (bolinma_id) {
            query += ' AND bolinma_id = ?';
            params.push(bolinma_id);
        }
    } else {
        const allowed = Array.isArray(req.user.bolinmalar) ? req.user.bolinmalar : [];
        if (allowed.length === 0) {
            return res.json([]);
        }
        if (bolinma_id) {
            if (!req.hasAccessToBolinma(bolinma_id)) {
                return res.status(403).json({ message: 'Ushbu bo\'linma ma\'lumotlariga ruxsat yo\'q' });
            }
            query += ' AND bolinma_id = ?';
            params.push(bolinma_id);
        } else {
            query += ` AND bolinma_id IN (${allowed.map(() => '?').join(',')})`;
            params.push(...allowed);
        }
    }

    if (date) {
        query += ' AND date = ?';
        params.push(date);
    }
    if (from) {
        query += ' AND date >= ?';
        params.push(from);
    }
    if (to) {
        query += ' AND date <= ?';
        params.push(to);
    }
    if (bridge_id) {
        query += ' AND bridge_id = ?';
        params.push(bridge_id);
    }

    query += ' ORDER BY date DESC, created_at DESC LIMIT 500';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('PU-74 records error:', err.message);
            return res.status(500).json({ message: 'Ma\'lumotlarni o\'qishda xatolik' });
        }
        res.json((rows || []).map(shapeRecord));
    });
});

/**
 * GET /api/pu74/records/:id — bitta yozuv
 */
router.get('/records/:id', (req, res) => {
    db.get('SELECT * FROM pu74_data WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotni o\'qishda xatolik' });
        if (!row) return res.status(404).json({ message: 'Yozuv topilmadi' });
        if (!canAccess(req, row.bolinma_id)) {
            return res.status(403).json({ message: 'Ruxsat yo\'q' });
        }
        res.json(shapeRecord(row));
    });
});

/**
 * POST /api/pu74/records
 * Saves a granular work act
 */
router.post('/records', (req, res) => {
    const {
        bolinma_id, date, act_number, location_name,
        km, pk, work_type, bridge_id, details, status
    } = req.body;

    // MUHIM TUZATISH:
    // req.user.bolinmalar auth middleware'da allaqachon MASSIVGA aylantirilgan.
    // Ilgari bu yerda yana JSON.parse(...) chaqirilardi va u SyntaxError bilan
    // yiqilib, PU-74 saqlash har doim 500 xatosini qaytarardi.
    const user_bolinma = firstBolinma(req.user);

    const target_bolinma = bolinma_id || user_bolinma;

    if (!target_bolinma) {
        return res.status(400).json({
            message: 'Bo\'linma aniqlanmadi. Profilingizga bo\'linma biriktirilmagan — administratorga murojaat qiling.'
        });
    }
    if (!date) {
        return res.status(400).json({ message: 'Sana kiritilishi shart' });
    }
    if (!act_number || !String(act_number).trim()) {
        return res.status(400).json({ message: 'Dalolatnoma raqami kiritilishi shart' });
    }
    if (!location_name || !String(location_name).trim()) {
        return res.status(400).json({ message: 'Obyekt nomi kiritilishi shart' });
    }
    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Noto\'g\'ri status' });
    }

    // Security: Only allow users to save reports for their own bolinma unless admin
    if (!canAccess(req, target_bolinma)) {
        return res.status(403).json({ message: 'Ruxsat etilmagan bo\'linma' });
    }

    const sql = `
        INSERT INTO pu74_data (
            bolinma_id, date, act_number, location_name,
            km, pk, work_type, bridge_id, details, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        target_bolinma,
        date,
        String(act_number).trim(),
        String(location_name).trim(),
        km || null,
        pk || null,
        work_type || null,
        bridge_id || null,
        JSON.stringify(details && typeof details === 'object' ? details : {}),
        status || 'draft'
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('PU-74 insert error:', err.message);
            return res.status(500).json({ message: 'Yozuvni saqlashda xatolik' });
        }
        res.status(201).json({ success: true, id: this.lastID, bolinma_id: target_bolinma });
    });
});

/**
 * PUT /api/pu74/records/:id — mavjud yozuvni tahrirlash
 */
router.put('/records/:id', (req, res) => {
    db.get('SELECT * FROM pu74_data WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotni o\'qishda xatolik' });
        if (!row) return res.status(404).json({ message: 'Yozuv topilmadi' });
        if (!canAccess(req, row.bolinma_id)) {
            return res.status(403).json({ message: 'Ushbu yozuvni tahrirlashga ruxsat yo\'q' });
        }
        if (row.status === 'approved' && req.user.role !== 'admin') {
            return res.status(409).json({ message: 'Tasdiqlangan dalolatnomani tahrirlab bo\'lmaydi' });
        }

        const fields = ['date', 'act_number', 'location_name', 'km', 'pk', 'work_type', 'bridge_id', 'status'];
        const sets = [];
        const params = [];

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                if (f === 'status' && !VALID_STATUSES.includes(req.body[f])) {
                    return res.status(400).json({ message: 'Noto\'g\'ri status' });
                }
                sets.push(`${f} = ?`);
                params.push(req.body[f]);
            }
        }
        if (req.body.details !== undefined) {
            sets.push('details = ?');
            params.push(JSON.stringify(safeObject(req.body.details)));
        }

        if (sets.length === 0) {
            return res.status(400).json({ message: 'Tahrirlash uchun ma\'lumot kiritilmadi' });
        }

        params.push(req.params.id);
        db.run(`UPDATE pu74_data SET ${sets.join(', ')} WHERE id = ?`, params, function (err2) {
            if (err2) {
                console.error('PU-74 update error:', err2.message);
                return res.status(500).json({ message: 'Yozuvni yangilashda xatolik' });
            }
            res.json({ success: true, id: Number(req.params.id) });
        });
    });
});

/**
 * DELETE /api/pu74/records/:id
 */
router.delete('/records/:id', (req, res) => {
    const { id } = req.params;

    // IDOR TUZATISHI: ilgari istalgan tizimga kirgan foydalanuvchi
    // istalgan bo'linmaning dalolatnomasini o'chira olardi.
    db.get('SELECT bolinma_id, status FROM pu74_data WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Ma\'lumotni o\'qishda xatolik' });
        if (!row) return res.status(404).json({ message: 'Yozuv topilmadi' });

        if (!canAccess(req, row.bolinma_id)) {
            return res.status(403).json({ message: 'Ushbu yozuvni o\'chirishga ruxsat yo\'q' });
        }
        if (row.status === 'approved' && req.user.role !== 'admin') {
            return res.status(409).json({ message: 'Tasdiqlangan dalolatnomani o\'chirib bo\'lmaydi' });
        }

        db.run('DELETE FROM pu74_data WHERE id = ?', [id], function (err2) {
            if (err2) return res.status(500).json({ message: 'O\'chirishda xatolik' });
            res.json({ success: true });
        });
    });
});

module.exports = router;
