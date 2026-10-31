/**
 * Bazadagi JSON matnni xavfsiz o'qish. Buzilgan yozuv butun so'rovni (yoki serverni)
 * yiqitmasligi kerak — o'rniga standart qiymat qaytariladi.
 */
function safeParse(text, fallback = null) {
    if (text === null || text === undefined || text === '') return fallback;
    if (typeof text === 'object') return text; // PostgreSQL JSON ustunlari allaqachon obyekt
    try { return JSON.parse(text); } catch (e) { return fallback; }
}
module.exports = { safeParse };
