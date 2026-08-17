const express = require('express');
const router = express.Router();
const db = require('../db');

// Auto-migrate: add photo columns if they don't exist
try {
    db.run("ALTER TABLE pu28_records ADD COLUMN work_photo TEXT", [], function(err) {
        if (err && !err.message.includes('duplicate') && !err.message.includes('already exists')) {
            // Column may already exist - that's fine
        }
    });
    db.run("ALTER TABLE pu28_records ADD COLUMN face_photo TEXT", [], function(err) {
        if (err && !err.message.includes('duplicate') && !err.message.includes('already exists')) {
            // Column may already exist - that's fine
        }
    });
} catch(e) { /* ignore migration errors */ }

// Get all records (for admin/department) or specific bolinma
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;

    // IDOR Protection and department check
    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin' && req.user.role !== 'department') {
            return res.status(403).json({ message: "Sizda bu bo'linma ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    } else {
        if (!req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin' && req.user.role !== 'department') {
            return res.status(403).json({ message: "Sizda barcha bo'linmalar ma'lumotlarini ko'rish huquqi yo'q!" });
        }
    }

    let query = 'SELECT * FROM pu28_records';
    let params = [];

    // If not 'all' or 'ishlab-chiqarish', filter by bolinma
    if (bolinma_id !== 'all' && bolinma_id !== 'ishlab-chiqarish' && bolinma_id !== 'unknown') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }

    query += ' ORDER BY id DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('PU-28 error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows || []);
    });
});

// Add record
router.post('/', (req, res) => {
    console.log('PU-28 POST body:', req.body);
    const { bolinma_id, date, check_method, km, pk, zv, defect_desc } = req.body;

    if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin' && req.user.role !== 'department') {
        return res.status(403).json({ message: "Siz faqat o'z bo'linmangiz uchun ma'lumot kirita olasiz!" });
    }

    db.run(
        'INSERT INTO pu28_records (bolinma_id, date, check_method, km, pk, zv, defect_desc) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bolinma_id, date || new Date().toISOString().split('T')[0], check_method, km, pk, zv, defect_desc],
        function (err) {
            if (err) {
                console.error('PU-28 add error:', err);
                return res.status(500).json({ message: 'Insert failed', error: err.message });
            }
            console.log('PU-28 Record added with ID:', this.lastID);
            res.json({ message: 'Success', id: this.lastID });
        }
    );
});


// Resolve defect (with optional photo evidence)
router.put('/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { workPhoto, facePhoto } = req.body || {};
    
    // Check ownership
    db.get('SELECT bolinma_id FROM pu28_records WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ message: 'Topilmadi' });
        
        if (!req.hasAccessToBolinma(row.bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin' && req.user.role !== 'department') {
            return res.status(403).json({ message: "Bunga ruxsat yo'q" });
        }

        const dateResolved = new Date().toISOString().split('T')[0];
        
        // If photos provided, try to save them too
        if (workPhoto || facePhoto) {
            db.run(
                'UPDATE pu28_records SET resolved_status = "resolved", date_resolved = ?, work_photo = ?, face_photo = ? WHERE id = ?',
                [dateResolved, workPhoto || null, facePhoto || null, id],
                function (err) {
                    if (err) {
                        // If columns don't exist yet, fall back to basic resolve
                        console.warn('Photo columns may not exist, falling back:', err.message);
                        db.run(
                            'UPDATE pu28_records SET resolved_status = "resolved", date_resolved = ? WHERE id = ?',
                            [dateResolved, id],
                            function (err2) {
                                if (err2) return res.status(500).json({ message: 'Update failed' });
                                res.json({ message: 'Resolved (without photos)' });
                            }
                        );
                        return;
                    }
                    res.json({ message: 'Resolved with evidence' });
                }
            );
        } else {
            db.run(
                'UPDATE pu28_records SET resolved_status = "resolved", date_resolved = ? WHERE id = ?',
                [dateResolved, id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    res.json({ message: 'Resolved' });
                }
            );
        }
    });
});

// Delete record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'department') {
        return res.status(403).json({ message: "O'chirish faqat ruxsat etilgan bo'limlar roliga xos" });
    }

    db.run('DELETE FROM pu28_records WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ message: 'Delete failed' });
        res.json({ message: 'Deleted' });
    });
});

// Bulk Sync for PU-28
router.post('/bulk-sync', (req, res) => {
    const { bolinma_id, records } = req.body;
    if (!records || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Records array is required' });
    }

    if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin' && req.user.role !== 'department') {
        return res.status(403).json({ message: "Sizda bu bo'linmaga ruxsat yo'q" });
    }

    console.log(`Syncing ${records.length} PU-28 records for ${bolinma_id}`);

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO pu28_records (bolinma_id, date, check_method, km, pk, zv, defect_desc, resolved_status, date_resolved, work_photo, face_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        records.forEach(r => {
            stmt.run([
                bolinma_id,
                r.date,
                r.check_method || r.checkMethod,
                r.km,
                r.pk,
                r.zv,
                r.defect_desc || r.defectDesc,
                r.resolved_status || r.resolvedStatus || 'pending',
                r.date_resolved || r.dateResolved,
                r.work_photo || r.workPhoto || null,
                r.face_photo || r.facePhoto || null
            ]);
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('PU-28 Bulk Sync error:', err);
                return res.status(500).json({ message: 'Sync failed' });
            }
            res.json({ message: 'Sync successful', count: records.length });
        });
    });
});

module.exports = router;
