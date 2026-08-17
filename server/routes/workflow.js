const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Universal Workflow API
 */

// 1. Get status for a specific document
router.get('/:doc_type/:doc_id', (req, res) => {
    const { doc_type, doc_id } = req.params;
    
    db.get('SELECT * FROM document_workflow WHERE doc_type = ? AND doc_id = ?', [doc_type, doc_id], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!row) return res.json({ status: 'not_started' });
        
        try {
            row.workflow_path = JSON.parse(row.workflow_path || '[]');
            row.history = JSON.parse(row.history || '[]');
        } catch (e) {
            console.error('JSON parse error in workflow:', e);
        }
        
        res.json(row);
    });
});

// 2. Submit document to workflow (Initialization)
router.post('/submit', (req, res) => {
    const { doc_type, doc_id, workflow_path } = req.body;
    
    if (!doc_type || !doc_id || !workflow_path || !Array.isArray(workflow_path)) {
        return res.status(400).json({ message: 'Ma\'lumotlar to\'liq emas' });
    }

    const query = `
        INSERT INTO document_workflow (doc_type, doc_id, workflow_path, current_step_index, status, history)
        VALUES (?, ?, ?, 0, 'pending', '[]')
        ON CONFLICT(doc_type, doc_id) DO UPDATE SET
        workflow_path = excluded.workflow_path,
        current_step_index = 0,
        status = 'pending',
        last_updated = CURRENT_TIMESTAMP
    `;

    db.run(query, [doc_type, doc_id, JSON.stringify(workflow_path)], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Hujjat workflowga muvaffaqiyatli yuborildi', id: this.lastID });
    });
});

// 3. Sign / Advance workflow
router.post('/sign', (req, res) => {
    const { doc_type, doc_id, signature, comment } = req.body;
    const user = req.user || {}; // Assuming Auth middleware provides user

    db.get('SELECT * FROM document_workflow WHERE doc_type = ? AND doc_id = ?', [doc_type, doc_id], (err, workflow) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!workflow) return res.status(404).json({ message: 'Workflow topilmadi' });

        const path = JSON.parse(workflow.workflow_path || '[]');
        const history = JSON.parse(workflow.history || '[]');
        const currentIndex = workflow.current_step_index;
        const requiredRole = path[currentIndex];

        // Check permission: User must have the required role or be in the required department
        const userHasRole = (user.role === requiredRole) || (user.departments && user.departments.includes(requiredRole));
        if (!userHasRole && user.role !== 'admin') {
            return res.status(403).json({ message: `Sizda ushbu bosqichda imzolash huquqi yo'q. Faqat ${requiredRole} imzolashi mumkin.` });
        }

        // Advance logic
        const nextIndex = currentIndex + 1;
        const isCompleted = nextIndex >= path.length;
        const newStatus = isCompleted ? 'completed' : 'pending';

        // Add to history
        history.push({
            step: currentIndex,
            role: requiredRole,
            user_id: user.id || 0,
            user_name: user.full_name || user.username,
            date: new Date().toISOString(),
            signature: signature || 'APPROVED_LOCAL',
            comment: comment || ''
        });

        const updateQuery = `
            UPDATE document_workflow 
            SET current_step_index = ?, 
                status = ?, 
                history = ?, 
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(updateQuery, [nextIndex, newStatus, JSON.stringify(history), workflow.id], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            
            // Also optionally update the source table's status if needed
            // This can be done via a hook or a simple direct update if standardized
            
            const io = req.app.get('io');
            if (io) {
                io.emit('workflow_update', {
                    doc_type,
                    doc_id,
                    status: newStatus,
                    next_role: path[nextIndex] || null,
                    action: 'sign'
                });
            }
            
            res.json({ 
                message: isCompleted ? 'Hujjat to\'liq tasdiqlandi' : 'Hujjat keyingi bosqichga yuborildi',
                status: newStatus,
                next_role: path[nextIndex] || null
            });
        });
    });
});

// 4. Reject / Return workflow
router.post('/reject', (req, res) => {
    const { doc_type, doc_id, comment } = req.body;
    const user = req.user || {};

    db.get('SELECT * FROM document_workflow WHERE doc_type = ? AND doc_id = ?', [doc_type, doc_id], (err, workflow) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!workflow) return res.status(404).json({ message: 'Workflow topilmadi' });

        const path = JSON.parse(workflow.workflow_path || '[]');
        const history = JSON.parse(workflow.history || '[]');
        const currentIndex = workflow.current_step_index;
        const requiredRole = path[currentIndex];

        // Check permission
        const userHasRole = (user.role === requiredRole) || (user.departments && user.departments.includes(requiredRole));
        if (!userHasRole && user.role !== 'admin') {
            return res.status(403).json({ message: `Sizda ushbu bosqichda rad etish huquqi yo'q. Faqat ${requiredRole} hal qilishi hojat.` });
        }

        if (!comment) {
            return res.status(400).json({ message: 'Rad etish sababi (izoh) kiritilishi shart' });
        }

        history.push({
            step: currentIndex,
            role: requiredRole,
            user_id: user.id || 0,
            user_name: user.full_name || user.username,
            date: new Date().toISOString(),
            signature: 'REJECTED',
            comment: comment
        });

        const updateQuery = `
            UPDATE document_workflow 
            SET status = 'rejected', 
                history = ?, 
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(updateQuery, [JSON.stringify(history), workflow.id], function(err) {
            if (err) return res.status(500).json({ message: err.message });
            
            const io = req.app.get('io');
            if (io) {
                io.emit('workflow_update', {
                    doc_type,
                    doc_id,
                    status: 'rejected',
                    action: 'reject',
                    comment: comment
                });
            }

            res.json({ message: 'Hujjat rad etildi', status: 'rejected' });
        });
    });
});

module.exports = router;
