const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Section 2 records for a bolinma or all
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;

    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish')) {
            return res.status(403).json({ message: "Sizda bu bo'linma ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    } else {
        if (!req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Sizda barcha bo'linmalar ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    }

    let query = 'SELECT * FROM pu28_section2_records';
    let params = [];

    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }

    query += ' ORDER BY id DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('PU-28 Section 2 fetch error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows || []);
    });
});

// Add new Section 2 record (16 columns)
router.post('/', (req, res) => {
    const {
        bolinma_id,
        date_detected,
        track_no,
        km,
        pk,
        zveno,
        thread_side,
        factory_mark,
        rolling_year,
        heat_no,
        rail_type,
        defect_code,
        defect_desc,
        replacement_deadline,
        defective_fishplates,
        defect_photo
    } = req.body;

    if (!req.hasAccessToBolinma(bolinma_id)) {
        return res.status(403).json({ message: "Siz faqat o'z bo'linmangiz uchun ma'lumot kirita olasiz!" });
    }

    const sql = `
        INSERT INTO pu28_section2_records (
            bolinma_id, date_detected, track_no, km, pk, zveno, thread_side,
            factory_mark, rolling_year, heat_no, rail_type, defect_code,
            defect_desc, replacement_deadline, defective_fishplates, defect_photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        bolinma_id,
        date_detected || new Date().toISOString().split('T')[0],
        track_no || '1',
        km || 0,
        pk || 0,
        zveno || 0,
        thread_side || 'O\'ng',
        factory_mark || '',
        rolling_year || '',
        heat_no || '',
        rail_type || 'R-65',
        defect_code || '',
        defect_desc || '',
        replacement_deadline || '',
        defective_fishplates || 'Yo\'q',
        defect_photo || null
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('PU-28 Section 2 add error:', err);
            return res.status(500).json({ message: 'Insert failed', error: err.message });
        }
        res.json({ message: 'Success', id: this.lastID });
    });
});

// Resolve defect (mark as replaced with photos)
router.put('/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { workPhoto, facePhoto, date_replaced } = req.body || {};

    db.get('SELECT bolinma_id FROM pu28_section2_records WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Topilmadi' });

        if (!req.hasAccessToBolinma(row.bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish')) {
            return res.status(403).json({ message: "Bunga ruxsat yo'q" });
        }

        const dateReplaced = date_replaced || new Date().toISOString().split('T')[0];

        db.run(
            'UPDATE pu28_section2_records SET resolved_status = "replaced", date_replaced = ?, work_photo = ?, face_photo = ? WHERE id = ?',
            [dateReplaced, workPhoto || null, facePhoto || null, id],
            function (err) {
                if (err) {
                    console.error('PU-28 Section 2 resolve error:', err);
                    return res.status(500).json({ message: 'Update failed' });
                }
                res.json({ message: 'Resolved successfully' });
            }
        );
    });
});

// Delete record
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin' && !req.hasAccessToDepartment('ishlab-chiqarish')) {
        return res.status(403).json({ message: "O'chirish faqat ruxsat etilgan bo'limlar roliga xos" });
    }

    db.run('DELETE FROM pu28_section2_records WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ message: 'Deleted' });
    });
});

// Bulk sync
router.post('/bulk-sync', (req, res) => {
    const { bolinma_id, records } = req.body;
    if (!records || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Records array is required' });
    }

    if (!req.hasAccessToBolinma(bolinma_id)) {
        return res.status(403).json({ message: "Sizda bu bo'linmaga ruxsat yo'q" });
    }

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO pu28_section2_records (
                bolinma_id, date_detected, track_no, km, pk, zveno, thread_side,
                factory_mark, rolling_year, heat_no, rail_type, defect_code,
                defect_desc, replacement_deadline, defective_fishplates, date_replaced,
                resolved_status, defect_photo, work_photo, face_photo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        records.forEach(r => {
            stmt.run([
                bolinma_id,
                r.date_detected || r.dateDetected,
                r.track_no || r.trackNo,
                r.km,
                r.pk,
                r.zveno,
                r.thread_side || r.threadSide,
                r.factory_mark || r.factoryMark,
                r.rolling_year || r.rollingYear,
                r.heat_no || r.heatNo,
                r.rail_type || r.railType,
                r.defect_code || r.defectCode,
                r.defect_desc || r.defectDesc,
                r.replacement_deadline || r.replacementDeadline,
                r.defective_fishplates || r.defectiveFishplates,
                r.date_replaced || r.dateReplaced,
                r.resolved_status || r.resolvedStatus || 'pending',
                r.defect_photo || r.defectPhoto,
                r.work_photo || r.workPhoto,
                r.face_photo || r.facePhoto
            ]);
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('PU-28 Section 2 Bulk Sync error:', err);
                return res.status(500).json({ message: 'Sync failed' });
            }
            res.json({ message: 'Sync successful', count: records.length });
        });
    });
});

module.exports = router;
