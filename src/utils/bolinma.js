/**
 * Foydalanuvchi qaysi bo'linmalarni ko'ra oladi.
 * Bo'linma foydalanuvchisi — faqat o'zinikini; kengroq huquqli rollar — hammasini.
 * Server ham xuddi shunday tekshiradi (bu faqat ro'yxatni to'g'ri ko'rsatish uchun).
 */
export const ALL_BOLINMALAR = Array.from({ length: 10 }, (_, i) => `${i + 1}-bo'linma`);

/** "bolinma3", "3-bo'linma", "3-bo‘linma" -> "3-bo'linma" */
export function canonBolinma(id) {
  const m = /^\s*(?:bolinma\s*)?(\d{1,3})(?:\s*-?\s*bo.?linma)?\s*$/i.exec(String(id || '').replace(/[‘’ʻʼ`]/g, "'"));
  return m ? `${Number(m[1])}-bo'linma` : null;
}

export function userBolinmalar(user) {
  let b = user && user.bolinmalar;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = [b]; } }
  return [...new Set((Array.isArray(b) ? b : []).map(canonBolinma).filter(Boolean))];
}

/**
 * Server bilan bir xil qoida (server/middleware/bolinmaScope.js):
 *   admin — hammasi; bo'linma — faqat o'zi; bo'lim — biriktirilganlari (biriktirilmagan bo'lsa hammasi).
 * @returns {string[]} ruxsat etilgan bo'linmalar (bo'sh bo'lsa — hech biri)
 */
export function allowedBolinmalar(user) {
  if (!user) return [];
  const role = String(user.role || '').toLowerCase();
  if (role === 'admin') return ALL_BOLINMALAR;
  const own = userBolinmalar(user);
  if (role === 'bolinma') {
    if (own.length) return own;
    const u = canonBolinma(String(user.username || '').replace(/[^a-z0-9'-]/gi, ''));
    return u ? [u] : [];
  }
  return own.length ? own : ALL_BOLINMALAR;
}

/**
 * Foydalanuvchi bitta bo'linmaga bog'langanmi (ro'yxatda tanlov yo'q) va qaysi biriga.
 * Ilgari har sahifada o'z qoidasi bor edi; raqamsiz bo'linma foydalanuvchisiga
 * jim turib "1-bo'linma" berilar edi. Endi qoida bitta va serverdagi bilan bir xil.
 */
export function ownBolinma(user) {
  const role = String((user && user.role) || '').toLowerCase();
  if (!user || role === 'admin') return { isSubdivisionUser: false, userBolinma: 'all' };
  const own = role === 'bolinma' ? allowedBolinmalar(user) : userBolinmalar(user);
  if (role !== 'bolinma' && own.length === 0) return { isSubdivisionUser: false, userBolinma: 'all' };
  return { isSubdivisionUser: true, userBolinma: own[0] || '' };
}
