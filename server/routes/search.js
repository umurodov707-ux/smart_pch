const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/search
 * Dynamic global search across all active modules
 */
router.get('/', (req, res) => {
    const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
    if (!query || query.length < 2) return res.json([]);

    const results = [];
    const searchTasks = [];

    // 1. Search Users/Employees
    searchTasks.push(new Promise((resolve) => {
        db.all("SELECT full_name, username, role FROM users WHERE full_name LIKE ? OR username LIKE ?", [`%${query}%`, `%${query}%`], (err, rows) => {
            if (!err) rows.forEach(u => results.push({ type: 'worker', name: u.full_name, meta: `@${u.username} - ${u.role}`, icon: 'fa-user-tie' }));
            resolve();
        });
    }));

    // 2. Search Reports (Deep Search in structuredData)
    searchTasks.push(new Promise((resolve) => {
        db.all("SELECT bolinma_id, date, structuredData FROM reports WHERE bolinma_id LIKE ? OR date LIKE ? OR structuredData LIKE ?", [`%${query}%`, `%${query}%`, `%${query}%`], (err, rows) => {
            if (!err) rows.forEach(r => {
                results.push({ 
                    type: 'report', 
                    bolinma_id: r.bolinma_id, // bo'linma bo'yicha ajratish uchun (middleware/bolinmaScope.js)
                    name: `${r.bolinma_id} Hisoboti`, 
                    meta: `${r.date} sanasidagi tezkor hisobot`, 
                    icon: 'fa-file-invoice' 
                });
            });
            resolve();
        });
    }));

    // 3. Search PU-74 Acts
    searchTasks.push(new Promise((resolve) => {
        db.all("SELECT act_number, location_name, date, bolinma_id FROM pu74_data WHERE act_number LIKE ? OR location_name LIKE ? OR details LIKE ?", [`%${query}%`, `%${query}%`, `%${query}%`], (err, rows) => {
            if (!err) rows.forEach(a => {
                results.push({ 
                    type: 'pu74', 
                    bolinma_id: a.bolinma_id,
                    name: `D-74 №${a.act_number}`, 
                    meta: `${a.location_name} (${a.date})`, 
                    icon: 'fa-file-signature' 
                });
            });
            resolve();
        });
    }));

    Promise.all(searchTasks).then(() => {
        // Limit results and return
        res.json(results.slice(0, 10));
    });
});

module.exports = router;
