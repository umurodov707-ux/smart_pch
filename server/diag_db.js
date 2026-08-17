const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'smart_pch.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');

    // 1. List all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('Error listing tables:', err.message);
            return;
        }
        console.log('Tables in database:', tables.map(t => t.name).join(', '));

        // 2. Check plets_advanced schema
        if (tables.some(t => t.name === 'plets_advanced')) {
            db.all("PRAGMA table_info(plets_advanced)", [], (err, info) => {
                if (err) console.error('Error checking plets_advanced info:', err.message);
                else console.log('plets_advanced schema:', info);
            });

            // 3. Check plets_advanced content
            db.all("SELECT * FROM plets_advanced LIMIT 10", [], (err, rows) => {
                if (err) console.error('Error checking plets_advanced data:', err.message);
                else console.log('plets_advanced sample data:', rows);
            });
        } else {
            console.warn('plets_advanced TABLE DOES NOT EXIST!');
        }
    });
});
