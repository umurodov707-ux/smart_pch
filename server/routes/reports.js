const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const reportSchema = {
    bolinma_id: { required: true, type: 'string' },
    content: { type: 'string' }
};

// Get reports (with optional date filter)
router.get('/', authMiddleware, (req, res) => {
    const dateFilter = req.query.date || new Date().toISOString().split('T')[0];
    
    let query = 'SELECT * FROM reports WHERE date = ?';
    let params = [dateFilter];

    if (req.query.history === 'true') {
        query = 'SELECT * FROM reports ORDER BY date DESC, time DESC LIMIT 100';
        params = [];
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        const formatted = rows.map(r => ({
            ...r,
            structuredData: r.structuredData ? JSON.parse(r.structuredData) : null
        }));
        res.json(formatted);
    });
});

// Submit/Update report (Strictly for 'bolinma' role)
router.post('/', authMiddleware, validate(reportSchema), (req, res) => {
    const { bolinma_id, content, structuredData, user_id } = req.body;

    // Check if user has required roles (bolinma, department, or admin)
    const allowedRoles = ['bolinma', 'department', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Hisobot yuborish huquqingiz yo‘q.' });
    }

    // Optional: Check if the user is assigned to this bolinma_id
    if (req.user.bolinmalar && !req.user.bolinmalar.includes(bolinma_id)) {
        return res.status(403).json({ message: 'Ushbu bo‘linma uchun hisobot yuborish huquqingiz yo‘q.' });
    }

    const date = new Date().toISOString().split('T')[0]; // Standard YYYY-MM-DD
    const time = new Date().toLocaleTimeString('uz-UZ');
    const sData = structuredData ? JSON.stringify(structuredData) : null;
    const effectiveUserId = req.user.id;

    // Check if report exists for today
    db.get('SELECT id FROM reports WHERE bolinma_id = ? AND date = ?', [bolinma_id, date], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            // Update
            db.run(
                'UPDATE reports SET content = ?, time = ?, structuredData = ?, user_id = ? WHERE id = ?',
                [content || '', time, sData, effectiveUserId, row.id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    res.json({ message: 'Report updated', id: row.id });
                }
            );
        } else {
            // Insert
            db.run(
                'INSERT INTO reports (user_id, bolinma_id, content, date, time, structuredData) VALUES (?, ?, ?, ?, ?, ?)',
                [effectiveUserId, bolinma_id, content || '', date, time, sData],
                function (err) {
                    if (err) {
                        console.error('Report insert error:', err);
                        return res.status(500).json({ message: 'Insert failed' });
                    }
                    res.json({ message: 'Report submitted', id: this.lastID });
                }
            );
        }
    });
});

// Get history or archive by date
router.get('/history', authMiddleware, (req, res) => {
    db.all('SELECT * FROM reports ORDER BY date DESC, time DESC LIMIT 50', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        const formatted = rows.map(r => ({
            ...r,
            structuredData: r.structuredData ? JSON.parse(r.structuredData) : null
        }));
        res.json(formatted);
    });
});

module.exports = router;
