const express = require('express');
const router = express.Router();
const db = require('../db');
const { safeParse } = require('../utils/safeJson');

/**
 * GET /api/pu74_monthly
 * Oylik hujjatni yuklash
 */
router.get('/', (req, res) => {
    const { bolinma, month } = req.query;
    
    if (!bolinma || !month) {
        return res.status(400).json({ success: false, message: 'bolinma va month parametrlari majburiy' });
    }
    
    const query = 'SELECT * FROM pu74_monthly_documents WHERE bolinma_id = ? AND year_month = ?';
    db.get(query, [bolinma, month], (err, row) => {
        if (err) {
            console.error('Baza xatosi (GET /pu74_monthly):', err);
            return res.status(500).json({ success: false, message: 'Ichki xatolik' });
        }
        
        if (row) {
            res.json({
                success: true,
                data: safeParse(row.document_data, {}),
                status: row.status,
                signed_by: safeParse(row.signed_by, []),
                updated_at: row.updated_at
            });
        } else {
            res.json({ success: true, data: null, status: 'draft', signed_by: [] });
        }
    });
});

/**
 * POST /api/pu74_monthly/save
 * Oylik hujjatni saqlash (qoralama - draft holatida yoki umumiy yangilash)
 */
router.post('/save', (req, res) => {
    const { bolinma, month, data } = req.body;
    
    if (!bolinma || !month || !data) {
        return res.status(400).json({ success: false, message: 'Noto\'g\'ri parametrlar' });
    }
    
    // Check if document is already approved
    const checkQuery = 'SELECT status FROM pu74_monthly_documents WHERE bolinma_id = ? AND year_month = ?';
    db.get(checkQuery, [bolinma, month], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ichki xatolik' });
        }
        
        if (row && row.status === 'approved') {
            return res.status(403).json({ success: false, message: 'Bu hujjat allaqachon tasdiqlangan va o\'zgartirish mumkin emas!' });
        }
        
        const dataStr = JSON.stringify(data);
        
        if (row) {
            // Hujjat mavjud, yangilaymiz
            const updateQuery = 'UPDATE pu74_monthly_documents SET document_data = ?, updated_at = CURRENT_TIMESTAMP WHERE bolinma_id = ? AND year_month = ?';
            db.run(updateQuery, [dataStr, bolinma, month], (updateErr) => {
                if (updateErr) return res.status(500).json({ success: false, message: updateErr.message });
                res.json({ success: true, message: 'Saqlandi' });
            });
        } else {
            // Yangi hujjat, yaratamiz
            const insertQuery = 'INSERT INTO pu74_monthly_documents (bolinma_id, year_month, document_data, status, signed_by) VALUES (?, ?, ?, ?, ?)';
            db.run(insertQuery, [bolinma, month, dataStr, 'draft', '[]'], (insertErr) => {
                if (insertErr) return res.status(500).json({ success: false, message: insertErr.message });
                res.json({ success: true, message: 'Yangi qoralama yaratildi va saqlandi' });
            });
        }
    });
});

module.exports = router;
