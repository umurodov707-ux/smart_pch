const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAdmin, inDepartment, isDispatcher } = require('../middleware/roles');
const { resolveBolinma } = require('../middleware/bolinmaScope');
const OKNO_STATUSES = ['requested', 'planned', 'pending', 'approved', 'rejected', 'completed', 'cancelled', 'in_progress'];

// Get all OKNO plans
router.get('/', (req, res) => {
    const { bolinma_id } = req.query;
    let query = 'SELECT * FROM okno_planning';
    const params = [];

    if (bolinma_id) {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinma_id);
    }
    query += ' ORDER BY start_time ASC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create new OKNO plan (or request)
router.post('/', (req, res) => {
    const isDispetcher = req.user.username === 'dispetcher' || isDispatcher(req.user);
    const { title, type, start_time, end_time, km, pk, resources, bolinma_id } = req.body;
    
    // If not dispetcher, status must be 'requested'
    const status = isDispetcher ? 'planned' : 'requested';
    const finalBolinmaId = isDispetcher ? bolinma_id : resolveBolinma(req.user, bolinma_id);

    db.run(
        `INSERT INTO okno_planning (title, type, start_time, end_time, km, pk, resources, bolinma_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, type, start_time, end_time, km, pk, resources, finalBolinmaId, status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const io = req.app.get('io');
            if (io) io.emit('new_okno_plan', { id: this.lastID, title, type, start_time });
            
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Update OKNO status
router.patch('/:id/status', (req, res) => {
    if (!isDispatcher(req.user) && req.user.username !== 'dispetcher') {
        return res.status(403).json({ message: 'Faqat dispetcher holatni o\'zgartirishi mumkin' });
    }
    const { status } = req.body;
    if (!OKNO_STATUSES.includes(status)) return res.status(400).json({ message: 'Noto‘g‘ri holat' });
    db.run(
        'UPDATE okno_planning SET status = ? WHERE id = ?',
        [status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// Update OKNO status (Approve/Reject)
router.post('/:id/status', (req, res) => {
    if (!isDispatcher(req.user) && req.user.username !== 'dispetcher') {
        return res.status(403).json({ message: 'Faqat dispetcher talabnomani tasdiqlashi mumkin' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!OKNO_STATUSES.includes(status)) return res.status(400).json({ message: 'Noto‘g‘ri holat' });
    db.run('UPDATE okno_planning SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
