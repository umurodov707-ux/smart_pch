let Pool;
try {
    Pool = require('pg').Pool;
} catch (e) {
    console.warn('[WARN] PostgreSQL (pg) paketi topilmadi. Faqat SQLite ishlatish mumkin.');
}

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initSchema } = require('./schema_manager');
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'sqlite';
let dbInstance;

/**
 * DATABASE WRAPPER
 * This object normalizes calls for both SQLite and PostgreSQL.
 * Specifically, it handles the parameter placeholder difference (? vs $1).
 */
const db = {
    isPostgres: dbType === 'postgres',
    
    // Internal driver instances
    _sqlite: null,
    _pgPool: null,

    init: async function() {
        if (this.isPostgres && Pool) {
            console.log('Connecting to PostgreSQL...');
            this._pgPool = new Pool({
                connectionString: process.env.DATABASE_URL
            });
            // Test connection
            try {
                await this._pgPool.query('SELECT NOW()');
                console.log('Connected to PostgreSQL successfully.');
            } catch (err) {
                console.error('PostgreSQL connection failed, falling back to SQLite.', err.message);
                this.isPostgres = false;
            }
        } else if (this.isPostgres && !Pool) {
            console.error('PostgreSQL tanlangan, lekin "pg" paketi o\'rnatilmagan. SQLite ga qaytilmoqda.');
            this.isPostgres = false;
        }

        if (!this.isPostgres) {
            const dbPath = process.env.DB_PATH || path.join(__dirname, 'smart_pch.db');
            // Ulanishni Promise'ga o'raymiz — aks holda schema ulanishdan oldin ishga tushishi mumkin
            await new Promise((resolve, reject) => {
                this._sqlite = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('SQLite connection error:', err.message);
                        return reject(err);
                    }
                    console.log('Connected to SQLite database.');
                    // Enable WAL mode for better concurrency and Foreign Keys for integrity
                    this._sqlite.run('PRAGMA journal_mode=WAL');
                    this._sqlite.run('PRAGMA busy_timeout=5000');
                    this._sqlite.run('PRAGMA foreign_keys=ON', () => resolve());
                });
            });
        }

        // Initialize schema
        await initSchema(this);
        this._ready = true;
    },

    /**
     * Baza va schema tayyor bo'lguncha kutish.
     * server/index.js listen() dan oldin shu Promise'ni kutadi.
     */
    whenReady: function() {
        return this._readyPromise;
    },

    // Convert SQL query parameters from ? to $1, $2... for PostgreSQL
    _convertQuery: function(sql) {
        if (!this.isPostgres) return sql;
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    },

    /**
     * Executes a query and returns all rows
     */
    all: function(sql, params = [], callback) {
        const query = this._convertQuery(sql);
        if (this.isPostgres) {
            this._pgPool.query(query, params)
                .then(res => callback(null, res.rows))
                .catch(err => callback(err));
        } else {
            this._sqlite.all(sql, params, callback);
        }
    },

    /**
     * Executes a query and returns the first row
     */
    get: function(sql, params = [], callback) {
        const query = this._convertQuery(sql);
        if (this.isPostgres) {
            this._pgPool.query(query, params)
                .then(res => callback(null, res.rows[0]))
                .catch(err => callback(err));
        } else {
            this._sqlite.get(sql, params, callback);
        }
    },

    /**
     * Executes a query (INSERT, UPDATE, DELETE)
     */
    run: function(sql, params = [], callback) {
        let query = this._convertQuery(sql);
        if (this.isPostgres) {
            // PostgreSQL compatibility: automatically append RETURNING id for INSERT queries if not present
            const isInsert = query.trim().toUpperCase().startsWith('INSERT');
            const hasReturning = query.toUpperCase().includes('RETURNING');
            if (isInsert && !hasReturning) {
                query += ' RETURNING id';
            }

            this._pgPool.query(query, params)
                .then(res => {
                    // Extract returned ID if available
                    const lastID = res.rows && res.rows[0] ? res.rows[0].id : null;
                    if (callback) callback.call({ lastID: lastID, changes: res.rowCount }, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        } else {
            this._sqlite.run(sql, params, callback);
        }
    },

    // Helper for migrations where we don't care about the result
    exec: function(sql) {
        if (this.isPostgres) return this._pgPool.query(sql);
        return new Promise((resolve, reject) => {
            this._sqlite.run(sql, (err) => err ? reject(err) : resolve());
        });
    },

    /**
     * SQLite specific methods for bulk operations
     */
    serialize: function(callback) {
        if (this.isPostgres) callback();
        else this._sqlite.serialize(callback);
    },

    prepare: function(sql) {
        if (this.isPostgres) {
            return {
                run: (params, cb) => this.run(sql, params, cb),
                finalize: (cb) => { if (cb) cb(); }
            };
        }
        return this._sqlite.prepare(sql);
    }
};

// Initialize connection.
// MUHIM: init() async. Ilgari natijasi e'tiborsiz qoldirilardi va server
// schema tayyor bo'lmasdan turib so'rovlarni qabul qilishi mumkin edi (race condition).
// Endi Promise saqlanadi va index.js uni listen() dan oldin kutadi.
db._ready = false;
db._readyPromise = db.init().catch((err) => {
    console.error('\n❌ MA\'LUMOTLAR BAZASINI ISHGA TUSHIRIB BO\'LMADI:', err.message);
    console.error(err);
    process.exit(1);
});

module.exports = db;
