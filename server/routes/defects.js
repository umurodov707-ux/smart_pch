const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all active defects for map visualization
router.get('/', (req, res) => {
    db.all("SELECT * FROM defects WHERE status = 'active'", [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Get defects for bolinma
router.get('/:bolinma_id', (req, res) => {
    const { bolinma_id } = req.params;
    db.all("SELECT * FROM defects WHERE bolinma_id = ? AND status = 'active'", [bolinma_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add defect
router.post('/', (req, res) => {
    const { bolinma_id, km, pk, degree, issue, description, is_repeated, status } = req.body;
    const date = req.body.date || new Date().toLocaleDateString();
    db.run(
        'INSERT INTO defects (bolinma_id, km, pk, degree, issue, description, is_repeated, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [bolinma_id, km, pk, degree, issue, description, is_repeated || 0, date, status || 'active'],
        function (err) {
            if (err) return res.status(500).json({ message: 'Insert failed' });

            // Emit real-time notification — faqat tegishli bo'linma va dispetcherga
            const io = req.app.get('io');
            if (io) {
                io.to(bolinma_id).to('dispetcher').emit('system_alert', {
                    message: `Yangi nosozlik: ${bolinma_id} bo'linmasi, PK ${pk}`,
                    type: 'defect',
                    bolinma_id
                });
            }

            res.json({ message: 'Defect added', id: this.lastID });
        }
    );
});

// Mark as fixed (inactive)
router.put('/:id/fix', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE defects SET status = 'fixed' WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ message: 'Update failed' });
        res.json({ message: 'Defect marked as fixed' });
    });
});

module.exports = router;
