const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Eng eski backup (25-iyun)
const backupPath = path.join('server', 'backups', 'smart_pch_backup_2026-06-25T04-02-03-109Z.db');
const currentPath = path.join('server', 'smart_pch.db');

function getTableCounts(dbPath, label) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
        db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
            if (err) { console.error(label, err); resolve({}); return; }
            const results = {};
            let pending = tables.length;
            if (pending === 0) { resolve(results); return; }
            tables.forEach(t => {
                db.get("SELECT COUNT(*) as cnt FROM " + t.name, (err2, row) => {
                    if (!err2) results[t.name] = row.cnt;
                    else results[t.name] = -1;
                    pending--;
                    if (pending === 0) { db.close(); resolve(results); }
                });
            });
        });
    });
}

async function compare() {
    console.log('Backupni yuklash:', backupPath);
    console.log('Hozirgi bazani yuklash:', currentPath);
    console.log('');

    const [backup, current] = await Promise.all([
        getTableCounts(backupPath, 'BACKUP'),
        getTableCounts(currentPath, 'CURRENT')
    ]);

    const allTables = new Set([...Object.keys(backup), ...Object.keys(current)]);
    
    console.log('=== TAQQOSLASH: BACKUP (25-iyun) vs HOZIRGI ===');
    console.log('Jadval'.padEnd(30) + 'Backup'.padEnd(10) + 'Hozirgi'.padEnd(10) + 'Farq');
    console.log('-'.repeat(60));
    
    const diffs = [];
    for (const table of [...allTables].sort()) {
        if (table === 'sqlite_sequence' || table === 'audit_logs') continue;
        const b = backup[table] ?? 0;
        const c = current[table] ?? 0;
        const diff = c - b;
        if (diff !== 0) {
            diffs.push({ table, backup: b, current: c, diff });
        }
    }
    
    // O'chganlar
    console.log('\n❌ KAMAYGAN (ma\'lumot yo\'qolgan):');
    diffs.filter(d => d.diff < 0).sort((a,b) => a.diff - b.diff).forEach(d => {
        console.log(`  ${d.table.padEnd(28)} ${String(d.backup).padEnd(10)} ${String(d.current).padEnd(10)} ${d.diff}`);
    });
    
    // Qo'shilganlar
    console.log('\n✅ KO\'PAYGAN (yangi ma\'lumot):');
    diffs.filter(d => d.diff > 0).sort((a,b) => b.diff - a.diff).forEach(d => {
        console.log(`  ${d.table.padEnd(28)} ${String(d.backup).padEnd(10)} ${String(d.current).padEnd(10)} +${d.diff}`);
    });
    
    // O'zgarmagan
    console.log('\n📊 O\'ZGARMAGAN:');
    for (const table of [...allTables].sort()) {
        if (table === 'sqlite_sequence' || table === 'audit_logs') continue;
        const b = backup[table] ?? 0;
        const c = current[table] ?? 0;
        if (b === c && b > 0) {
            console.log(`  ${table.padEnd(28)} ${b}`);
        }
    }
}

compare().catch(console.error);
