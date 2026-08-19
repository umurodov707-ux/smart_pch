const express = require('express');
const router = express.Router();

module.exports = function(db, requireRole) {

    const sendError = (res, statusCode, message) => {
        res.status(statusCode).json({ error: message });
    };

    // GET — Bir bo'linmaning barcha PKZ relslarini olish
    router.get('/:bolinmaId', requireRole(['admin', 'bolinma', 'department', 'subdivision', 'dispatcher']), async (req, res) => {
        const { bolinmaId } = req.params;
        try {
            const isPg = db.isPostgres;
            const query = isPg
                ? `SELECT * FROM pkz_rails WHERE bolinma_id = $1 ORDER BY km, pk`
                : `SELECT * FROM pkz_rails WHERE bolinma_id = ? ORDER BY km, pk`;

            const rows = isPg
                ? await db.all(query, [bolinmaId])
                : await new Promise((resolve, reject) => {
                    db.all(query, [bolinmaId], (err, rows) => {
                        if (err) reject(err); else resolve(rows);
                    });
                });

            res.json(rows || []);
        } catch (err) {
            console.error('[PKZ Rails] GET error:', err);
            sendError(res, 500, 'Serverda xatolik: ' + err.message);
        }
    });

    // GET SUMMARY — KPI uchun umumiy hisobot
    router.get('/:bolinmaId/summary', requireRole(['admin', 'bolinma', 'department', 'subdivision', 'dispatcher']), async (req, res) => {
        const { bolinmaId } = req.params;
        try {
            const isPg = db.isPostgres;
            const query = isPg
                ? `SELECT status, SUM(quantity) as total_qty, COUNT(*) as row_count FROM pkz_rails WHERE bolinma_id = $1 GROUP BY status`
                : `SELECT status, SUM(quantity) as total_qty, COUNT(*) as row_count FROM pkz_rails WHERE bolinma_id = ? GROUP BY status`;

            const rows = isPg
                ? await db.all(query, [bolinmaId])
                : await new Promise((resolve, reject) => {
                    db.all(query, [bolinmaId], (err, rows) => {
                        if (err) reject(err); else resolve(rows);
                    });
                });

            const summary = { yangi: 0, yaroqli: 0, brak: 0, total: 0 };
            (rows || []).forEach(r => {
                const qty = parseInt(r.total_qty) || 0;
                summary.total += qty;
                if (r.status === 'yangi') summary.yangi = qty;
                else if (r.status === 'yaroqli') summary.yaroqli = qty;
                else if (r.status === 'brak') summary.brak = qty;
            });

            res.json(summary);
        } catch (err) {
            console.error('[PKZ Rails] SUMMARY error:', err);
            sendError(res, 500, 'Serverda xatolik: ' + err.message);
        }
    });

    // POST — Yangi yozuv qo'shish
    router.post('/', requireRole(['admin', 'bolinma', 'department', 'subdivision', 'dispatcher']), async (req, res) => {
        const { bolinma_id, km, pk, side, rail_type, length, quantity, status, notes } = req.body;

        if (!bolinma_id || !km) {
            return sendError(res, 400, "bolinma_id va km majburiy!");
        }

        try {
            const isPg = db.isPostgres;
            const query = isPg
                ? `INSERT INTO pkz_rails (bolinma_id, km, pk, side, rail_type, length, quantity, status, notes)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`
                : `INSERT INTO pkz_rails (bolinma_id, km, pk, side, rail_type, length, quantity, status, notes)
                   VALUES (?,?,?,?,?,?,?,?,?)`;

            const params = [bolinma_id, km || null, pk || null, side || null, rail_type || 'R-65',
                            length || null, quantity || 1, status || 'yangi', notes || null];

            if (isPg) {
                const result = await db.get(query, params);
                res.status(201).json(result);
            } else {
                const lastID = await new Promise((resolve, reject) => {
                    db.run(query, params, function(err) {
                        if (err) reject(err); else resolve(this.lastID);
                    });
                });
                res.status(201).json({ id: lastID, message: "Muvaffaqiyatli saqlandi" });
            }
        } catch (err) {
            console.error('[PKZ Rails] POST error:', err);
            sendError(res, 500, 'Serverda xatolik: ' + err.message);
        }
    });

    // PUT — Yozuvni yangilash
    router.put('/:id', requireRole(['admin', 'bolinma', 'department', 'subdivision', 'dispatcher']), async (req, res) => {
        const { id } = req.params;
        const { km, pk, side, rail_type, length, quantity, status, notes } = req.body;

        try {
            const isPg = db.isPostgres;
            const query = isPg
                ? `UPDATE pkz_rails SET km=$1, pk=$2, side=$3, rail_type=$4, length=$5, quantity=$6, status=$7, notes=$8 WHERE id=$9 RETURNING *`
                : `UPDATE pkz_rails SET km=?, pk=?, side=?, rail_type=?, length=?, quantity=?, status=?, notes=? WHERE id=?`;

            const params = [km, pk, side, rail_type, length, quantity, status, notes, id];

            if (isPg) {
                const result = await db.get(query, params);
                if (result) res.json(result);
                else sendError(res, 404, "Topilmadi");
            } else {
                const changes = await new Promise((resolve, reject) => {
                    db.run(query, params, function(err) {
                        if (err) reject(err); else resolve(this.changes);
                    });
                });
                if (changes > 0) res.json({ id, message: "Yangilandi" });
                else sendError(res, 404, "Topilmadi");
            }
        } catch (err) {
            console.error('[PKZ Rails] PUT error:', err);
            sendError(res, 500, 'Serverda xatolik: ' + err.message);
        }
    });

    // DELETE — Yozuvni o'chirish
    router.delete('/:id', requireRole(['admin', 'bolinma', 'department', 'subdivision', 'dispatcher']), async (req, res) => {
        const { id } = req.params;
        try {
            const isPg = db.isPostgres;
            const query = isPg
                ? `DELETE FROM pkz_rails WHERE id = $1`
                : `DELETE FROM pkz_rails WHERE id = ?`;

            if (isPg) {
                await db.run(query, [id]);
                res.json({ success: true });
            } else {
                const changes = await new Promise((resolve, reject) => {
                    db.run(query, [id], function(err) {
                        if (err) reject(err); else resolve(this.changes);
                    });
                });
                if (changes > 0) res.json({ success: true });
                else sendError(res, 404, "Topilmadi");
            }
        } catch (err) {
            console.error('[PKZ Rails] DELETE error:', err);
            sendError(res, 500, 'Serverda xatolik: ' + err.message);
        }
    });

    return router;
};
