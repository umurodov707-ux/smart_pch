const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Infrastructure Status Routes ---

// Get all infrastructure statuses
router.get('/status', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT * FROM infrastructure_status';
    const params = [];

    if (bolinma_id) {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update infrastructure status
router.post('/status/update', (req, res) => {
    // Authenticated users can update status
    const { id, status, details } = req.body;
    db.run(
        'UPDATE infrastructure_status SET status = ?, details = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, details, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Real-time update via Socket.io
            const io = req.app.get('io');
            if (io) io.emit('infrastructure_update', { id, status, details });
            
            res.json({ success: true });
        }
    );
});

// --- Digital Warnings Routes ---

// Get all warnings
router.get('/warnings', (req, res) => {
    const { bolinma_id, type } = req.query;
    let query = 'SELECT * FROM digital_warnings';
    const params = [];
    const conditions = [];

    if (bolinma_id) {
        conditions.push('bolinma_id = ?');
        params.push(bolinma_id);
    }
    if (type) {
        conditions.push('type = ?');
        params.push(type);
    }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new warning
router.post('/warnings', (req, res) => {
    const { title, message, type, priority, speed_limit, km, pk, start_date, end_date, bolinma_id } = req.body;
    db.run(
        `INSERT INTO digital_warnings (title, message, type, priority, speed_limit, km, pk, start_date, end_date, bolinma_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, message, type, priority, speed_limit, km, pk, start_date, end_date, bolinma_id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const newId = this.lastID;
            const io = req.app.get('io');
            if (io) io.emit('new_warning', { id: newId, title, message, type, priority });
            
            res.json({ success: true, id: newId });
        }
    );
});

// Delete warning
router.delete('/warnings/:id', (req, res) => {
    db.run('DELETE FROM digital_warnings WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- Infrastructure Assets (Passport) ---

// Get all assets
router.get('/assets', (req, res) => {
    const { bolinma_id, asset_type } = req.query;
    let query = 'SELECT * FROM infrastructure_assets';
    const params = [];
    const conditions = [];

    if (bolinma_id) {
        conditions.push('bolinma_id = ?');
        params.push(bolinma_id);
    }
    if (asset_type) {
        conditions.push('asset_type = ?');
        params.push(asset_type);
    }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new asset
router.post('/assets', (req, res) => {
    const { name, asset_type, specification, install_date, next_repair_date, km, pk, bolinma_id } = req.body;
    db.run(
        `INSERT INTO infrastructure_assets (name, asset_type, specification, install_date, next_repair_date, km, pk, bolinma_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, asset_type, specification, install_date, next_repair_date, km, pk, bolinma_id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

module.exports = router;
