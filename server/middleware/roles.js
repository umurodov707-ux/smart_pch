/**
 * ROLLAR — yagona manba.
 *
 * Tizimda faqat 3 ta rol bor (auth.js ALLOWED_ROLES):
 *   admin       — hamma narsa
 *   department  — bo'lim xodimi; qaysi bo'lim ekanligi user.departments ichida
 *                 (dispetcher, ishlab-chiqarish, xodimlar, iqtisod, bugalteriya,
 *                  mexanika, xavfsizlik, metrologiya)
 *   bolinma     — bo'linma (faqat o'z ma'lumotlari)
 *
 * Ilgari kodda mavjud bo'lmagan rollar tekshirilardi ("director", "rahbar",
 * "dispatcher", "subdivision") — bunday foydalanuvchi yaratib bo'lmaydi, shuning
 * uchun masalan dispetcher bo'limi xodimi fayllarni ko'ra olmasdi.
 */
const ROLES = Object.freeze({ ADMIN: 'admin', DEPARTMENT: 'department', BOLINMA: 'bolinma' });

const DEPARTMENTS = Object.freeze([
    'dispetcher', 'ishlab-chiqarish', 'xodimlar', 'iqtisod',
    'bugalteriya', 'mexanika', 'xavfsizlik', 'metrologiya',
]);

// eski nomlar → hozirgi bo'lim nomi
const DEPT_ALIASES = { dispatcher: 'dispetcher', ishlab: 'ishlab-chiqarish', buxgalteriya: 'bugalteriya', hr: 'xodimlar', kadrlar: 'xodimlar' };

function normDept(d) {
    const s = String(d || '').trim().toLowerCase();
    return DEPT_ALIASES[s] || s;
}

function roleOf(user) {
    const r = String((user && user.role) || '').toLowerCase();
    if (r === 'subdivision') return ROLES.BOLINMA; // eski nom
    return r;
}

const isAdmin = (user) => roleOf(user) === ROLES.ADMIN;
const isBolinma = (user) => roleOf(user) === ROLES.BOLINMA;
const isDepartment = (user) => roleOf(user) === ROLES.DEPARTMENT;

function departmentsOf(user) {
    let d = user && user.departments;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = d ? [d] : []; } }
    return Array.isArray(d) ? d.map(normDept) : [];
}

/** Admin yoki ko'rsatilgan bo'limlardan birining xodimi */
function inDepartment(user, ...depts) {
    if (isAdmin(user)) return true;
    if (!isDepartment(user)) return false;
    const mine = departmentsOf(user);
    return depts.map(normDept).some((d) => mine.includes(d));
}

const isDispatcher = (user) => inDepartment(user, 'dispetcher');

module.exports = { ROLES, DEPARTMENTS, normDept, roleOf, isAdmin, isBolinma, isDepartment, departmentsOf, inDepartment, isDispatcher };

/** Express middleware: faqat admin yoki ko'rsatilgan bo'lim(lar) xodimi */
function requireDept(...depts) {
    return (req, res, next) => {
        if (inDepartment(req.user, ...depts)) return next();
        return res.status(403).json({ message: 'Bu amal uchun ruxsat yo‘q (faqat ' + depts.join(', ') + ' bo‘limi)' });
    };
}
module.exports.requireDept = requireDept;
