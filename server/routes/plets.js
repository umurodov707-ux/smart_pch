const express = require('express');
const router = express.Router();

module.exports = function(db, requireRole, adminOnly) {

    const sendError = (res, statusCode, message, details = null) => {
        res.status(statusCode).json({ message, details });
    };

    // DB Promise Helpers to handle callback-based db.js
    const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });

    const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err); 
            else resolve(db.isPostgres ? this : { lastID: this.lastID, changes: this.changes });
        });
    });

    // 1. Get Details & Diagnostics (Real) - MUST BE FIRST
    router.get('/details/:id', requireRole(['admin', 'bolinma', 'department']), async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 400, "Noto'g'ri ID ko'rsatildi");
        try {
            // Note: Table plet_history should ideally be created via migration or initSchema.
            // We assume it exists to avoid blocking requests with dynamic DDL.
            const plet = await dbGet(`SELECT * FROM plets_advanced WHERE id = ?`, [id]);
            if (!plet) return sendError(res, 404, "Plet topilmadi");

            const history = await dbAll(`SELECT temp, recorded_at as date, status FROM plet_history WHERE plet_id = ? ORDER BY recorded_at DESC LIMIT 10`, [id]);

            const diagnostics = {
                temp_history: history.length > 0 ? history.map(h => ({
                    date: new Date(h.date).toLocaleDateString(),
                    temp: parseFloat(h.temp),
                    status: h.status
                })) : [
                    { date: new Date().toLocaleDateString(), temp: parseFloat(plet.neutral_temp), status: plet.status }
                ],
                last_safety_check: plet.install_date || 'Noma\'lum',
                stress_level: parseFloat(plet.neutral_temp) > 35 ? 'O\'rta' : 'Past',
                predictions: 'Barqaror'
            };

            res.json({ ...plet, diagnostics });
        } catch (err) {
            console.error(`[Plets API Error] Detail view failed for ID ${id}:`, err);
            sendError(res, 500, "Bazada xatolik: " + err.message);
        }
    });

    // 2. Fetch plets for a subdivision
    router.get('/:bolinmaId', requireRole(['admin', 'bolinma', 'department']), async (req, res) => {
        const { bolinmaId } = req.params;
        try {
            const query = bolinmaId === 'all' ? 
                `SELECT * FROM plets_advanced ORDER BY id DESC` :
                `SELECT * FROM plets_advanced WHERE bolinma_id = ? ORDER BY id DESC`;
            
            const rows = await dbAll(query, bolinmaId === 'all' ? [] : [bolinmaId]);
            res.json(rows || []);
        } catch (err) {
            console.error("Error fetching plets:", err);
            sendError(res, 500, "Ma'lumotlarni yuklashda xatolik: " + err.message);
        }
    });

    // 3. Save new plet
    router.post('/', requireRole(['admin', 'bolinma', 'department']), async (req, res) => {
        const { bolinma_id, plet_number, start_km, start_pk, end_km, end_pk, length, install_date, neutral_temp, buffer_rails, status } = req.body;
        if (!bolinma_id || !plet_number) return sendError(res, 400, "Majburiy maydonlar to'ldirilmadi");

        try {
            const historyStr = JSON.stringify([{ action: "Yaratildi", date: new Date().toISOString(), user: req.user ? req.user.username : 'tizim' }]);
            const sql = `INSERT INTO plets_advanced (bolinma_id, plet_number, start_km, start_pk, end_km, end_pk, length, install_date, neutral_temp, buffer_rails, status, history) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [bolinma_id, plet_number, start_km, start_pk, end_km, end_pk, length, install_date, neutral_temp, buffer_rails, status, historyStr];
            
            await dbRun(sql, params);
            res.status(201).json({ success: true, message: "Muvaffaqiyatli saqlandi" });
        } catch (err) {
            console.error("Error creating plet:", err);
            sendError(res, 500, "Saqlashda xatolik: " + err.message);
        }
    });

    // 4. Update plet
    router.put('/:id', requireRole(['admin', 'bolinma', 'department']), async (req, res) => {
        const { id } = req.params;
        const { plet_number, start_km, start_pk, end_km, end_pk, length, install_date, neutral_temp, buffer_rails, status, history } = req.body;

        try {
            const historyStr = typeof history === 'string' ? history : JSON.stringify(history || []);
            const sql = `UPDATE plets_advanced SET plet_number=?, start_km=?, start_pk=?, end_km=?, end_pk=?, length=?, install_date=?, neutral_temp=?, buffer_rails=?, status=?, history=? WHERE id=?`;
            const params = [plet_number, start_km, start_pk, end_km, end_pk, length, install_date, neutral_temp, buffer_rails, status, historyStr, id];
            
            await dbRun(sql, params);
            // Also add current update to history entries
            await dbRun(`INSERT INTO plet_history (plet_id, temp, status) VALUES (?, ?, ?)`, [id, neutral_temp, status]);

            res.json({ success: true, message: "Muvaffaqiyatli yangilandi" });
        } catch (err) {
            console.error("Error updating plet:", err);
            sendError(res, 500, "Yangilashda xatolik: " + err.message);
        }
    });

    // 5. Delete Plet
    router.delete('/:id', requireRole(['admin', 'bolinma', 'department']), async (req, res) => {
        const { id } = req.params;
        try {
            await dbRun(`DELETE FROM plets_advanced WHERE id = ?`, [id]);
            res.json({ success: true, message: "O'chirildi" });
        } catch (err) {
            sendError(res, 500, "O'chirishda xatolik: " + err.message);
        }
    });

    return router;
};
