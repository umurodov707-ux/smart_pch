/**
 * PU-74 jurnali API (brigada + oy).
 *
 *   GET  /api/pu74-journal/:bolinma/:brigade                 — oylar ro'yxati
 *   GET  /api/pu74-journal/:bolinma/:brigade/:month          — oy jurnali (tahrirlar + holat)
 *   PUT  /api/pu74-journal/:bolinma/:brigade/:month          — saqlash { edits, version }
 *   POST /api/pu74-journal/:bolinma/:brigade/:month/status   — { action: submit|approve|return|reopen, comment }
 *
 *   GET  /api/pu74-journal/template/:file                    — brigada Excel shabloni (faqat kirganlarga)
 *
 * Mantiq server/services/pu74Journal.js da.
 */
const express = require('express');
const db = require('../db');
const { createPu74JournalService } = require('../services/pu74Journal');

const path = require('path');

const router = express.Router();
const service = createPu74JournalService(db);

// Brigada shablonlari xodimlar ismlarini o'z ichiga oladi — ilgari public/ da
// kirishsiz ochiq turardi. Endi faqat tizimga kirganlarga beriladi.
const TEMPLATES = { '1-brigada.xlsx': 1, '2-brigada.xlsx': 1, '3-brigada.xlsx': 1 };
router.get('/template/:file', (req, res) => {
    const file = String(req.params.file || '');
    if (!TEMPLATES[file]) return res.status(404).json({ message: 'Shablon topilmadi' });
    res.set('Cache-Control', 'private, max-age=3600');
    res.sendFile(path.join(__dirname, '..', 'templates', 'pu74', file));
});

router.get('/:bolinma/:brigade', service.list);
router.get('/:bolinma/:brigade/:month', service.get);
router.put('/:bolinma/:brigade/:month', service.save);
router.post('/:bolinma/:brigade/:month/status', service.setStatus);

module.exports = router;
