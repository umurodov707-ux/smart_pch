const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all sand analysis reports
router.get('/', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT * FROM sand_analysis_reports';
    const params = [];

    if (bolinma_id) {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }
    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new report
router.post('/', (req, res) => {
    // Everyone authenticated can report
    const { location_name, km_start, km_end, risk_level, wind_speed, analysis_data, bolinma_id } = req.body;
    db.run(
        `INSERT INTO sand_analysis_reports (location_name, km_start, km_end, risk_level, wind_speed, analysis_data, bolinma_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [location_name, km_start, km_end, risk_level, wind_speed, analysis_data, bolinma_id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Get statistics (risk level counts)
router.get('/stats', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT risk_level, COUNT(*) as count FROM sand_analysis_reports';
    const params = [];
    if (bolinma_id) {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }
    query += ' GROUP BY risk_level';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete report
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM sand_analysis_reports WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
