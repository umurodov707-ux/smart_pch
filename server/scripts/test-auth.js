/**
 * Login API test — server ishlayotganini tekshirish
 * Ishlatish: npm run test:auth
 */
const http = require('http');

const PORT = process.env.PORT || 7007;
const USER = process.env.TEST_USER || 'admin';
const PASS = process.env.TEST_PASS;

// Parol kodga yozilmaydi: TEST_PASS=... npm run test:auth
if (!PASS) {
    console.error('❌ TEST_PASS berilmagan. Masalan: TEST_PASS=parol npm run test:auth');
    process.exit(1);
}

const body = JSON.stringify({ username: USER, password: PASS });

const req = http.request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Requested-With': 'SmartPCH-WebApp'
    }
}, (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
        let json = {};
        try { json = JSON.parse(data); } catch (e) { /* */ }

        if (res.statusCode === 200 && json.token) {
            console.log('[test:auth] OK — token olindi');
            console.log('[test:auth] Foydalanuvchi:', json.user?.username || json.user?.full_name);
            process.exit(0);
        }

        console.error('[test:auth] FAIL — status:', res.statusCode);
        console.error('[test:auth] Javob:', data);
        process.exit(1);
    });
});

req.on('error', (e) => {
    console.error('[test:auth] Serverga ulanib bo\'lmadi:', e.message);
    console.error('[test:auth] Avval npm start ishga tushiring (port', PORT + ')');
    process.exit(1);
});

req.write(body);
req.end();
