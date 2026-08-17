const express = require('express');
const router = express.Router();
const db = require('../db');

// --- TNU-19 ---
router.get('/tnu19', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT t.*, e.full_name as employee_name FROM tnu19_records t JOIN employees e ON t.employee_id = e.id';
    let params = [];

    if (bolinma_id) {
        query += ' WHERE t.bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/tnu19', (req, res) => {
    const { employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature } = req.body;
    db.run(
        `INSERT INTO tnu19_records (employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, bolinma_id, date, time, instruction_type, instructor_name, signature],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'TNU-19 record added' });
        }
    );
});

// --- TNU-20 ---
router.get('/tnu20', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT t.*, e.full_name as employee_name FROM tnu20_records t JOIN employees e ON t.employee_id = e.id';
    let params = [];

    if (bolinma_id) {
        query += ' WHERE t.bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/tnu20', (req, res) => {
    const { employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature } = req.body;
    db.run(
        `INSERT INTO tnu20_records (employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, bolinma_id, date, next_test_date, certificate_no, result, signature],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'TNU-20 record added' });
        }
    );
});

router.delete('/tnu19/:id', (req, res) => {
    db.run('DELETE FROM tnu19_records WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'TNU-19 record deleted' });
    });
});

// --- General Safety Logs ---

router.get('/logs', (req, res) => {
    const { bolinma_id, type } = req.query;
    let query = 'SELECT * FROM safety_logs WHERE 1=1';
    let params = [];

    if (bolinma_id) {
        query += ' AND bolinma_id = ?';
        params.push(bolinma_id);
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/logs', (req, res) => {
    const { bolinma_id, type, employee_id, content, date } = req.body;
    db.run(
        `INSERT INTO safety_logs (bolinma_id, type, employee_id, content, date) 
         VALUES (?, ?, ?, ?, ?)`,
        [bolinma_id, type, employee_id, content, date],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

// --- Technical Training ---

router.get('/training', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT * FROM technical_training';
    let params = [];

    if (bolinma_id && bolinma_id !== 'all') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/training', (req, res) => {
    const { bolinma_id, topic, date, hours, instructor_name, instructor_signature, attendees } = req.body;
    db.run(
        `INSERT INTO technical_training (bolinma_id, topic, date, hours, instructor_name, instructor_signature, attendees) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bolinma_id, topic, date, hours, instructor_name, instructor_signature, typeof attendees === 'string' ? attendees : JSON.stringify(attendees)],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

router.put('/training/:id', (req, res) => {
    const { id } = req.params;
    const { attendees } = req.body;
    db.run(
        `UPDATE technical_training SET attendees = ? WHERE id = ?`,
        [typeof attendees === 'string' ? attendees : JSON.stringify(attendees), id],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ success: true });
        }
    );
});

module.exports = router;
