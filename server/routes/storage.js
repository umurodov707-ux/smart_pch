/**
 * Eski (public/) ilovaning kalit-qiymat ombori.
 *
 * Eski ilova brauzerdagi deyarli HAMMA localStorage kalitlarini shu yerga yozadi
 * va kirishda hammasini qaytarib oladi. Ilgari bu ombor hamma uchun umumiy edi:
 *   - bir foydalanuvchining "currentUser" (rol, bo'linma) boshqasining brauzeriga
 *     tushib, interfeysda rollar aralashib ketardi;
 *   - bo'linma boshqa bo'linmalarning ma'lumotlarini ko'rardi va ustidan yozardi.
 *
 * Endi:
 *   1) shaxsiy/sessiya kalitlari (currentUser, token, tanlangan ko'rinish...) saqlanmaydi;
 *   2) nomida bo'linma bor kalit ("pu28_section2_bolinma3") — faqat o'sha bo'linmaga;
 *   3) ro'yxat qiymatlari (masalan "materialActs") ichidagi yozuvlar bo'linma bo'yicha
 *      filtrlanadi, yozishda esa boshqa bo'linmalarning yozuvlari saqlab qolinadi.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { scopeOf, canSee, canon, filterPayload } = require('../middleware/bolinmaScope');
const { safeParse } = require('../utils/safeJson');

const PRIVATE_KEYS = new Set([
    'currentUser', 'jwtToken', 'smart_pch_users', 'smartpch_view_mode', 'smart_offline_reqs',
    'lastWeatherData', 'lastWeatherLocation', 'lastWeatherFetchTime',
    'pu74_view', 'pu74_bolinma', 'pu29_bolinma', 'active_masofa_id', 'last_promer_info', 'theme',
]);
const PRIVATE_RE = /token|password|parol|session|currentuser|_draft/i;

function isPrivate(key) {
    return PRIVATE_KEYS.has(key) || PRIVATE_RE.test(key);
}

/** Kalit nomidagi bo'linma ("..._bolinma3", "..._3-bo'linma", "...sex2") */
function keyBolinma(key) {
    const m = /(bolinma\s*-?\d{1,3}|\d{1,3}-bo.?linma|sex\s*-?\d{1,3}|\d{1,3}-sex)/i.exec(String(key).replace(/[‘’ʻʼ`]/g, "'"));
    return m ? canon(m[1]) : null;
}

function decode(value) {
    let parsed = safeParse(value, value);
    // ba'zan ikki marta JSON qilib saqlangan
    if (typeof parsed === 'string' && /^[[{]/.test(parsed)) parsed = safeParse(parsed, parsed);
    return parsed;
}

function visible(scope, key, value) {
    if (isPrivate(key)) return undefined;
    if (!canSee(scope, keyBolinma(key))) return undefined;
    return filterPayload(value, scope);
}

/** Cheklangan foydalanuvchi ro'yxatni yozganda boshqa bo'linmalarning yozuvlari yo'qolmasin */
function mergeForScope(scope, oldValue, newValue) {
    if (scope === null || !Array.isArray(newValue)) return newValue;
    const { rowBolinmaOf } = module.exports._internals;
    const mine = (r) => !(r && typeof r === 'object') || canSee(scope, rowBolinmaOf(r));
    const kept = Array.isArray(oldValue) ? oldValue.filter((r) => !mine(r)) : [];
    return [...kept, ...newValue.filter(mine)];
}

function rowBolinmaOf(row) {
    for (const k of ['bolinma_id', 'bolinmaId', 'bolinma']) if (row[k]) return row[k];
    if (row.bolinma_num) return `${row.bolinma_num}-bo'linma`;
    return null;
}

// POST /api/storage/save
router.post('/save', (req, res) => {
    const { key, data } = req.body || {};
    if (!key || typeof key !== 'string' || key.length > 200) {
        return res.status(400).json({ success: false, message: 'Key is required' });
    }
    // Shaxsiy kalitlar serverga yozilmaydi (lekin brauzer xato ko'rmasin)
    if (isPrivate(key)) return res.json({ success: true, skipped: true });

    const scope = scopeOf(req.user);
    if (!canSee(scope, keyBolinma(key))) {
        return res.status(403).json({ success: false, message: 'Bu bo‘linma ma’lumotlariga ruxsat yo‘q' });
    }

    db.get('SELECT value FROM kv_storage WHERE key = ?', [key], (err0, row) => {
        if (err0) {
            console.error('storage/save:', err0.message);
            return res.status(500).json({ success: false, message: 'Saqlashda xatolik' });
        }
        const merged = mergeForScope(scope, row ? decode(row.value) : undefined, data);
        db.run(
            `INSERT INTO kv_storage (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
            [key, JSON.stringify(merged)],
            function (err) {
                if (err) {
                    console.error('storage/save:', err.message);
                    return res.status(500).json({ success: false, message: 'Saqlashda xatolik' });
                }
                // Faqat kalit nomi yuboriladi; har kim o'zi uchun ruxsat doirasida qayta yuklaydi
                const io = req.app.get('io');
                if (io) io.emit('storage_updated', { key, timestamp: Date.now() });
                res.json({ success: true });
            }
        );
    });
});

// GET /api/storage/load/:key
router.get('/load/:key', (req, res) => {
    const { key } = req.params;
    const scope = scopeOf(req.user);
    if (isPrivate(key)) return res.json(null);
    if (!canSee(scope, keyBolinma(key))) {
        return res.status(403).json({ success: false, message: 'Bu bo‘linma ma’lumotlariga ruxsat yo‘q' });
    }
    db.get('SELECT value FROM kv_storage WHERE key = ?', [key], (err, row) => {
        if (err) {
            console.error('storage/load:', err.message);
            return res.status(500).json({ success: false, message: 'O‘qishda xatolik' });
        }
        res.json(row ? visible(scope, key, decode(row.value)) ?? null : null);
    });
});

// GET /api/storage/sync - foydalanuvchiga ruxsat etilgan ma'lumotlar
router.get('/sync', (req, res) => {
    const scope = scopeOf(req.user);
    db.all('SELECT key, value FROM kv_storage', [], (err, rows) => {
        if (err) {
            console.error('storage/sync:', err.message);
            return res.status(500).json({ success: false, message: 'O‘qishda xatolik' });
        }
        const data = {};
        for (const r of rows) {
            const v = visible(scope, r.key, decode(r.value));
            if (v !== undefined) data[r.key] = v;
        }
        res.json({ success: true, data });
    });
});

module.exports = router;
module.exports._internals = { isPrivate, keyBolinma, mergeForScope, visible, rowBolinmaOf };
