/**
 * BO'LINMA BO'YICHA AJRATISH
 *
 * Qoida: har bir bo'linmaning hujjatlari va jurnallari faqat o'ziga ko'rinadi.
 *   - admin                 — hammasi
 *   - bolinma               — faqat profilidagi bo'linma(lar)
 *   - department (bo'limlar) — profiliga bo'linmalar biriktirilgan bo'lsa faqat o'shalar,
 *                              biriktirilmagan bo'lsa hammasi (avvalgi ish tartibi buzilmasligi uchun)
 *
 * Bu fayl ikki narsani beradi:
 *   1) scopeOf(user) / canSee(scope, id) — boshqa joylarda ishlatish uchun
 *   2) bolinmaGuard(prefix) — /api/... marshrutlari uchun umumiy himoya:
 *        a) so'rov manzili, query va body'dagi bo'linma ruxsat etilganmi (aks holda 403)
 *        b) /:id bo'yicha o'qish/o'zgartirish/o'chirishda yozuvning bo'linmasi tekshiriladi
 *        c) GET javobidagi ro'yxatlardan boshqa bo'linmalarning yozuvlari olib tashlanadi
 *
 * Bo'linma nomlari turlicha yoziladi ("bolinma3", "3-bo'linma", "3-bo‘linma", "3-sex") —
 * hammasi bir xil ko'rinishga keltirib solishtiriladi.
 */

