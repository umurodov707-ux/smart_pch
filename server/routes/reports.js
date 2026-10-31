/**
 * Kunlik tezkor hisobotlar API. Mantiq: server/services/dailyReports.js
 *
 *   GET  /api/reports?date=YYYY-MM-DD     — shu kun hisobotlari (sana Toshkent vaqti bo'yicha)
 *   GET  /api/reports/today               — bugungi (eski ilova uchun)
 *   GET  /api/reports/history             — oxirgi 50 ta
 *   POST /api/reports                     — yuborish/yangilash { bolinma_id?, date?, structuredData }
 *   POST /api/reports/:id/review          — dispetcher: { action: accept|return, comment }
 *   GET  /api/reports/:id/versions        — tarix
 *
 * Bo'linma bo'yicha ajratish umumiy bolinmaGuard orqali (index.js).
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { createDailyReportsService } = require('../services/dailyReports');

const service = createDailyReportsService(db);

router.get('/', service.list);
router.get('/today', (req, res) => { req.query.date = service.today(); return service.list(req, res); });
router.get('/history', service.history);
router.post('/', service.submit);
router.post('/:id(\\d+)/review', service.review);
router.get('/:id(\\d+)/versions', service.versions);

module.exports = router;
