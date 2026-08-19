/**
 * DATA MIGRATION SCRIPT
 * Copies all data from SQLite to PostgreSQL.
 */

const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const sqlitePath = process.env.DB_PATH || path.join(__dirname, 'smart_pch.db');
const pgUrl = process.env.DATABASE_URL;

if (!pgUrl) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const sqliteDb = new sqlite3.Database(sqlitePath);
const pgPool = new Pool({ connectionString: pgUrl });

const tables = [
    'users', 'reports', 'okno_planning', 'sand_analysis_reports', 
    'infrastructure_status', 'digital_warnings', 'defects', 'infrastructure_assets'
];

async function migrate() {
    console.log('Starting migration...');
    
    for (const table of tables) {
        console.log(`Migrating table: ${table}...`);
        
        const rows = await new Promise((resolve, reject) => {
            sqliteDb.all(`SELECT * FROM ${table}`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (rows.length === 0) {
            console.log(`Table ${table} is empty, skipping.`);
            continue;
        }

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        for (const row of rows) {
            const values = columns.map(col => row[col]);
            try {
                await pgPool.query(insertSql, values);
            } catch (err) {
                console.error(`Error inserting into ${table}:`, err.message);
            }
        }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
