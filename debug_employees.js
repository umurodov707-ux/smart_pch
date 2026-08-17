const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/smart_pch.db');

db.all('SELECT * FROM employees LIMIT 10', [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
});
