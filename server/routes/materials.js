const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAdmin, inDepartment, isDispatcher } = require('../middleware/roles');

// Get M-29 acts for a department
router.get('/acts', (req, res) => {
    const { dept_id } = req.query;
    let query = 'SELECT * FROM material_acts';
    let params = [];

    if (dept_id && dept_id !== 'all') {
        query += ' WHERE dept_id = ?';
        params.push(dept_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Create new M-29 act
router.post('/acts', (req, res) => {
    const {
        dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
        year, day_month, dept_name, location_start, km, pk, misc_loc,
        work_desc, method, materials_summary, items
    } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            `INSERT INTO material_acts (
                dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
                year, day_month, dept_name, location_start, km, pk, misc_loc,
                work_desc, method, materials_summary, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                dept_id, date, station, bolinma_num, master, brigadier1, brigadier2,
                year, day_month, dept_name, location_start, km, pk, misc_loc,
                work_desc, method, materials_summary
            ],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: err.message });
                }

                const actId = this.lastID;

                if (items && items.length > 0) {
                    const stmt = db.prepare('INSERT INTO act_items (act_id, item_name, qty, uom) VALUES (?, ?, ?, ?)');
                    items.forEach(item => {
                        stmt.run([actId, item.name, item.qty, item.uom]);
                    });
                    stmt.finalize();
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ id: actId, message: 'Material act created and pending approval' });
                });
            }
        );
    });
});

// --- Storage (Warehouse) Routes ---

// Get all items in storage
router.get('/storage', (req, res) => {
    db.all('SELECT * FROM storage_items ORDER BY name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Update/Add storage items (Bulk save from Accounting table)
router.post('/storage/bulk', (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Items array required' });

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare(`
            INSERT INTO storage_items (schyot, name, uom, price, quantity) 
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET 
            schyot=excluded.schyot, uom=excluded.uom, price=excluded.price, quantity=excluded.quantity
        `);

        items.forEach(item => {
            stmt.run([item.schyot, item.name, item.uom, item.price, item.quantity]);
        });

        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ success: true, message: 'Storage updated successfully' });
        });
    });
});

// Get pending acts count or list
router.get('/acts/pending', (req, res) => {
    const { dept_id } = req.query;
    let query = "SELECT * FROM material_acts WHERE status = 'pending'";
    let params = [];

    if (dept_id) {
        query += ' AND dept_id = ?';
        params.push(dept_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Approve M-29 act (Accounting)
router.post('/acts/:id/approve', (req, res) => {
    const { id } = req.params;
    const { approved_by } = req.body;
    if (!inDepartment(req.user, 'bugalteriya')) {
        return res.status(403).json({ message: 'Faqat buxgalteriya tasdiqlaydi' });
    }

    // Bir akt ikki marta tasdiqlansa ombordan ikki marta ayirilardi
    db.get('SELECT status FROM material_acts WHERE id = ?', [id], (e0, act) => {
    if (e0) return res.status(500).json({ message: 'Ma’lumotlar bazasida xatolik' });
    if (!act) return res.status(404).json({ message: 'Akt topilmadi' });
    if (act.status === 'approved') return res.status(409).json({ message: 'Akt allaqachon tasdiqlangan' });

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. Get items to deduct from stock
        db.all('SELECT * FROM act_items WHERE act_id = ?', [id], (err, items) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: err.message });
            }

            // 2. Update stock for each item
            const updateStmt = db.prepare('UPDATE storage_items SET quantity = quantity - ? WHERE name = ?');
            items.forEach(item => {
                updateStmt.run([item.qty, item.item_name]);
            });
            updateStmt.finalize();

            // 3. Update act status
            const approvedDate = new Date().toISOString();
            db.run("UPDATE material_acts SET status = 'approved', approved_date = ?, approved_by = ? WHERE id = ?", 
                [approvedDate, approved_by || 'Accounting', id], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: err.message });
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.json({ success: true, message: 'Act approved and stock updated' });
                });
            });
        });
    });
    });
});

// Reject M-29 act
router.post('/acts/:id/reject', (req, res) => {
    const { id } = req.params;
    if (!inDepartment(req.user, 'bugalteriya')) {
        return res.status(403).json({ message: 'Faqat buxgalteriya rad eta oladi' });
    }
    db.run("UPDATE material_acts SET status = 'rejected' WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true });
    });
});

// --- Archive Routes ---

// Get accounting archives
router.get('/archives', (req, res) => {
    const { dept_id } = req.query;
    let query = 'SELECT * FROM accounting_archives';
    let params = [];

    if (dept_id && dept_id !== 'all') {
        query += ' WHERE bolinma_id = ?';
        params.push(dept_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Create accounting archive (Bulk sync)
router.post('/archives', (req, res) => {
    const { bolinma_id, filename, period, summary, data } = req.body;
    
    db.run(
        `INSERT INTO accounting_archives (bolinma_id, filename, period, summary, data) 
         VALUES (?, ?, ?, ?, ?)`,
        [bolinma_id, filename, period, summary, typeof data === 'string' ? data : JSON.stringify(data)],
        function(err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

module.exports = router;
