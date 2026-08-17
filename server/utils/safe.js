/**
 * SAFE PARSING UTILITIES
 * Bazadagi buzuq JSON ma'lumot serverni yiqitmasligi uchun.
 */

/**
 * JSON stringni xavfsiz parse qiladi.
 * Agar qiymat allaqachon massiv/obyekt bo'lsa — o'zini qaytaradi
 * (auth middleware allaqachon parse qilib bergan holatlar uchun).
 */
function safeParse(value, fallback = null) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return value; // allaqachon parse qilingan
    if (typeof value !== 'string') return fallback;
    try {
        const parsed = JSON.parse(value);
        return parsed === null ? fallback : parsed;
    } catch (e) {
        return fallback;
    }
}

/** Har doim massiv qaytaradi */
function safeArray(value) {
    const parsed = safeParse(value, []);
    return Array.isArray(parsed) ? parsed : [];
}

/** Har doim obyekt qaytaradi */
function safeObject(value) {
    const parsed = safeParse(value, {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

/**
 * Foydalanuvchining birinchi bo'linmasini qaytaradi.
 * req.user.bolinmalar auth middleware'da allaqachon massivga aylantirilgan,
 * shuning uchun uni QAYTA JSON.parse qilish xato (server 500 beradi).
 */
function firstBolinma(user) {
    const list = safeArray(user?.bolinmalar);
    return list.length > 0 ? list[0] : null;
}

/**
 * Fayl yo'lidagi xavfli segmentlarni tozalaydi (path traversal himoyasi).
 * "../../etc" -> "etc", "a/b" -> "a_b"
 */
function sanitizeSegment(name, fallback = 'general') {
    if (!name || typeof name !== 'string') return fallback;
    const cleaned = name
        .normalize('NFKC')
        .replace(/[\\/]/g, '_')      // yo'l ajratgichlari
        .replace(/\.{2,}/g, '_')      // ".." traversal
        .replace(/[\x00-\x1f<>:"|?*]/g, '') // nazorat va Windows uchun taqiqlangan belgilar
        .replace(/^[.\s]+|[.\s]+$/g, '')    // boshi/oxiridagi nuqta va bo'shliq
        .trim()
        .slice(0, 64);
    return cleaned || fallback;
}

module.exports = { safeParse, safeArray, safeObject, firstBolinma, sanitizeSegment };
