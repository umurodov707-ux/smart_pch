/**
 * Bazadagi admin parolini vaqtincha o'zgartirib, barcha API endpointlarini tekshiradi.
 * Tekshiruv tugagach parolni qaytaradi.
 */
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'server', 'smart_pch.db');
const BASE = 'http://localhost:6878';
const TEST_PWD = 'Test_Temp_12345';

const results = { passed: 0, failed: 0, warnings: 0, details: [] };
function log(s, c, m) {
    const i = s==='PASS'?'✅':s==='FAIL'?'❌':'⚠️';
    results.details.push({status:s,category:c,message:m});
    if(s==='PASS')results.passed++; else if(s==='FAIL')results.failed++; else results.warnings++;
    console.log(`${i} [${c}] ${m}`);
}

async function fetchJSON(url, opts={}) {
    try {
        const r = await fetch(url, opts);
        const t = await r.text();
        let j=null; try{j=JSON.parse(t)}catch(e){}
        return {status:r.status,ok:r.ok,json:j,text:t};
    } catch(e) { return {status:0,ok:false,json:null,text:e.message}; }
}

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 SMART PCH — HIMOYALANGAN API TO\'LIQ TEKSHIRUV');
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Eski parolni saqlash va vaqtincha yangi parol qo'yish
    const db = new sqlite3.Database(DB_PATH);
    
    const admin = await new Promise((res,rej) => {
        db.get('SELECT id, username, password FROM users WHERE username = ?', ['admin'], (e,r) => e?rej(e):res(r));
    });

    if (!admin) {
        console.log('❌ Admin foydalanuvchi topilmadi!');
        db.close();
        return;
    }

    const oldHash = admin.password;
    const newHash = await bcrypt.hash(TEST_PWD, 10);
    
    await new Promise((res,rej) => {
        db.run('UPDATE users SET password = ? WHERE id = ?', [newHash, admin.id], e => e?rej(e):res());
    });
    console.log(`🔑 Admin parol vaqtincha "${TEST_PWD}" ga o'zgartirildi\n`);

    try {
        // 2. Login
        const loginRes = await fetchJSON(BASE + '/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
            body: JSON.stringify({username:'admin', password: TEST_PWD})
        });

        if (!loginRes.ok || !loginRes.json?.token) {
            log('FAIL', 'Auth', `Login xato: ${loginRes.status} — ${loginRes.json?.message || loginRes.text?.substring(0,100)}`);
            return;
        }

        const token = loginRes.json.token;
        log('PASS', 'Auth', `Login muvaffaqiyatli (role: ${loginRes.json.user?.role})`);

        // 3. Barcha himoyalangan endpointlarni tekshirish
        const endpoints = [
            { url: '/api/hr', name: 'HR Xodimlar' },
            { url: '/api/hr/stats', name: 'HR Statistika' },
            { url: '/api/tasks', name: 'Vazifalar' },
            { url: '/api/defects', name: 'Defektlar' },
            { url: '/api/reports', name: 'Hisobotlar' },
            { url: '/api/safety', name: 'Xavfsizlik' },
            { url: '/api/mechanics', name: 'Mexanika' },
            { url: '/api/mechanics/vehicles', name: 'Transport vositalari' },
            { url: '/api/materials', name: 'Materiallar' },
            { url: '/api/timesheet', name: 'Tabel' },
            { url: '/api/pu80', name: 'PU-80 Inventarizatsiya' },
            { url: '/api/metrology', name: 'Metrologiya' },
            { url: '/api/metrology/devices', name: 'Metrologiya asboblari' },
            { url: '/api/pu28', name: 'PU-28' },
            { url: '/api/pu28-section2', name: 'PU-28 2-bo\'lim' },
            { url: '/api/pu29', name: 'PU-29' },
            { url: '/api/pu74', name: 'PU-74' },
            { url: '/api/pu74_monthly', name: 'PU-74 Oylik' },
            { url: '/api/murojaat', name: 'Murojaatlar' },
            { url: '/api/murojaat/stats/summary', name: 'Murojaat statistika' },
            { url: '/api/workflow', name: 'Workflow' },
            { url: '/api/infrastructure', name: 'Infratuzilma' },
            { url: '/api/okno', name: 'Texnik oyna' },
            { url: '/api/sand', name: 'Qum inventarizatsiya' },
            { url: '/api/izostiklar', name: 'Izostiklar' },
            { url: '/api/plets', name: 'Pletlar hisobi' },
            { url: '/api/marketplace', name: 'Marketplace' },
            { url: '/api/imzo', name: 'Elektron imzo' },
            { url: '/api/search?q=admin', name: 'Qidiruv' },
            { url: '/api/defectoscope', name: 'Defektoskop' },
            { url: '/api/pkz-rails', name: 'PKZ Relslar' },
            { url: '/api/production/dashboard', name: 'Ishlab chiqarish paneli' },
            { url: '/api/broadcast', name: 'Broadcast' },
            { url: '/api/files', name: 'Fayllar' },
            { url: '/api/storage', name: 'KV Storage' },
            { url: '/api/audit', name: 'Audit log' },
            { url: '/api/ai', name: 'AI yordamchi' },
        ];

        for (const ep of endpoints) {
            const res = await fetchJSON(BASE + ep.url, {
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (res.ok) {
                let info = '';
                if (Array.isArray(res.json)) info = `${res.json.length} ta yozuv`;
                else if (res.json?.data && Array.isArray(res.json.data)) info = `${res.json.data.length} ta yozuv`;
                else if (res.json?.total !== undefined) info = `jami: ${res.json.total}`;
                else if (res.json?.success !== undefined) info = res.json.success ? 'success' : 'fail';
                else info = 'OK';
                log('PASS', 'API', `${ep.name} — ${res.status} (${info})`);
            } else if (res.status === 403) {
                log('WARN', 'API', `${ep.name} — ruxsat cheklangan (${res.json?.message || '403'})`);
            } else if (res.status === 404) {
                log('FAIL', 'API', `${ep.name} — TOPILMADI (404): ${res.json?.message || ''}`);
            } else if (res.status === 500) {
                log('FAIL', 'API', `${ep.name} — SERVER XATOSI (500): ${res.json?.message || res.text?.substring(0,150)}`);
            } else {
                log('FAIL', 'API', `${ep.name} — ${res.status}: ${res.json?.message || res.text?.substring(0,100)}`);
            }
        }

    } finally {
        // 4. Eski parolni qaytarish
        await new Promise((res,rej) => {
            db.run('UPDATE users SET password = ? WHERE id = ?', [oldHash, admin.id], e => e?rej(e):res());
        });
        db.close();
        console.log('\n🔒 Admin parol eski holatiga qaytarildi');
    }

    // Natija
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 YAKUNIY NATIJA');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  ✅ Muvaffaqiyatli: ${results.passed}`);
    console.log(`  ❌ Xato:          ${results.failed}`);
    console.log(`  ⚠️  Ogohlantirish: ${results.warnings}`);
    console.log(`  📝 Jami:          ${results.passed + results.failed + results.warnings}`);
    console.log('═══════════════════════════════════════════════════');

    if (results.failed > 0) {
        console.log('\n❌ XATOLAR:');
        results.details.filter(d=>d.status==='FAIL').forEach(d => console.log(`   ❌ [${d.category}] ${d.message}`));
    }
    if (results.warnings > 0) {
        console.log('\n⚠️  OGOHLANTIRISH:');
        results.details.filter(d=>d.status==='WARN').forEach(d => console.log(`   ⚠️  [${d.category}] ${d.message}`));
    }
    console.log('');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
