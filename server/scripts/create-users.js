/**
 * Boshlang'ich foydalanuvchilarni yaratish (yangi, bo'sh baza uchun).
 *
 *   node server/scripts/create-users.js        yoki   npm run users:create
 *
 * Faqat YO'Q foydalanuvchilar qo'shiladi; mavjudlariga (paroli, roli) tegilmaydi —
 * haqiqiy serverda ham xavfsiz. Parol: INITIAL_USER_PASSWORD (.env) yoki "smart_password_123".
 * Kirgandan keyin parollarni almashtiring.
 *
 * Ilgari bo'sh bazada birorta ham foydalanuvchi yaratilmasdi (reset_passwords.js faqat
 * mavjudlarining parolini o'zgartiradi) — yangi o'rnatilgan saytga kirib bo'lmasdi.
 */
require('dotenv').config();

const USERS = [
    { username: 'admin', role: 'admin', full_name: 'Administrator', departments: [], bolinmalar: [] },
    { username: 'dispetcher', role: 'department', full_name: 'Dispetcher', departments: ['dispetcher'], bolinmalar: [] },
    { username: 'ishlab', role: 'department', full_name: 'Ishlab chiqarish bo‘limi', departments: ['ishlab-chiqarish'], bolinmalar: [] },
    { username: 'xodimlar', role: 'department', full_name: 'Xodimlar bo‘limi', departments: ['xodimlar'], bolinmalar: [] },
    { username: 'bugalteriya', role: 'department', full_name: 'Buxgalteriya', departments: ['bugalteriya'], bolinmalar: [] },
    { username: 'iqtisod', role: 'department', full_name: 'Iqtisod bo‘limi', departments: ['iqtisod'], bolinmalar: [] },
    { username: 'mexanika', role: 'department', full_name: 'Mexanika bo‘limi', departments: ['mexanika'], bolinmalar: [] },
    { username: 'metrologiya', role: 'department', full_name: 'Metrologiya bo‘limi', departments: ['metrologiya'], bolinmalar: [] },
];
for (let i = 1; i <= 10; i++) {
    USERS.push({ username: `bolinma${i}`, role: 'bolinma', full_name: `${i}-bo‘linma`, departments: [], bolinmalar: [`${i}-bo'linma`] });
}

async function createUsers(db, bcrypt, password) {
    const q = {
        get: (sql, p) => new Promise((ok, no) => db.get(sql, p, (e, r) => (e ? no(e) : ok(r)))),
        run: (sql, p) => new Promise((ok, no) => db.run(sql, p, (e) => (e ? no(e) : ok()))),
    };
    const created = []; const skipped = [];
    for (const u of USERS) {
        const exists = await q.get('SELECT id FROM users WHERE username = ?', [u.username]);
        if (exists) { skipped.push(u.username); continue; }
        await q.run(
            "INSERT INTO users (username, password, role, full_name, departments, bolinmalar, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
            [u.username, bcrypt.hashSync(password, 10), u.role, u.full_name, JSON.stringify(u.departments), JSON.stringify(u.bolinmalar)]
        );
        created.push(u.username);
    }
    return { created, skipped };
}

module.exports = { createUsers, USERS };

if (require.main === module) {
    (async () => {
        const db = require('../db');
        const bcrypt = require('bcryptjs');
        const password = process.env.INITIAL_USER_PASSWORD || 'smart_password_123';
        try {
            await db._readyPromise;
            const { created, skipped } = await createUsers(db, bcrypt, password);
            console.log(created.length ? `Yaratildi (${created.length}): ${created.join(', ')}` : 'Yangi foydalanuvchi yaratilmadi.');
            if (skipped.length) console.log(`Allaqachon bor, tegilmadi (${skipped.length}): ${skipped.join(', ')}`);
            if (created.length) console.log(`Parol: ${process.env.INITIAL_USER_PASSWORD ? '(.env dagi INITIAL_USER_PASSWORD)' : password} — kirgach almashtiring.`);
            process.exit(0);
        } catch (e) {
            console.error('Xatolik:', e.message);
            process.exit(1);
        }
    })();
}
