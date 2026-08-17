const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all carts
router.get('/', (req, res) => {
    db.all('SELECT * FROM defectoscope_carts', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Update or add a cart
router.post('/update', (req, res) => {
    const { cart_id, operator, start_km, end_km, current_km, status } = req.body;
    
    db.get('SELECT id FROM defectoscope_carts WHERE cart_id = ?', [cart_id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        if (row) {
            db.run(
                'UPDATE defectoscope_carts SET operator=?, start_km=?, end_km=?, current_km=?, status=?, last_updated=CURRENT_TIMESTAMP WHERE cart_id=?',
                [operator, start_km, end_km, current_km, status, cart_id],
                function(err) {
                    if (err) return res.status(500).json({ message: 'Update failed' });
                    res.json({ message: 'Cart updated' });
                }
            );
        } else {
            db.run(
                'INSERT INTO defectoscope_carts (cart_id, operator, start_km, end_km, current_km, status) VALUES (?, ?, ?, ?, ?, ?)',
                [cart_id, operator, start_km, end_km, current_km, status],
                function(err) {
                    if (err) return res.status(500).json({ message: 'Insert failed' });
                    res.json({ message: 'Cart created' });
                }
            );
        }
    });
});

module.exports = router;
