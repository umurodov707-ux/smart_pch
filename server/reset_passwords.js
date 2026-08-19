const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'smart_pch.db');
const db = new sqlite3.Database(dbPath);

require('dotenv').config();

const defaultPassword = process.env.INITIAL_USER_PASSWORD || 'smart_password_123';

const defaultUsers = [
    { username: 'admin', password: defaultPassword },
    { username: 'ishlab', password: defaultPassword },
    { username: 'xodimlar', password: defaultPassword },
    { username: 'bugalteriya', password: defaultPassword },
    { username: 'iqtisod', password: defaultPassword },
    { username: 'mexanika', password: defaultPassword },
    { username: 'mehnat', password: defaultPassword },
    { username: 'dispetcher', password: defaultPassword },
    { username: 'metrologiya', password: defaultPassword }
];

// Add bolinma1-10
for (let i = 1; i <= 10; i++) {
    defaultUsers.push({
        username: `bolinma${i}`,
        password: defaultPassword
    });
}


db.serialize(() => {
    console.log('Resetting user passwords...');

    defaultUsers.forEach(u => {
        const hashedPassword = bcrypt.hashSync(u.password, 10);
        db.run(
            `UPDATE users SET password = ? WHERE username = ?`,
            [hashedPassword, u.username],
            function (err) {
                if (err) {
                    console.error(`Error updating ${u.username}:`, err.message);
                } else if (this.changes > 0) {
                    console.log(`Password updated for: ${u.username}`);
                } else {
                    // If user doesn't exist, maybe we should insert them?
                    // But for now let's just log.
                    console.log(`User ${u.username} not found, skipping update.`);
                }
            }
        );
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Database password reset completed.');
});
