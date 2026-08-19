const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/storage/save
router.post('/save', (req, res) => {
    const { key, data } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key is required' });

    const value = JSON.stringify(data);
    db.run(
        'INSERT OR REPLACE INTO kv_storage (key, value) VALUES (?, ?)',
        [key, value],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // Xavfsiz tarzda barcha foydalanuvchilarga "update" bo'lganligini bildirish
            const io = req.app.get('io');
            if (io) io.emit('storage_updated', { key, timestamp: Date.now() });

            res.json({ success: true });
        }
    );
});

// GET /api/storage/load/:key
router.get('/load/:key', (req, res) => {
    const { key } = req.params;
    db.get('SELECT value FROM kv_storage WHERE key = ?', [key], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (row) {
            try {
                return res.json(JSON.parse(row.value));
            } catch (e) {
                return res.json(row.value);
            }
        }
        res.json(null);
    });
});

// GET /api/storage/sync - BARChA ma'lumotlarni tortib olish
router.get('/sync', (req, res) => {
    db.all('SELECT key, value FROM kv_storage', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        let rawData = {};
        rows.forEach(r => {
            try {
                let parsed = JSON.parse(r.value);
                // agar saqlanganda nested string bo'lib ketgan bo'lsa uni tekshiramiz
                if (typeof parsed === 'string' && (parsed.startsWith('{') || parsed.startsWith('['))) {
                    try { parsed = JSON.parse(parsed); } catch (ex) { }
                }
                rawData[r.key] = parsed;
            } catch (e) {
                rawData[r.key] = r.value;
            }
        });
        res.json({ success: true, data: rawData });
    });
});

module.exports = router;
