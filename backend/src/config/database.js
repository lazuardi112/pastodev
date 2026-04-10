import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env (same as server.js)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
/** Production: never fall back to SQLite unless explicitly enabled. */
const allowSqliteFallback =
  process.env.DB_SQLITE_FALLBACK === 'true' ||
  (NODE_ENV !== 'production' && process.env.DB_SQLITE_FALLBACK !== 'false');

let pool;

// Helper: convert Postgres-style $1, $2... placeholders to ? for mysql/sqlite
// This version is safer and doesn't rely on global replacement if not needed
function convertDollarToQuestion(sql) {
  if (typeof sql !== 'string') return sql;
  return sql.replace(/\$\d+/g, '?');
}

// Function to initialize SQLite database
function initializeSQLiteDatabase(dbPath) {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      avatar_url TEXT,
      google_id TEXT UNIQUE,
      balance DECIMAL(15,2) DEFAULT 0.00,
      role TEXT DEFAULT 'user',
      is_active BOOLEAN DEFAULT 1,
      is_blocked BOOLEAN DEFAULT 0,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT UNIQUE,
      description TEXT,
      icon_url TEXT,
      thumbnail_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sub_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      sub_category_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      price DECIMAL(15,2) NOT NULL,
      discount_percent DECIMAL(5,2) DEFAULT 0,
      discount_price DECIMAL(15,2),
      file_url TEXT,
      file_size INTEGER,
      thumbnail_url TEXT,
      views INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      share_link TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(15,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value DECIMAL(15,2) NOT NULL,
      min_purchase DECIMAL(15,2),
      max_discount DECIMAL(15,2),
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS balance_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      balance_before DECIMAL(15,2),
      balance_after DECIMAL(15,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS custom_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      budget DECIMAL(15,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS custom_order_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      custom_order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (custom_order_id) REFERENCES custom_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of tableStatements) {
    try {
      db.exec(sql);
    } catch (error) {
      console.error('Error creating table:', error.message);
    }
  }

  // Insert default admin user
  try {
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@pastopup.id');
    if (!existingAdmin) {
      const hashedPassword = bcryptjs.hashSync('ardigg12', 10);
      db.prepare(`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES (?, ?, ?, ?, ?)
      `).run('Admin PastoDEV', 'admin@pastopup.id', hashedPassword, 'admin', 1);
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }

  // Insert default settings
  const defaultSettings = [
    ['theme_primary_color', '#00acc2', 'Warna utama tema'],
    ['theme_secondary_color', '#2196F3', 'Warna sekunder tema'],
    ['site_title', 'PastoDEV Marketplace', 'Judul website'],
    ['site_description', 'Platform marketplace digital terpercaya untuk produk dan layanan digital', 'Deskripsi website'],
    ['landing_banner_url', '', 'URL banner landing page'],
    ['landing_banner_title', 'Selamat Datang di PastoDEV', 'Judul banner landing page'],
    ['landing_banner_description', 'Jual dan beli produk digital dengan aman dan terpercaya', 'Deskripsi banner'],
    ['fee_percentage', '2.5', 'Persentase fee platform'],
    ['min_topup', '10000', 'Minimum topup saldo'],
    ['max_topup', '50000000', 'Maksimum topup saldo']
  ];

  for (const [key, value, description] of defaultSettings) {
    try {
      const exists = db.prepare('SELECT id FROM settings WHERE key = ?').get(key);
      if (!exists) {
        db.prepare(`
          INSERT INTO settings (key, value, description)
          VALUES (?, ?, ?)
        `).run(key, value, description);
      }
    } catch (error) {
      console.error(`Error creating setting ${key}:`, error.message);
    }
  }

  return db;
}

function createSQLitePool(db) {
  const execute = async (sql, params = []) => {
    const converted = convertDollarToQuestion(sql);
    const stmt = db.prepare(converted);
    const sqlUpper = sql.toUpperCase().trim();

    if (sqlUpper.startsWith('SELECT')) {
      const rows = stmt.all(...params);
      return [rows, null];
    } else {
      const result = stmt.run(...params);
      return [{
        insertId: result.lastInsertRowid,
        affectedRows: result.changes
      }, null];
    }
  };

  return {
    execute,
    query: async (sql, params = []) => {
      const [rows] = await execute(sql, params);
      return { rows };
    },
    getConnection: async () => ({
      execute,
      beginTransaction: async () => { db.exec('BEGIN TRANSACTION'); },
      commit: async () => { db.exec('COMMIT'); },
      rollback: async () => { db.exec('ROLLBACK'); },
      release: () => {}
    })
  };
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'xcreatem_store',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
};

logger.info(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port} / ${dbConfig.database}`);

try {
  const mysqlPool = mysql.createPool(dbConfig);
  const connection = await mysqlPool.getConnection();
  connection.release();
  logger.info('MySQL connection OK');

  pool = {
    execute: (sql, params) => mysqlPool.execute(convertDollarToQuestion(sql), params ?? []),
    query: async (sql, params = []) => {
      const [rows] = await mysqlPool.execute(convertDollarToQuestion(sql), params);
      return { rows };
    },
    getConnection: async () => {
      const conn = await mysqlPool.getConnection();
      return {
        execute: (sql, params) => conn.execute(convertDollarToQuestion(sql), params ?? []),
        beginTransaction: () => conn.beginTransaction(),
        commit: () => conn.commit(),
        rollback: () => conn.rollback(),
        release: () => conn.release(),
      };
    },
  };
} catch (error) {
  logger.error('MySQL connection failed:', error.message);
  if (!allowSqliteFallback) {
    logger.error(
      'SQLite fallback is disabled. Set DB credentials in backend/.env or set DB_SQLITE_FALLBACK=true for local fallback.'
    );
    process.exit(1);
  }
  logger.warn('Falling back to SQLite (development / DB_SQLITE_FALLBACK=true)');
  try {
    const dbPath = path.join(__dirname, '../../data/production.db');
    const db = initializeSQLiteDatabase(dbPath);
    pool = createSQLitePool(db);
    logger.info('SQLite initialized at', dbPath);
  } catch (sqliteError) {
    logger.error('SQLite initialization failed:', sqliteError.message);
    process.exit(1);
  }
}

export default pool;
