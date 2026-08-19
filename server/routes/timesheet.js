const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to resolve subdivision ID for user
function getSubdivisionId(user) {
    if (!user) return null;
    const role = String(user.role).toLowerCase();
    const username = String(user.username || '').toLowerCase();
    
    if (role === 'admin') return null;
    
    // 1. Username pattern
    if (username.includes('bolinma') || username.includes("bo'linma")) {
        const numMatch = username.match(/\d+/);
        if (numMatch) return `${numMatch[0]}-bo'linma`;
    }
    
    // 2. Explicit bolinmalar array
    if (user.bolinmalar && user.bolinmalar.length > 0) {
        const raw = user.bolinmalar[0];
        const numMatch = String(raw).match(/\d+/);
        if (numMatch) return `${numMatch[0]}-bo'linma`;
        return String(raw).replace(/‘/g, "'");
    }
    
    if (role === 'bolinma' || role === 'subdivision') {
        const numMatch = username.match(/\d+/);
        return numMatch ? `${numMatch[0]}-bo'linma` : '1-bo\'linma';
    }
    
    return null;
}

// Get timesheet for a month/bolinma
router.get('/:year/:month', (req, res) => {
    const { year, month } = req.params;
    const { bolinma_id } = req.query;

    let query = 'SELECT * FROM timesheet_records WHERE year = ? AND month = ?';
    let params = [year, month];

    let targetBolinmaId = bolinma_id;
    const subId = getSubdivisionId(req.user);
    if (subId) {
        targetBolinmaId = subId;
    } else if (targetBolinmaId && targetBolinmaId !== 'all') {
        const numMatch = String(targetBolinmaId).match(/\d+/);
        if (numMatch && (targetBolinmaId.startsWith('bolinma') || targetBolinmaId.includes('bo\'linma') || targetBolinmaId.includes('bo‘linma'))) {
            targetBolinmaId = `${numMatch[0]}-bo'linma`;
        }
    }

    if (targetBolinmaId && targetBolinmaId !== 'all') {
        query += ' AND bolinma_id = ?';
        params.push(targetBolinmaId);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        
        // Convert to a flat object for the frontend
        const data = {};
        rows.forEach(row => {
            const rowData = JSON.parse(row.data || '{}');
            Object.assign(data, rowData);
        });
        res.json(data);
    });
});

// Save timesheet data
router.post('/save', (req, res) => {
    const { year, month, data, bolinma_id } = req.body;

    if (!data) return res.status(400).json({ message: 'Data required' });

    // In a real system, we would group by employee_id. 
    // But as the frontend sends a flat object with empId_day keys, 
    // we'll store it as one big JSON blob per bolinma for now to maintain compatibility with existing logic.
    
    const dataStr = JSON.stringify(data);
    
    let targetBolinma = bolinma_id || 'all';
    const subId = getSubdivisionId(req.user);
    if (subId) {
        targetBolinma = subId;
    } else if (targetBolinma && targetBolinma !== 'all') {
        const numMatch = String(targetBolinma).match(/\d+/);
        if (numMatch && (targetBolinma.startsWith('bolinma') || targetBolinma.includes('bo\'linma') || targetBolinma.includes('bo‘linma'))) {
            targetBolinma = `${numMatch[0]}-bo'linma`;
        }
    }

    db.run(
        `INSERT INTO timesheet_records (bolinma_id, year, month, data) 
         VALUES (?, ?, ?, ?)
         ON CONFLICT(bolinma_id, year, month) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
        [targetBolinma, year, month, dataStr],
        function(err) {
            if (err) {
                // If ON CONFLICT isn't supported (old SQLite), try update then insert
                db.run(
                    'UPDATE timesheet_records SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE bolinma_id = ? AND year = ? AND month = ?',
                    [dataStr, targetBolinma, year, month],
                    function(err2) {
                        if (err2 || this.changes === 0) {
                            db.run(
                                'INSERT INTO timesheet_records (bolinma_id, year, month, data) VALUES (?, ?, ?, ?)',
                                [targetBolinma, year, month, dataStr],
                                (err3) => {
                                    if (err3) return res.status(500).json({ message: err3.message });
                                    res.json({ success: true });
                                }
                            );
                        } else {
                            res.json({ success: true });
                        }
                    }
                );
            } else {
                res.json({ success: true });
            }
        }
    );
});

// Barcha bo'linmalar uchun oylik tabel imzolarini monitoring (workflow dan)
router.get('/signatures/all', (req, res) => {
    const { year, month } = req.query;
    if (year === undefined || month === undefined) {
        return res.status(400).json({ message: 'year va month parametrlari kerak' });
    }

    const suffix = `_${year}_${month}`;

    db.all(
        `SELECT doc_id, history, status FROM document_workflow 
         WHERE doc_type = ? AND doc_id LIKE ?`,
        ['timesheet', `%${suffix}`],
        (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });

            const result = {};
            (rows || []).forEach(row => {
                const bolinmaId = row.doc_id.endsWith(suffix)
                    ? row.doc_id.slice(0, -suffix.length)
                    : row.doc_id;

                let history = [];
                try {
                    history = JSON.parse(row.history || '[]');
                } catch (e) {
                    history = [];
                }

                const sigs = { _status: row.status };
                history.forEach(h => {
                    if (!h.role) return;
                    sigs[`${h.role}_name`] = h.user_name;
                    sigs[`${h.role}_at`] = h.date;
                    if (h.role === 'bolinma') {
                        sigs.tuzuvchi_name = h.user_name;
                        sigs.tuzuvchi_at = h.date;
                    }
                });
                result[bolinmaId] = sigs;
            });

            res.json(result);
        }
    );
});

module.exports = router;
