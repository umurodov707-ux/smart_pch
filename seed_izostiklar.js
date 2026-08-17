/**
 * SEED SCRIPT: Default Izostiklar data
 * Run once: node seed_izostiklar.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'server', 'smart_pch.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error('DB Error:', err.message); process.exit(1); }
    console.log('Connected to DB:', dbPath);
});

// Default izostik data from the Excel template
const defaultData = [
    // 1-bo'linma
    { bolinma_id: "bolinma1", group_name: "Peregon Yanginobod-Navbahor", num: "1",   type: "R-65", location: "4024 km PK 4",     km: 4024, last_date: "2025-11-11", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Peregon Yanginobod-Navbahor", num: "2",   type: "R-65", location: "4025 km PK 8",     km: 4025, last_date: "2024-11-18", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Peregon Yanginobod-Navbahor", num: "3",   type: "R-65", location: "4025 km PK 9",     km: 4025, last_date: "2025-11-20", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Peregon Yanginobod-Navbahor", num: "4",   type: "R-65", location: "4025 km PK 3",     km: 4025, last_date: "2025-11-28", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Peregon Navbahor-Yaxshilik",  num: "5",   type: "R-65", location: "4038 km PK 7",     km: 4038, last_date: "2025-12-02", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Peregon Navbahor-Yaxshilik",  num: "6",   type: "R-65", location: "4040 km PK 1",     km: 4040, last_date: "2025-12-03", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Rzd. Navbahor nechetniy",     num: "1-3", type: "R-65", location: "Vixodnoy N",       km: 4030, last_date: "2025-09-09", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Rzd. Navbahor nechetniy",     num: "5-7", type: "R-65", location: "str №1 per. kriva",km: 4030, last_date: "2025-09-16", performer: "PD-01" },
    { bolinma_id: "bolinma1", group_name: "Rzd. Navbahor nechetniy",     num: "9-11",type: "R-65", location: "Vixodnoy N1",      km: 4030, last_date: "2025-09-17", performer: "PD-01" },
    // 2-bo'linma
    { bolinma_id: "bolinma2", group_name: "Peregon Yaxshilik-Kuyganyor", num: "1",   type: "R-65", location: "4058 km PK 2",     km: 4058, last_date: "2025-10-11", performer: "PD-02" },
    { bolinma_id: "bolinma2", group_name: "Peregon Yaxshilik-Kuyganyor", num: "2",   type: "R-65", location: "4062 km PK 5",     km: 4062, last_date: "2025-08-20", performer: "PD-02" },
    { bolinma_id: "bolinma2", group_name: "Peregon Yaxshilik-Kuyganyor", num: "3",   type: "R-65", location: "4068 km PK 1",     km: 4068, last_date: "2025-11-01", performer: "PD-02" },
    // 3-bo'linma
    { bolinma_id: "bolinma3", group_name: "Peregon Kuyganyor-Qorlitepa", num: "1",   type: "R-65", location: "4088 km PK 3",     km: 4088, last_date: "2025-07-15", performer: "PD-03" },
    { bolinma_id: "bolinma3", group_name: "Peregon Kuyganyor-Qorlitepa", num: "2",   type: "R-65", location: "4094 km PK 7",     km: 4094, last_date: "2025-09-20", performer: "PD-03" },
    { bolinma_id: "bolinma3", group_name: "Peregon Kuyganyor-Qorlitepa", num: "3",   type: "R-65", location: "4100 km PK 4",     km: 4100, last_date: "2025-11-05", performer: "PD-03" },
    // 4-bo'linma
    { bolinma_id: "bolinma4", group_name: "Peregon Qorlitepa-Iskandar",  num: "1",   type: "R-65", location: "4112 km PK 1",     km: 4112, last_date: "2025-08-01", performer: "PD-04" },
    { bolinma_id: "bolinma4", group_name: "Peregon Qorlitepa-Iskandar",  num: "2",   type: "R-65", location: "4118 km PK 9",     km: 4118, last_date: "2025-10-14", performer: "PD-04" },
    { bolinma_id: "bolinma4", group_name: "Peregon Qorlitepa-Iskandar",  num: "3",   type: "R-65", location: "4125 km PK 3",     km: 4125, last_date: "2025-12-01", performer: "PD-04" },
    // 5-bo'linma
    { bolinma_id: "bolinma5", group_name: "Peregon Iskandar-Bektemir",   num: "1",   type: "R-65", location: "4148 km PK 2",     km: 4148, last_date: "2025-06-10", performer: "PD-05" },
    { bolinma_id: "bolinma5", group_name: "Peregon Iskandar-Bektemir",   num: "2",   type: "R-65", location: "4155 km PK 5",     km: 4155, last_date: "2025-09-22", performer: "PD-05" },
    { bolinma_id: "bolinma5", group_name: "Peregon Iskandar-Bektemir",   num: "3",   type: "R-65", location: "4160 km PK 8",     km: 4160, last_date: "2025-11-30", performer: "PD-05" },
];

db.serialize(() => {
    // First ensure table exists
    db.run(`CREATE TABLE IF NOT EXISTS izostiklar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT,
        num TEXT,
        type TEXT DEFAULT 'R-65',
        location TEXT,
        km INTEGER,
        last_date TEXT,
        performer TEXT,
        bolinma_id TEXT,
        history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.log('Table already exists or error:', err.message);
    });

    // Check if already seeded
    db.get("SELECT COUNT(*) as count FROM izostiklar", [], (err, row) => {
        if (err) { console.error(err); return; }
        if (row.count > 0) {
            console.log(`Table already has ${row.count} records. Skipping seed.`);
            db.close();
            return;
        }

        console.log(`Seeding ${defaultData.length} izostiklar records...`);
        const stmt = db.prepare(
            `INSERT INTO izostiklar (group_name, num, type, location, km, last_date, performer, bolinma_id, history) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );

        for (const item of defaultData) {
            stmt.run(
                item.group_name, item.num, item.type, item.location,
                item.km, item.last_date, item.performer, item.bolinma_id,
                JSON.stringify([])
            );
        }

        stmt.finalize((err) => {
            if (err) {
                console.error('Finalize error:', err.message);
            } else {
                console.log('✅ Seed complete! All records inserted.');
            }
            db.close();
        });
    });
});
