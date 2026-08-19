const express = require('express');
const router = express.Router();
const db = require('../db');

// --- ELECTRICITY ---

// Get electricity data for a subunit (all history for charts)
router.get('/electricity/:bolinmaId', (req, res) => {
    const { bolinmaId } = req.params;
    if (bolinmaId === 'summary') {
        db.all('SELECT * FROM metrology_electricity ORDER BY id DESC', [], (err, rows) => {
            if (err) return res.status(500).json({ message: 'DB error' });
            res.json(rows);
        });
        return;
    }
    // Return all records for the subdivision, ordered by date
    db.all('SELECT * FROM metrology_electricity WHERE bolinma_id = ? ORDER BY id DESC', [bolinmaId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json(rows);
    });
});

// Update electricity reading (Submits as pending)
router.post('/electricity', (req, res) => {
    const { bolinmaId, lastReading, currentMonth, month_year } = req.body;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const mYear = month_year || date.substring(0, 7); // e.g. "2026-06"

    db.run(`INSERT INTO metrology_electricity (bolinma_id, lastReading, currentMonth, date, month_year, status) 
            VALUES (?, ?, ?, ?, ?, 'pending') 
            ON CONFLICT(bolinma_id, date) DO UPDATE SET 
            lastReading=excluded.lastReading, 
            currentMonth=excluded.currentMonth,
            status='pending',
            rejection_reason=NULL`,
        [bolinmaId, lastReading, currentMonth, date, mYear], (err) => {
            if (err) return res.status(500).json({ message: 'Save error', error: err.message });
            res.json({ message: 'Electricity submitted for approval' });
        });
});

// Admin Approve/Reject electricity reading
router.put('/electricity/:id/status', (req, res) => {
    const { status, rejection_reason } = req.body; // 'approved' or 'rejected'
    const { id } = req.params;

    db.run('UPDATE metrology_electricity SET status = ?, rejection_reason = ? WHERE id = ?',
        [status, rejection_reason || null, id], function (err) {
            if (err) return res.status(500).json({ message: 'Update error', error: err.message });
            res.json({ message: `Electricity reading ${status}` });
        });
});

// --- DEVICES ---

// Get devices list
router.get('/devices', (req, res) => {
    const bolinmaId = req.query.bolinma_id;
    let query = 'SELECT * FROM metrology_devices';
    let params = [];

    if (bolinmaId && bolinmaId !== 'admin') {
        query += ' WHERE bolinma_id = ?';
        params.push(bolinmaId);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json(rows);
    });
});

// Get upcoming devices (LGM list - within 30 days of expiry)
router.get('/devices/upcoming', (req, res) => {
    const today = new Date();
    db.all('SELECT * FROM metrology_devices', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        
        const upcoming = rows.filter(d => {
            if (!d.stampDate) return false;
            const name = (d.name || '').toLowerCase().trim();
            const stamp = new Date(d.stampDate);
            
            let years = 1;
            let isElektr = false;
            if (name.includes('elektr hisoblagich') || name.includes('hisoblagich')) {
                years = 4;
                isElektr = true;
            }
            
            const expiry = new Date(stamp.getFullYear() + years, stamp.getMonth(), stamp.getDate());
            const daysLeft = (expiry - today) / (1000 * 60 * 60 * 24);
            
            // Determine main upcoming threshold (Red light threshold)
            let mainThreshold = isElektr ? 180 : 30;
            const mainUpcoming = daysLeft <= mainThreshold;
            
            if (name.includes('shablon')) {
                // Also check 3-month label (birka) expiration
                // If birkaDate exists, use it. Otherwise fallback to stampDate.
                const birkaStart = d.birkaDate ? new Date(d.birkaDate) : stamp;
                const birkaExpiry = new Date(birkaStart.getTime() + 90 * 24 * 60 * 60 * 1000);
                const birkaDaysLeft = (birkaExpiry - today) / (1000 * 60 * 60 * 24);
                // Shablon birka Red threshold is 20 days
                const birkaUpcoming = birkaDaysLeft <= 20;
                return mainUpcoming || birkaUpcoming;
            }
            
            return mainUpcoming;
        });
        
        res.json(upcoming);
    });
});

// Add device record
router.post('/devices', (req, res) => {
    const { bolinma_id, name, serial, stampDate, birkaDate } = req.body;
    db.run('INSERT INTO metrology_devices (bolinma_id, name, serial, stampDate, birkaDate) VALUES (?, ?, ?, ?, ?)',
        [bolinma_id, name, serial, stampDate, birkaDate || null], function (err) {
            if (err) return res.status(500).json({ message: 'Save error' });
            res.json({ message: 'Device added', id: this.lastID });
        });
});

// Update device details
router.put('/devices/:id', (req, res) => {
    const { name, serial, stampDate, birkaDate } = req.body;
    const { id } = req.params;
    db.run('UPDATE metrology_devices SET name = ?, serial = ?, stampDate = ?, birkaDate = ? WHERE id = ?',
        [name, serial, stampDate, birkaDate || null, id], function (err) {
            if (err) return res.status(500).json({ message: 'Update error', error: err.message });
            res.json({ message: 'Device updated' });
        });
});

// Delete device
router.delete('/devices/:id', (req, res) => {
    db.run('DELETE FROM metrology_devices WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Delete error' });
        res.json({ message: 'Device deleted' });
    });
});

module.exports = router;
