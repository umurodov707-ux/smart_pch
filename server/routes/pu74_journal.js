/**
 * PU-74 jurnali API (brigada + oy).
 *
 *   GET  /api/pu74-journal/:brigade                 — oylar ro'yxati
 *   GET  /api/pu74-journal/:brigade/:month          — oy jurnali (tahrirlar + holat)
 *   PUT  /api/pu74-journal/:brigade/:month          — saqlash { edits, version }
 *   POST /api/pu74-journal/:brigade/:month/status   — { action: submit|approve|return|reopen, comment }
 *
 * Mantiq server/services/pu74Journal.js da.
 */
const express = require('express');
const db = require('../db');
const { createPu74JournalService } = require('../services/pu74Journal');

const router = express.Router();
const service = createPu74JournalService(db);

router.get('/:brigade', service.list);
router.get('/:brigade/:month', service.get);
router.put('/:brigade/:month', service.save);
router.post('/:brigade/:month/status', service.setStatus);

module.exports = router;
