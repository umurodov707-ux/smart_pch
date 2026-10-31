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
 * @param {object} user
 * @param {(user) => boolean} isWide kim hamma bo'linmalarni ko'radi
 * @returns {string[]} ruxsat etilgan bo'linmalar (bo'sh bo'lsa — hech biri)
 */
export function allowedBolinmalar(user, isWide) {
  if (!user) return [];
  if (user.role === 'admin' || (isWide && isWide(user))) return ALL_BOLINMALAR;
  return userBolinmalar(user);
}

const departments = (user) => {
  let d = user && user.departments;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { d = [d]; } }
  return Array.isArray(d) ? d : [];
};

/** PU-29: admin va "ishlab-chiqarish" bo'limi */
export const pu29Wide = (user) => departments(user).includes('ishlab-chiqarish');
/** PU-74: admin va bo'limlar (jurnalni tekshiradi va tasdiqlaydi) */
export const pu74Wide = (user) => user && user.role === 'department';
