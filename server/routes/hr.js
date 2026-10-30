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
    if (username.includes('bolinma') || username.includes("bo'linma") || username.includes('sex') || username.includes("bo'lim") || username.includes('bolim')) {
        const numMatch = username.match(/\d+/);
        if (numMatch) {
            return username.includes('sex') ? `${numMatch[0]}-sex` : `${numMatch[0]}-bo'linma`;
        }
    }
    
    // 2. Explicit bolinmalar array
    if (user.bolinmalar && user.bolinmalar.length > 0) {
        const raw = user.bolinmalar[0];
        const numMatch = String(raw).match(/\d+/);
        if (numMatch) {
            return String(raw).toLowerCase().includes('sex') ? `${numMatch[0]}-sex` : `${numMatch[0]}-bo'linma`;
        }
        return raw;
    }

    // 2b. Departments containing a bo'linma/bo'lim/sex
    if (user.departments && user.departments.length > 0) {
        const d0 = user.departments[0];
        const d0Low = String(d0).toLowerCase();
        if (d0Low.includes('bo\'linma') || d0Low.includes('bolinma') || d0Low.includes('bo\'lim') || d0Low.includes('bolim') || d0Low.includes('sex')) {
            const numMatch = String(d0).match(/\d+/);
            if (numMatch) {
                return d0Low.includes('sex') ? `${numMatch[0]}-sex` : `${numMatch[0]}-bo'linma`;
            }
            return d0;
        }
    }
    
    if (role === 'bolinma' || role === 'subdivision') {
        const numMatch = username.match(/\d+/);
        return numMatch ? `${numMatch[0]}-bo'linma` : '1-bo\'linma';
    }
    
    return null;
}

