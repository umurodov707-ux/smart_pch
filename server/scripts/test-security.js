/**
 * Xavfsizlik regressiya testi — yopilgan joylar qayta ochilib qolmaganini tekshiradi
 * Ishlatish: npm run test:security
 */
const http = require('http');

const PORT = process.env.PORT || 7007;

function request(path) {
    return new Promise((resolve, reject) => {
        const req = http.get({ hostname: '127.0.0.1', port: PORT, path }, (res) => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => req.destroy(new Error('timeout')));
    });
}

const CHECKS = [
    // Foydalanuvchilar ro'yxati ochiq papkaga yozilardi
    { path: '/users_debug.json', expect: [404], why: 'foydalanuvchilar ro‘yxati ochiq bo‘lmasligi kerak' },
    // Yuklangan hujjatlar kirishsiz tarqatilardi
    { path: '/uploads/general/test.pdf', expect: [404], why: '/uploads ochiq bo‘lmasligi kerak' },
    { path: '/api/files/download/1', expect: [401, 403], why: 'fayl yuklab olish token talab qilishi kerak' },
    { path: '/api/hr/employees', expect: [401, 403], why: 'xodimlar ro‘yxati token talab qilishi kerak' },
    { path: '/api/murojaat', expect: [401, 403], why: 'murojaatlar token talab qilishi kerak' },
];

(async () => {
    let failed = 0;
    for (const c of CHECKS) {
        try {
            const status = await request(c.path);
            const ok = c.expect.includes(status);
            if (!ok) failed++;
            console.log(`${ok ? '✅' : '❌'} ${c.path} → ${status}${ok ? '' : `  (kutilgan: ${c.expect.join('/')}; ${c.why})`}`);
        } catch (e) {
            failed++;
            console.log(`❌ ${c.path} → ${e.message}`);
        }
    }
    console.log(failed ? `\n${failed} ta tekshiruv o'tmadi` : '\nBarcha tekshiruvlar o‘tdi');
    process.exit(failed ? 1 : 0);
})();
