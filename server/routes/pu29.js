const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all records for a switch
router.get('/records/:bolinma_id/:switch_number', (req, res) => {
    const { bolinma_id, switch_number } = req.params;

    // Permissions (using existing middleware method)
    if (!req.hasAccessToBolinma(bolinma_id) && !req.hasAccessToDepartment('ishlab-chiqarish') && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    db.all(
        'SELECT * FROM pu29_records WHERE bolinma_id = ? AND switch_number = ? ORDER BY date DESC',
        [bolinma_id, switch_number],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            // Parse JSON strings back to objects
            const formatted = rows.map(r => ({
                ...r,
                promers: JSON.parse(r.promers || '{}'),
                npk: JSON.parse(r.npk || '{}'),
                wear: JSON.parse(r.wear || '{}'),
                strelkaPoints: JSON.parse(r.strelka_points || '{}')
            }));
            res.json(formatted);
        }
    );
});

// Get switch pages (list of switches) for a bolinma
router.get('/pages/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all(
        'SELECT switch_number FROM pu29_pages WHERE bolinma_id = ? ORDER BY switch_number',
        [bolinma_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(rows.map(r => r.switch_number));
        }
    );
});

// Add switch page
router.post('/pages', (req, res) => {
    const { bolinma_id, switch_number } = req.body;
    if (!req.hasAccessToBolinma(bolinma_id)) return res.status(403).json({ message: "Ruxsat yo'q" });

    db.run(
        'INSERT OR IGNORE INTO pu29_pages (bolinma_id, switch_number) VALUES (?, ?)',
        [bolinma_id, switch_number],
        function(err) {
            if (err) return res.status(500).json({ message: 'Error' });
            res.json({ message: 'Added' });
        }
    );
});

// Delete switch page (and its data)
router.delete('/pages/:bolinma_id/:switch_number', (req, res) => {
    const { bolinma_id, switch_number } = req.params;
    if (!req.hasAccessToBolinma(bolinma_id)) return res.status(403).json({ message: "Ruxsat yo'q" });

    db.run('DELETE FROM pu29_pages WHERE bolinma_id = ? AND switch_number = ?', [bolinma_id, switch_number], (err) => {
        if (err) return res.status(500).json({ message: 'Error' });
        db.run('DELETE FROM pu29_records WHERE bolinma_id = ? AND switch_number = ?', [bolinma_id, switch_number], (err) => {
            res.json({ message: 'Deleted page and records' });
        });
    });
});

// Rename switch page
router.put('/pages/rename', (req, res) => {
    const { bolinma_id, old_number, new_number } = req.body;
    if (!req.hasAccessToBolinma(bolinma_id)) return res.status(403).json({ message: "Ruxsat yo'q" });

    db.serialize(() => {
        db.run('UPDATE pu29_pages SET switch_number = ? WHERE bolinma_id = ? AND switch_number = ?', [new_number, bolinma_id, old_number]);
        db.run('UPDATE pu29_records SET switch_number = ? WHERE bolinma_id = ? AND switch_number = ?', [new_number, bolinma_id, old_number], (err) => {
            res.json({ message: 'Renamed' });
        });
    });
});

// Add/Update record
router.post('/records', (req, res) => {
    const { bolinma_id, date, station, switch_number, type, marka, promers, npk, wear, strelkaPoints, id } = req.body;
    if (!req.hasAccessToBolinma(bolinma_id)) return res.status(403).json({ message: "Ruxsat yo'q" });

    const p = JSON.stringify(promers);
    const n = JSON.stringify(npk);
    const w = JSON.stringify(wear);
    const s = JSON.stringify(strelkaPoints);

    if (id && id > 1000000000) { // New record from frontend might have Date.now() as temp ID
        db.run(
            'INSERT INTO pu29_records (bolinma_id, date, station, switch_number, type, marka, promers, npk, wear, strelka_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [bolinma_id, date, station, switch_number, type, marka, p, n, w, s],
            function(err) {
                if (err) return res.status(500).json({ message: 'Error' });
                res.json({ message: 'Inserted', id: this.lastID });
            }
        );
    } else if (id) { // Existing DB ID
        db.run(
            'UPDATE pu29_records SET date=?, station=?, type=?, marka=?, promers=?, npk=?, wear=?, strelka_points=? WHERE id=?',
            [date, station, type, marka, p, n, w, s, id],
            function(err) {
                if (err) return res.status(500).json({ message: 'Error' });
                res.json({ message: 'Updated' });
            }
        );
    } else {
        db.run(
             'INSERT INTO pu29_records (bolinma_id, date, station, switch_number, type, marka, promers, npk, wear, strelka_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [bolinma_id, date, station, switch_number, type, marka, p, n, w, s],
            function(err) {
                if (err) return res.status(500).json({ message: 'Error' });
                res.json({ message: 'Inserted', id: this.lastID });
            }
        );
    }
});

// Bulk sync records and pages
router.post('/bulk-sync', (req, res) => {
    const { bolinma_id, pages, records } = req.body;
    if (!req.hasAccessToBolinma(bolinma_id)) return res.status(403).json({ message: "Ruxsat yo'q" });

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. Sync Pages
        if (pages && Array.isArray(pages)) {
            const pageStmt = db.prepare('INSERT OR IGNORE INTO pu29_pages (bolinma_id, switch_number) VALUES (?, ?)');
            pages.forEach(pNum => pageStmt.run([bolinma_id, pNum]));
            pageStmt.finalize();
        }

        // 2. Sync Records
        if (records && Array.isArray(records)) {
            const recStmt = db.prepare(`
                INSERT INTO pu29_records (bolinma_id, date, station, switch_number, type, marka, promers, npk, wear, strelka_points)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                date=excluded.date, station=excluded.station, type=excluded.type, marka=excluded.marka,
                promers=excluded.promers, npk=excluded.npk, wear=excluded.wear, strelka_points=excluded.strelka_points
            `);
            
            records.forEach(r => {
                const p = JSON.stringify(r.promers);
                const n = JSON.stringify(r.npk);
                const w = JSON.stringify(r.wear);
                const s = JSON.stringify(r.strelkaPoints);
                
                // If it has a real ID (from server), use it. If it's a temp ID (>10^9), insert as new.
                const idValue = (r.id && r.id < 1000000000) ? r.id : null;
                
                if (idValue) {
                    db.run(`
                        UPDATE pu29_records SET date=?, station=?, type=?, marka=?, promers=?, npk=?, wear=?, strelka_points=? 
                        WHERE id=?`, 
                        [r.date, r.station, r.type, r.marka, p, n, w, s, idValue]
                    );
                } else {
                    recStmt.run([bolinma_id, r.date, r.station, r.switchNumber, r.type, r.marka, p, n, w, s]);
                }
            });
            recStmt.finalize();
        }

        db.run('COMMIT', (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Sync failed' });
            }
            res.json({ message: 'Bulk sync complete' });
        });
    });
});

// Delete record
router.delete('/records/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pu29_records WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json({ message: 'Deleted' });
    });
});

module.exports = router;
