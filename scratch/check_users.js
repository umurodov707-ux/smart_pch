const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'Desktop', 'smartpch', 'расм', 'server', 'smart_pch.db');

// Loyiha ichidan chaqirilganida ishlashi uchun:
const db = new sqlite3.Database(process.argv[2] || 'server/smart_pch.db');
db.all('SELECT id, username, role, status FROM users LIMIT 10', (err, rows) => {
    if (err) { console.error(err); }
    else { console.log(JSON.stringify(rows, null, 2)); }
    db.close();
});
