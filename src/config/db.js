const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('../utils/logger');

// Ensure database directory exists
const dbDir = path.dirname(path.resolve(config.dbFile));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(path.resolve(config.dbFile), (err) => {
  if (err) {
    logger.error('Failed to connect to SQLite database:', err.message);
  } else {
    logger.success(`Connected to free SQLite database at ${config.dbFile}`);
    initSchema();
  }
});

// Promisified helper methods for modern async/await use
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Initialize default tables
function initSchema() {
  db.serialize(() => {
    // Accounts (Any MT5 broker)
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT UNIQUE NOT NULL,
        broker TEXT,
        account_name TEXT,
        balance REAL DEFAULT 0,
        equity REAL DEFAULT 0,
        margin REAL DEFAULT 0,
        free_margin REAL DEFAULT 0,
        leverage INTEGER DEFAULT 100,
        currency TEXT DEFAULT 'USD',
        is_demo INTEGER DEFAULT 1,
        status TEXT DEFAULT 'CONNECTED',
        last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trades & Positions
    db.run(`
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket INTEGER UNIQUE,
        account_number TEXT NOT NULL,
        symbol TEXT NOT NULL,
        trade_type TEXT NOT NULL, /* BUY or SELL */
        lots REAL NOT NULL,
        open_price REAL NOT NULL,
        close_price REAL,
        stop_loss REAL,
        take_profit REAL,
        profit REAL DEFAULT 0,
        status TEXT DEFAULT 'OPEN', /* OPEN, CLOSED, CANCELLED */
        magic_number INTEGER DEFAULT 9999,
        open_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        close_time DATETIME
      )
    `);

    // AI & Quantitative Signals
    db.run(`
      CREATE TABLE IF NOT EXISTS signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        direction TEXT NOT NULL, /* BUY, SELL, NEUTRAL */
        strategy_name TEXT NOT NULL,
        confidence REAL, /* 0.0 to 1.0 */
        timeframe TEXT DEFAULT 'M15',
        ai_rationale TEXT,
        executed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bridge Pending Command Queue (Node -> MT5 EA execution)
    db.run(`
      CREATE TABLE IF NOT EXISTS order_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        action TEXT NOT NULL, /* OPEN, CLOSE, MODIFY */
        symbol TEXT NOT NULL,
        order_type TEXT, /* BUY, SELL */
        volume REAL,
        sl REAL,
        tp REAL,
        ticket INTEGER,
        status TEXT DEFAULT 'PENDING', /* PENDING, PROCESSING, COMPLETED, FAILED */
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Database schema verified & ready.');
  });
}

module.exports = { db, dbAsync };
