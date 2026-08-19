/**
 * SMART PCH — Smoke test (server ishlayotganini tekshirish)
 * Ishga tushirish: node server/scripts/smoke-test.js
 * Yoki: npm run test:smoke
 */
const http = require('http');

const PORT = process.env.PORT || 7007;
const BASE = `http://127.0.0.1:${PORT}`;

function get(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE}${path}`, (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
                resolve({ status: res.statusCode, body });
            });
        });
        req.on('error', reject);
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function run() {
    console.log(`[smoke] Tekshirilmoqda: ${BASE}`);
    let ok = 0;
    let fail = 0;

    try {
        const health = await get('/api/health');
        if (health.status === 200 && health.body.includes('"UP"')) {
            console.log('  OK  /api/health');
            ok++;
        } else {
            console.log('  FAIL /api/health', health.status);
            fail++;
        }
    } catch (e) {
        console.log('  FAIL /api/health —', e.message);
        fail++;
    }

    try {
        const index = await get('/');
        if (index.status === 200 && index.body.includes('SMART PCH')) {
            console.log('  OK  / (index.html)');
            ok++;
        } else {
            console.log('  FAIL /', index.status);
            fail++;
        }
    } catch (e) {
        console.log('  FAIL / —', e.message);
        fail++;
    }

    console.log(`\n[smoke] Natija: ${ok} muvaffaqiyat, ${fail} xato`);
    process.exit(fail > 0 ? 1 : 0);
}

run();
