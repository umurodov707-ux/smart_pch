const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/marketplace - Get all active items
router.get('/', (req, res) => {
    const { type, bolinma_id } = req.query;
    let query = 'SELECT * FROM marketplace_items WHERE status = "active"';
    let params = [];

    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (bolinma_id) {
        query += ' AND bolinma_id = ?';
        params.push(bolinma_id);
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// POST /api/marketplace - Post new item
router.post('/', (req, res) => {
    const { type, material_name, qty, uom, contact, bolinma_id, date } = req.body;
    
    db.run(
        `INSERT INTO marketplace_items (type, material_name, qty, uom, contact, bolinma_id, date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [type, material_name, qty, uom, contact, bolinma_id, date || new Date().toISOString()],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

// DELETE /api/marketplace/:id - Delete item
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM marketplace_items WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
