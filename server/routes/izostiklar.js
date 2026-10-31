const express = require('express');
const router = express.Router();
const db = require('../db');
const { safeParse } = require('../utils/safeJson');

// Default seed data per bolinma_id
const defaultIzostiklar = {
    bolinma1: [
        { group_name: "Peregon Yanginobod-Navbahor", num: "1",   type: "R-65", location: "4024 km PK 4",      km: 4024, last_date: "2025-11-11", performer: "PD-01" },
        { group_name: "Peregon Yanginobod-Navbahor", num: "2",   type: "R-65", location: "4025 km PK 8",      km: 4025, last_date: "2024-11-18", performer: "PD-01" },
        { group_name: "Peregon Yanginobod-Navbahor", num: "3",   type: "R-65", location: "4025 km PK 9",      km: 4025, last_date: "2025-11-20", performer: "PD-01" },
        { group_name: "Peregon Yanginobod-Navbahor", num: "4",   type: "R-65", location: "4025 km PK 3",      km: 4025, last_date: "2025-11-28", performer: "PD-01" },
        { group_name: "Peregon Navbahor-Yaxshilik",  num: "5",   type: "R-65", location: "4038 km PK 7",      km: 4038, last_date: "2025-12-02", performer: "PD-01" },
        { group_name: "Peregon Navbahor-Yaxshilik",  num: "6",   type: "R-65", location: "4040 km PK 1",      km: 4040, last_date: "2025-12-03", performer: "PD-01" },
        { group_name: "Rzd. Navbahor nechetniy",     num: "1-3", type: "R-65", location: "Vixodnoy N",        km: 4030, last_date: "2025-09-09", performer: "PD-01" },
        { group_name: "Rzd. Navbahor nechetniy",     num: "5-7", type: "R-65", location: "str №1 per. kriva", km: 4030, last_date: "2025-09-16", performer: "PD-01" },
        { group_name: "Rzd. Navbahor nechetniy",     num: "9-11",type: "R-65", location: "Vixodnoy N1",       km: 4030, last_date: "2025-09-17", performer: "PD-01" },
    ],
    bolinma2: [
        { group_name: "Peregon Yaxshilik-Kuyganyor", num: "1", type: "R-65", location: "4058 km PK 2", km: 4058, last_date: "2025-10-11", performer: "PD-02" },
        { group_name: "Peregon Yaxshilik-Kuyganyor", num: "2", type: "R-65", location: "4062 km PK 5", km: 4062, last_date: "2025-08-20", performer: "PD-02" },
        { group_name: "Peregon Yaxshilik-Kuyganyor", num: "3", type: "R-65", location: "4068 km PK 1", km: 4068, last_date: "2025-11-01", performer: "PD-02" },
    ],
    bolinma3: [
        { group_name: "Peregon Kuyganyor-Qorlitepa", num: "1", type: "R-65", location: "4088 km PK 3", km: 4088, last_date: "2025-07-15", performer: "PD-03" },
        { group_name: "Peregon Kuyganyor-Qorlitepa", num: "2", type: "R-65", location: "4094 km PK 7", km: 4094, last_date: "2025-09-20", performer: "PD-03" },
        { group_name: "Peregon Kuyganyor-Qorlitepa", num: "3", type: "R-65", location: "4100 km PK 4", km: 4100, last_date: "2025-11-05", performer: "PD-03" },
    ],
    bolinma4: [
        { group_name: "Peregon Qorlitepa-Iskandar",  num: "1", type: "R-65", location: "4112 km PK 1", km: 4112, last_date: "2025-08-01", performer: "PD-04" },
        { group_name: "Peregon Qorlitepa-Iskandar",  num: "2", type: "R-65", location: "4118 km PK 9", km: 4118, last_date: "2025-10-14", performer: "PD-04" },
        { group_name: "Peregon Qorlitepa-Iskandar",  num: "3", type: "R-65", location: "4125 km PK 3", km: 4125, last_date: "2025-12-01", performer: "PD-04" },
    ],
    bolinma5: [
        { group_name: "Peregon Iskandar-Bektemir",   num: "1", type: "R-65", location: "4148 km PK 2", km: 4148, last_date: "2025-06-10", performer: "PD-05" },
        { group_name: "Peregon Iskandar-Bektemir",   num: "2", type: "R-65", location: "4155 km PK 5", km: 4155, last_date: "2025-09-22", performer: "PD-05" },
        { group_name: "Peregon Iskandar-Bektemir",   num: "3", type: "R-65", location: "4160 km PK 8", km: 4160, last_date: "2025-11-30", performer: "PD-05" },
    ],
};

function seedBolinma(bolinmaId, callback) {
    const seeds = defaultIzostiklar[bolinmaId];
    if (!seeds || seeds.length === 0) return callback(null, []);

    let inserted = 0;
    const total = seeds.length;
    const results = [];

    for (const item of seeds) {
        db.run(
            `INSERT INTO izostiklar (group_name, num, type, location, km, last_date, performer, bolinma_id, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.group_name, item.num, item.type, item.location, item.km, item.last_date, item.performer, bolinmaId, '[]'],
            function(err) {
                inserted++;
                if (!err) results.push({ id: this.lastID, ...item });
                if (inserted === total) callback(null, results);
            }
        );
    }
}

/**
 * GET all izostiklar for a specific bolinma
 * Auto-seeds default data if table is empty for this bolinma
 */
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all('SELECT * FROM izostiklar WHERE bolinma_id = ?', [bolinma_id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });

        if (rows.length === 0 && defaultIzostiklar[bolinma_id]) {
            // Auto-seed defaults for this bolinma on first request
            console.log(`[Izostiklar] Auto-seeding ${bolinma_id}...`);
            seedBolinma(bolinma_id, (seedErr, seeded) => {
                if (seedErr) return res.status(500).json({ message: seedErr.message });
                // Re-fetch to get proper IDs
                db.all('SELECT * FROM izostiklar WHERE bolinma_id = ?', [bolinma_id], (err2, newRows) => {
                    if (err2) return res.status(500).json({ message: err2.message });
                    res.json(newRows.map(r => ({ ...r, history: safeParse(r.history, []) || [] })));
                });
            });
        } else {
            res.json(rows.map(r => ({ ...r, history: safeParse(r.history, []) || [] })));
        }
    });
});

/**
 * Add or Update an izostik
 */
router.post('/', (req, res) => {
    const { id, group_name, num, type, location, km, last_date, performer, bolinma_id, history } = req.body;

    if (id) {
        // Update existing
        db.run(
            `UPDATE izostiklar SET group_name = ?, num = ?, type = ?, location = ?, km = ?, last_date = ?, performer = ?, history = ? WHERE id = ?`,
            [group_name, num, type, location, km, last_date, performer, JSON.stringify(history || []), id],
            function(err) {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ success: true, message: 'Yangilandi' });
            }
        );
    } else {
        // Insert new
        db.run(
            `INSERT INTO izostiklar (group_name, num, type, location, km, last_date, performer, bolinma_id, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [group_name, num, type, location, km, last_date, performer, bolinma_id, JSON.stringify(history || [])],
            function(err) {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ id: this.lastID, success: true, message: 'Muvaffaqiyatli saqlandi' });
            }
        );
    }
});

/**
 * Delete an izostik
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM izostiklar WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