/** Bo'linma identifikatorimi? Bo'lsa — yagona ko'rinish, aks holda null */
function canon(id) {
    if (id === null || id === undefined) return null;
    const s = String(id).trim().toLowerCase().replace(/[‘’ʻʼ`]/g, "'");
    if (!s) return null;
    let m = /^(?:bolinma|bo'linma)\s*-?\s*(\d{1,3})$/.exec(s) || /^(\d{1,3})\s*-?\s*(?:bolinma|bo'?linma|bo'linma)$/.exec(s);
    if (m) return `${Number(m[1])}-bo'linma`;
    m = /^(?:sex)\s*-?\s*(\d{1,3})$/.exec(s) || /^(\d{1,3})\s*-?\s*sex$/.exec(s);
    if (m) return `${Number(m[1])}-sex`;
    return null;
}

function toArray(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
        try { const p = JSON.parse(v); return Array.isArray(p) ? p : [v]; } catch (e) { return v ? [v] : []; }
    }
    return [];
}

/** null — cheklovsiz; massiv — faqat shu bo'linmalar */
function scopeOf(user) {
    if (!user) return [];
    const role = String(user.role || '').toLowerCase();
    if (role === 'admin') return null;
    const own = [...new Set(toArray(user.bolinmalar).map(canon).filter(Boolean))];
    if (role === 'bolinma') {
        if (own.length) return own;
        // eski hisoblar: bo'linma faqat foydalanuvchi nomida ("bolinma3")
        const u = canon(String(user.username || '').replace(/[^a-z0-9'-]/gi, ''));
        return u ? [u] : [];
    }
    return own.length ? own : null;
}

function canSee(scope, id) {
    if (scope === null) return true;
    const c = canon(id);
    if (!c) return true; // bo'linmaga tegishli emas (umumiy yozuv yoki bo'lim nomi)
    return scope.includes(c);
}

const ID_KEYS = ['bolinma_id', 'bolinmaId', 'bolinma'];

/** Yozuvning bo'linmasi (bolinma_id yoki eski bolinma_num) */
function rowBolinma(row) {
    if (!row || typeof row !== 'object') return null;
    for (const k of ID_KEYS) if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
    if (row.bolinma_num !== undefined && row.bolinma_num !== null && row.bolinma_num !== '') return `${row.bolinma_num}-bo'linma`;
    return null;
}

/** Javobdan boshqa bo'linmalarning yozuvlarini olib tashlash */
function filterPayload(data, scope) {
    if (scope === null || data === null || data === undefined) return data;
    const keep = (row) => canSee(scope, rowBolinma(row));
    if (Array.isArray(data)) return data.filter((x) => !(x && typeof x === 'object') || keep(x));
    if (typeof data === 'object') {
        let changed = false;
        const out = { ...data };
        for (const k of ['data', 'rows', 'records', 'items', 'results', 'list', 'employees', 'switches']) {
            if (Array.isArray(data[k])) { out[k] = data[k].filter((x) => !(x && typeof x === 'object') || keep(x)); changed = true; }
        }
        // { data: { plets: [...], izostiks: [...] } } ko'rinishidagi yig'ma javoblar
        if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            const inner = { ...data.data };
            let innerChanged = false;
            for (const [k, v] of Object.entries(inner)) {
                if (Array.isArray(v)) { inner[k] = v.filter((x) => !(x && typeof x === 'object') || keep(x)); innerChanged = true; }
            }
            if (innerChanged) { out.data = inner; changed = true; }
        }
        return changed ? out : data;
    }
    return data;
}

/**
 * /:id bo'yicha murojaatlar: [yo'l namunasi, jadval]. Namunada (\d+) — yozuv ID si.
 * Jadvalda bolinma_id (yoki bolinma_num) bo'lmasa tekshiruv o'tkazib yuboriladi.
 */
const RECORD_ROUTES = {
    '/api/defects': [[/^\/(\d+)(?:\/|$)/, 'defects']],
    '/api/izostiklar': [[/^\/(\d+)$/, 'izostiklar']],
    '/api/mechanics': [[/^\/vehicles\/(\d+)/, 'vehicles']],
    '/api/metrology': [[/^\/electricity\/(\d+)/, 'metrology_electricity'], [/^\/devices\/(\d+)/, 'metrology_devices']],
    '/api/safety': [[/^\/tnu19\/(\d+)/, 'tnu19_records'], [/^\/training\/(\d+)/, 'technical_training']],
    '/api/sand': [[/^\/(\d+)$/, 'sand_analysis_reports']],
    '/api/okno': [[/^\/(\d+)\//, 'okno_planning']],
    '/api/materials': [[/^\/acts\/(\d+)\//, 'material_acts']],
    '/api/murojaat': [[/^\/(\d+)(?:\/|$)/, 'murojaat']],
    '/api/reports': [[/^\/(\d+)\//, 'reports']],
    '/api/pu80': [[/^\/tools\/(\d+)/, 'department_tools']],
    '/api/tasks': [[/^\/(\d+)$/, 'tasks']],
    '/api/infrastructure': [[/^\/warnings\/(\d+)/, 'digital_warnings']],
    '/api/marketplace': [[/^\/(\d+)$/, 'marketplace_items']],
    '/api/pu28': [[/^\/(\d+)(?:\/|$)/, 'pu28_records']],
    '/api/pu28-section2': [[/^\/(\d+)(?:\/|$)/, 'pu28_section2_records']],
    '/api/plets': [[/^\/(?:details\/)?(\d+)$/, 'plets_advanced']],
    '/api/pkz-rails': [[/^\/(\d+)$/, 'pkz_rails']],
    '/api/hr': [[/^\/employees\/(\d+)/, 'employees']],
    '/api/files': [[/^\/(?:approve|download)\/(\d+)/, 'files']],
    '/api/pu74': [[/^\/records\/(\d+)/, 'pu74_data']],
};

function getRow(database, table, id) {
    return new Promise((resolve) => {
        database.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, row) => resolve(err ? undefined : row || null));
    });
}

/** So'rovdagi barcha bo'linma ko'rsatkichlari (manzil, query, body) */
function requestedBolinmalar(req) {
    const found = [];
    const path = String(req.path || '');
    for (const seg of path.split('/')) {
        let s = seg;
        try { s = decodeURIComponent(seg); } catch (e) { /* o'zgarishsiz */ }
        if (canon(s)) found.push(s);
    }
    const q = req.query || {};
    for (const k of ID_KEYS) if (q[k] && q[k] !== 'all') found.push(q[k]);
    const scan = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const k of ID_KEYS) if (typeof obj[k] === 'string' || typeof obj[k] === 'number') found.push(obj[k]);
    };
    const b = req.body;
    if (Array.isArray(b)) b.forEach(scan);
    else if (b && typeof b === 'object') {
        scan(b);
        for (const k of ['records', 'items', 'rows', 'data', 'entries']) if (Array.isArray(b[k])) b[k].forEach(scan);
    }
    return found;
}

/**
 * @param {string} prefix marshrut prefiksi, masalan '/api/defects'
 * @param {object} [opts] { db } — testlar uchun
 */
function bolinmaGuard(prefix, opts = {}) {
    // db faqat kerak bo'lganda yuklanadi (xizmatlar va testlar bu faylni bazasiz ishlatadi)
    const database = opts.db || require('../db');
    const records = RECORD_ROUTES[prefix] || [];
    return async (req, res, next) => {
        const scope = scopeOf(req.user);
        req.bolinmaScope = scope;
        if (scope === null) return next();

        const denied = requestedBolinmalar(req).find((b) => !canSee(scope, b));
        if (denied !== undefined) {
            return res.status(403).json({ message: 'Bu bo‘linma ma’lumotlariga ruxsat yo‘q' });
        }

        for (const [re, table] of records) {
            const m = re.exec(req.path || '');
            if (!m) continue;
            const row = await getRow(database, table, Number(m[1]));
            if (row && !canSee(scope, rowBolinma(row))) {
                return res.status(403).json({ message: 'Bu bo‘linma ma’lumotlariga ruxsat yo‘q' });
            }
            break;
        }

        if (req.method === 'GET') {
            const json = res.json.bind(res);
            res.json = (data) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    if (data && typeof data === 'object' && !Array.isArray(data) && rowBolinma(data) !== null && !canSee(scope, rowBolinma(data))) {
                        res.status(403);
                        return json({ message: 'Bu bo‘linma ma’lumotlariga ruxsat yo‘q' });
                    }
                    return json(filterPayload(data, scope));
                }
                return json(data);
            };
        }
        return next();
    };
}

/** Bazada uchraydigan barcha yozilishlar: "3-bo'linma" → ["3-bo'linma", "3-bo‘linma", "bolinma3"] */
function variants(id) {
    const c = canon(id);
    if (!c) return id === null || id === undefined ? [] : [String(id)];
    const n = parseInt(c, 10);
    return c.endsWith('-sex') ? [c, `sex${n}`] : [c, `${n}-bo‘linma`, `${n}-bo'linma`.replace("'", 'ʻ'), `bolinma${n}`];
}

const NONE = '__hech_qaysi__';

/**
 * Foydalanuvchi so'ragan bo'linmani ruxsat doirasida aniqlash (yozish uchun — bitta qiymat).
 * Admin/cheklovsiz bo'lim: so'raganini (yoki null — "hammasi").
 * Cheklangan: so'ragani ruxsat etilgan bo'lsa o'shani, aks holda o'zining birinchisini.
 */
function resolveBolinma(user, requested) {
    const scope = scopeOf(user);
    const want = requested && requested !== 'all' ? (canon(requested) || String(requested)) : null;
    if (scope === null) return want;
    if (want && canon(want) && scope.includes(canon(want))) return canon(want);
    return scope[0] || NONE;
}

/**
 * O'qish uchun SQL sharti: { sql: "col IN (?,?,..)", params } yoki null (cheklovsiz).
 * Cheklangan foydalanuvchi hech qachon o'z doirasidan tashqariga chiqmaydi.
 */
function bolinmaFilter(user, requested, column = 'bolinma_id') {
    const scope = scopeOf(user);
    const want = requested && requested !== 'all' ? requested : null;
    let ids;
    if (scope === null) ids = want ? [want] : null;
    else if (want && canon(want) && scope.includes(canon(want))) ids = [want];
    else ids = scope.length ? scope : [NONE];
    if (!ids) return null;
    const all = [...new Set(ids.flatMap(variants))];
    return { sql: `${column} IN (${all.map(() => '?').join(', ')})`, params: all };
}

module.exports = { bolinmaGuard, scopeOf, canSee, canon, filterPayload, RECORD_ROUTES, variants, resolveBolinma, bolinmaFilter, NONE };
