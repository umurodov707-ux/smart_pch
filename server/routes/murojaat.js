const express = require('express');
const router = express.Router();
const db = require('../db');
const { bolinmaFilter } = require('../middleware/bolinmaScope');
const { isAdmin, inDepartment, isDispatcher } = require('../middleware/roles');

const defaultAppeals = [
    { code: '#RM-2026-001', employee_name: 'Alisher Usmonov', employee_position: 'Yo\'l ustasi', bolinma_id: '1-bo\'linma', murojaat_type: 'Ariza', murojaat_text: 'Navbatdagi mehnat ta\'tili berishingizni so\'rayman.', created_at: '2026-07-21 10:00:00', status: 'pending' },
    { code: '#RM-2026-002', employee_name: 'Malika Karimova', employee_position: 'Muhandis', bolinma_id: '2-bo\'linma', murojaat_type: 'Ariza', murojaat_text: 'Oila sharoitim sababli 3 kun haq to\'lanmaydigan ta\'til ajratishingizni so\'rayman.', created_at: '2026-07-20 14:30:00', status: 'approved', manager_name: 'Salimov Sh.B.', manager_comment: 'Viza qo\'yildi, kadrlar buyruq chiqarsin.' },
    { code: '#RM-2026-003', employee_name: 'Botir Qodirov', employee_position: 'Mexanik', bolinma_id: '3-bo\'linma', murojaat_type: 'Ariza', murojaat_text: 'Moddiy yordam puli ajratish to\'g\'risidagi murojaat.', created_at: '2026-07-19 09:15:00', status: 'pending' },
    { code: '#RM-2026-004', employee_name: 'Gulnora Tursunova', employee_position: 'Dispetcher', bolinma_id: '1-bo\'linma', murojaat_type: 'Ariza', murojaat_text: 'Yillik mehnat ta\'tili jadvalini tasdiqlash bo\'yicha.', created_at: '2026-07-18 16:00:00', status: 'approved', manager_name: 'Salimov Sh.B.' },
    { code: '#RM-2026-005', employee_name: 'Rustam Jalilov', employee_position: 'Monter', bolinma_id: '4-bo\'linma', murojaat_type: 'Shikoyat', murojaat_text: 'Xavfsizlik texnikasi vositalari yetishmasligi bo\'yicha bildirishnoma.', created_at: '2026-07-18 11:20:00', status: 'rejected', manager_comment: 'Tushuntirish berildi, muammo joyida hal etildi.' }
];

// Yangi murojaat yuborish
router.post('/', (req, res) => {
    const { code, employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified, attachment_data } = req.body;

    if (!employee_name || !murojaat_text) {
        return res.status(400).json({ message: 'Xodim va murojaat matni kiritilishi shart' });
    }

    const appCode = code || `#RM-2026-${Math.floor(100 + Math.random() * 900)}`;

    db.run(
        `INSERT INTO murojaat (code, employee_id, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, signature_data, face_verified, attachment_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [appCode, employee_id || null, employee_name, employee_position || 'Xodim', bolinma_id || '1-bo\'linma', murojaat_type || 'Ariza', murojaat_text, signature_data || null, face_verified ? 1 : 0, attachment_data || null],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });

            // Emit notification
            const io = req.app.get('io');
            if (io) {
                io.emit('system_alert', {
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
    if (bolinma_id) {
        conditions.push('bolinma_id = ?');
        params.push(bolinma_id);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });

        // Auto seed initial data if empty
        if (rows.length === 0 && !status && !bolinma_id) {
            let inserted = 0;
            for (const item of defaultAppeals) {
                db.run(
                    `INSERT INTO murojaat (code, employee_name, employee_position, bolinma_id, murojaat_type, murojaat_text, created_at, status, manager_name, manager_comment)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.code, item.employee_name, item.employee_position, item.bolinma_id, item.murojaat_type, item.murojaat_text, item.created_at, item.status, item.manager_name || null, item.manager_comment || null],
                    () => {
                        inserted++;
                        if (inserted === defaultAppeals.length) {
                            db.all('SELECT * FROM murojaat ORDER BY created_at DESC', [], (err2, newRows) => {
                                if (err2) return res.status(500).json({ message: err2.message });
                                res.json(newRows);
                            });
                        }
                    }
                );
            }
        } else {
            res.json(rows);
        }
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
