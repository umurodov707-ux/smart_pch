const express = require('express');
const router = express.Router();
const db = require('../db');
const { emitScoped } = require('../utils/emit');
const { resolveBolinma, NONE } = require('../middleware/bolinmaScope');
const { bolinmaFilter } = require('../middleware/bolinmaScope');
const { isAdmin, inDepartment, isDispatcher } = require('../middleware/roles');

// Ilgari jadval bo'sh bo'lsa bu yerga 5 ta to'qima murojaat (soxta ismlar, "tasdiqlangan"
// holatlar) bazaga yozilardi va haqiqiy yozuvlar qatorida qolib ketardi. Olib tashlandi.

// Yangi murojaat yuborish
router.post('/', (req, res) => {
    const { code, employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified, attachment_data } = req.body;

    if (!employee_name || !murojaat_text) {
        return res.status(400).json({ message: 'Xodim va murojaat matni kiritilishi shart' });
    }

    const bId = resolveBolinma(req.user, bolinma_id) || bolinma_id || null;
    if (bId === NONE) return res.status(403).json({ message: 'Profilingizga bo‘linma biriktirilmagan' });
    // Kod: joriy yil + vaqtga asoslangan (ilgari 2026 qotirilgan va faqat 900 ta variant — takrorlanardi)
    const appCode = code || `#RM-${new Date().getFullYear()}-${Date.now().toString(36).slice(-6).toUpperCase()}`;

    db.run(
        `INSERT INTO murojaat (code, employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified, attachment_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [appCode, employee_id || null, employee_name, employee_position || 'Xodim', bId, murojaat_type || 'Ariza', murojaat_text, signature_data || null, face_verified ? 1 : 0, attachment_data || null],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });

            // Emit notification
            const io = req.app.get('io');
            if (io) {
                emitScoped(io, bId, 'system_alert', {
                    message: `Yangi murojaat: ${employee_name} (${murojaat_type})`,
                    type: 'murojaat'
                });
            }

            res.json({ id: this.lastID, code: appCode, message: 'Murojaat muvaffaqiyatli yuborildi!' });
        }
    );
});

// Barcha murojaatlarni olish (rahbar uchun)
router.get('/', (req, res) => {
    const { status, bolinma_id } = req.query;
    let query = 'SELECT * FROM murojaat';
    let conditions = [];
    let params = [];

    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    const bf = bolinmaFilter(req.user, bolinma_id);
    if (bf) {
        conditions.push(bf.sql);
        params.push(...bf.params);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });

        res.json(rows);
    });
});

// Bitta murojaatni olish
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM murojaat WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!row) return res.status(404).json({ message: 'Murojaat topilmadi' });
        res.json(row);
    });
});

// Murojaatni tasdiqlash (VIZA qo'yish)
router.patch('/:id/approve', (req, res) => {
    // Viza faqat rahbariyat (admin) yoki xodimlar bo'limi tomonidan qo'yiladi
    if (!inDepartment(req.user, 'xodimlar')) {
        return res.status(403).json({ message: 'Viza qo‘yish huquqi yo‘q' });
    }
    const { manager_name, manager_comment } = req.body;
    db.run(
        `UPDATE murojaat SET status = 'approved', manager_name = ?, manager_comment = ?, approved_date = CURRENT_TIMESTAMP WHERE id = ?`,
        [manager_name || 'Rahbar', manager_comment || '', req.params.id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
            res.json({ message: 'Murojaat tasdiqlandi (VIZA qo\'yildi)' });
        }
    );
});

// Murojaatni rad etish
router.patch('/:id/reject', (req, res) => {
    // Viza faqat rahbariyat (admin) yoki xodimlar bo'limi tomonidan qo'yiladi
    if (!inDepartment(req.user, 'xodimlar')) {
        return res.status(403).json({ message: 'Viza qo‘yish huquqi yo‘q' });
    }
    const { manager_name, manager_comment } = req.body;
    db.run(
        `UPDATE murojaat SET status = 'rejected', manager_name = ?, manager_comment = ?, approved_date = CURRENT_TIMESTAMP WHERE id = ?`,
        [manager_name || 'Rahbar', manager_comment || '', req.params.id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
            res.json({ message: 'Murojaat rad etildi' });
        }
    );
});

// Murojaatni o'chirish
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM murojaat WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Murojaat topilmadi' });
        res.json({ message: 'Murojaat o\'chirildi' });
    });
});

// Statistika
router.get('/stats/summary', (req, res) => {
    // Bo'linma faqat o'z murojaatlari sonini ko'radi
    const bf = bolinmaFilter(req.user, req.query.bolinma_id);
    db.get(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM murojaat
        ${bf ? 'WHERE ' + bf.sql : ''}
    `, bf ? bf.params : [], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row);
    });
});

module.exports = router;
