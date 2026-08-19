const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/smart_pch.db');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) { console.error(err); db.close(); return; }
    console.log('=== JADVALLAR ROYXATI ===');
    tables.forEach(t => console.log(' -', t.name));
    console.log('\nJami:', tables.length, 'ta jadval\n');

    // Har bir jadvalda nechta yozuv borligini tekshirish
    let pending = tables.length;
    const counts = [];
    tables.forEach(t => {
        db.get("SELECT COUNT(*) as cnt FROM " + t.name, (err2, row) => {
            if (!err2) {
                counts.push({ table: t.name, count: row.cnt });
            }
            pending--;
            if (pending === 0) {
                console.log('=== YOZUVLAR SONI ===');
                counts.sort((a, b) => b.count - a.count);
                counts.forEach(c => {
                    const status = c.count === 0 ? '  ❌ BO\'SH' : '';
                    console.log(` ${c.table}: ${c.count}${status}`);
                });
                db.close();
            }
        });
    });
});
