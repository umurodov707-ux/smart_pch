/**
 * PU-29: strelkali o'tkazgichlarni tekshirish jurnali API.
 *
 *   GET    /api/pu29/:bolinma/switches                 — strelkalar va oxirgi tekshiruvi
 *   POST   /api/pu29/:bolinma/switches                 — { switch_number, meta }
 *   PUT    /api/pu29/:bolinma/switches/:sw             — { meta }
 *   DELETE /api/pu29/:bolinma/switches/:sw
 *   GET    /api/pu29/:bolinma/switches/:sw/entries     — ?kind=check|ordinat
 *   POST   /api/pu29/:bolinma/switches/:sw/entries     — { kind, date, data }
 *   PUT    /api/pu29/entries/:id                       — { date, data }  (3 soat ichida)
 *   DELETE /api/pu29/entries/:id
 *
 * Mantiq server/services/pu29.js da. Bo'linma "3-bo'linma" yoki "bolinma3" ko'rinishida berilishi mumkin.
 */
const express = require('express');
const db = require('../db');
const { createPu29Service } = require('../services/pu29');

const router = express.Router();
const s = createPu29Service(db);

router.put('/entries/:id', s.updateEntry);
router.delete('/entries/:id', s.deleteEntry);
router.get('/:bolinma/switches', s.listSwitches);
router.post('/:bolinma/switches', s.addSwitch);
router.put('/:bolinma/switches/:sw', s.updateSwitch);
router.delete('/:bolinma/switches/:sw', s.deleteSwitch);
router.get('/:bolinma/switches/:sw/entries', s.listEntries);
router.post('/:bolinma/switches/:sw/entries', s.addEntry);

module.exports = router;