// Get all employees (with optional filters)
router.get('/employees', (req, res) => {
    // Auto-fix subdivision users' bolinmalar if empty
    try {
        db.serialize(() => {
            for (let i = 1; i <= 10; i++) {
                db.run(
                    `UPDATE users SET bolinmalar = ? WHERE username = ? AND (bolinmalar IS NULL OR bolinmalar = '' OR bolinmalar = '[]')`,
                    [JSON.stringify([`${i}-bo'linma`]), `bolinma${i}`]
                );
            }
        });
    } catch (dbErr) {
        console.error('Database migration/auto-fix failed:', dbErr.message);
    }

    const { bolinma_id, department_id, status, search } = req.query;
    let query = 'SELECT * FROM employees';
    let conditions = [];
    let params = [];

    // Enforce subdivision filter if applicable
    const subId = getSubdivisionId(req.user);
    const activeBolinma = subId || (bolinma_id !== 'all' ? bolinma_id : null);
    if (activeBolinma) {
        const numMatch = String(activeBolinma).match(/\d+/);
        if (numMatch) {
            const num = numMatch[0];
            if (String(activeBolinma).toLowerCase().includes('sex')) {
                conditions.push("(bolinma_id LIKE ? OR bolinma_id LIKE ?)");
                params.push(`${num}-sex%`);
                params.push(`sex${num}%`);
            } else {
                conditions.push("(bolinma_id LIKE ? OR bolinma_id LIKE ?)");
                params.push(`${num}-bo'linma%`);
                params.push(`bolinma${num}%`);
            }
        } else {
            conditions.push("bolinma_id = ?");
            params.push(activeBolinma);
        }
    }

    if (department_id) {
        conditions.push('department_id = ?');
        params.push(department_id);
    }
    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    if (search) {
        conditions.push('full_name LIKE ?');
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY full_name ASC';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

const { validate } = require('../middleware/validator');

const employeeSchema = {
    full_name: { required: true, type: 'string', min: 3 },
    bolinma_id: { required: true }
};

// Create employee
router.post('/', validate(employeeSchema), (req, res) => {
    const { full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, obektivka, relatives } = req.body;
    db.run(
        `INSERT INTO employees (full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, obektivka, relatives) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status || 'active', obektivka || null, relatives || null],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ id: this.lastID, message: 'Employee added successfully' });
        }
    );
});

// Update employee
router.put('/employees/:id', (req, res) => {
    const { full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, tabel_number, face_template, obektivka, relatives } = req.body;
    db.run(
        `UPDATE employees SET full_name=?, department_id=?, bolinma_id=?, position=?, rank=?, birth_date=?, phone=?, hired_date=?, medical_checkup_date=?, last_training_date=?, status=?, tabel_number=?, face_template=?, obektivka=?, relatives=? 
         WHERE id = ?`,
        [full_name, department_id, bolinma_id, position, rank, birth_date, phone, hired_date, medical_checkup_date, last_training_date, status, tabel_number, face_template, obektivka || null, relatives || null, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Employee updated successfully' });
        }
    );
});

// Update Face ID template (Automatic on first scan)
router.patch('/employees/:id/face', (req, res) => {
    const { face_template } = req.body;
    db.run(
        `UPDATE employees SET face_template = ? WHERE id = ?`,
        [face_template, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Face ID template updated' });
        }
    );
});

// Delete employee
router.delete('/employees/:id', (req, res) => {
    db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(404).json({ message: 'Xodim topilmadi' });
        res.json({ message: 'Xodim muvaffaqiyatli o\'chirildi' });
    });
});

// Update vacation dates
router.patch('/employees/:id/vacation', (req, res) => {
    const { vacation_start_date, vacation_end_date } = req.body;
    db.run(
        'UPDATE employees SET vacation_start_date = ?, vacation_end_date = ? WHERE id = ?',
        [vacation_start_date, vacation_end_date, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Ta\'til ma\'lumotlari yangilandi' });
        }
    );
});

// Get employee statistics
router.get('/stats', (req, res) => {
    const subId = getSubdivisionId(req.user);
    let query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'vacation' THEN 1 ELSE 0 END) as on_vacation,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM employees
    `;
    let params = [];
    const activeBolinma = subId || (req.query.bolinma_id !== 'all' ? req.query.bolinma_id : null);
    if (activeBolinma) {
        const numMatch = String(activeBolinma).match(/\d+/);
        if (numMatch) {
            const num = numMatch[0];
            if (String(activeBolinma).toLowerCase().includes('sex')) {
                query += " WHERE (bolinma_id LIKE ? OR bolinma_id LIKE ?)";
                params.push(`${num}-sex%`);
                params.push(`sex${num}%`);
            } else {
                query += " WHERE (bolinma_id LIKE ? OR bolinma_id LIKE ?)";
                params.push(`${num}-bo'linma%`);
                params.push(`bolinma${num}%`);
            }
        } else {
            query += " WHERE bolinma_id = ?";
            params.push(activeBolinma);
        }
    }

    db.get(query, params, (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row);
    });
});

// Bulk import from E-Xodim
router.post('/import-exodim', (req, res) => {
    const { employees, clearFirst } = req.body;
    if (!employees || !Array.isArray(employees)) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        if (clearFirst) {
            db.run('DELETE FROM employees');
        }

        const stmt = db.prepare(`
            INSERT INTO employees (
                full_name, position, department_id, bolinma_id, 
                phone, birth_date, hired_date, status, tabel_number,
                medical_checkup_date, vacation_start_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        employees.forEach(emp => {
            stmt.run([
                emp.name || emp.full_name,
                emp.position || 'Xodim',
                emp.department || emp.department_id,
                emp.department || emp.bolinma_id,
                emp.phone || '',
                emp.birthday || emp.birth_date,
                emp.hireDate || emp.hire_date || emp.hired_date,
                emp.status || 'active',
                emp.tabelNumber || emp.tabel_number || '',
                emp.medicalDate || emp.medical_checkup_date || '',
                emp.vacationStart || emp.vacation_start_date || ''
            ]);
        });

        stmt.finalize((err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: err.message });
            }
            db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json({ message: `${employees.length} employees imported successfully` });
            });
        });
    });
});

module.exports = router;
