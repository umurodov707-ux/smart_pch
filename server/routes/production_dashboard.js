const express = require('express');
const router = express.Router();

/**
 * PRODUCTION DASHBOARD API v1.0
 * Aggregates data from Plets, Izostiklar, and PKZ modules for a unified central view.
 */
module.exports = function(db, requireRole) {
    
    const sendError = (res, statusCode, message) => {
        res.status(statusCode).json({ error: message });
    };

    router.get('/summary', requireRole(['admin', 'department']), async (req, res) => {
        try {
            const isPg = db.isPostgres;
            
            // Promise-based execution helper
            const queryAll = (sql, params = []) => {
                return new Promise((resolve, reject) => {
                    if (isPg) {
                        db.all(sql, params).then(resolve).catch(reject);
                    } else {
                        db.all(sql, params, (err, rows) => {
                            if (err) reject(err); else resolve(rows || []);
                        });
                    }
                });
            };

            const { bolinma_id } = req.query;
            
            // Aggregated Summary Data from all 3 modules
            let pletsQuery = "SELECT id, bolinma_id, plet_number, start_km, start_pk, end_km, end_pk, length, status FROM plets_advanced";
            let izostiksQuery = "SELECT id, bolinma_id, km, group_name, num, type, last_date, performer FROM izostiklar";
            let pkzQuery = "SELECT id, bolinma_id, km, pk, side, rail_type, length, quantity, status FROM pkz_rails";
            
            const params = [];
            if (bolinma_id && bolinma_id !== 'all') {
                const filter = " WHERE bolinma_id = ?";
                pletsQuery += filter;
                izostiksQuery += filter;
                pkzQuery += filter;
                params.push(bolinma_id);
            }

            const [plets, izostiks, pkz] = await Promise.all([
                queryAll(pletsQuery, params),
                queryAll(izostiksQuery, params),
                queryAll(pkzQuery, params)
            ]);

            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                data: {
                    plets,
                    izostiks,
                    pkz_rails: pkz
                }
            });
        } catch (error) {
            console.error('[Production Dashboard] API Error:', error);
            sendError(res, 500, 'Dashboard ma\'lumotlarini yig\'ishda xatolik: ' + error.message);
        }
    });

    return router;
};
