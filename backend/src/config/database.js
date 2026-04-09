import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

let pool;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Helper: convert Postgres-style $1, $2... placeholders to ? for mysql/sqlite
function convertDollarToQuestion(sql) {
  return sql.replace(/\$\d+/g, '?');
}

// Function to initialize SQLite database
function initializeSQLiteDatabase(dbPath) {
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create all tables individually
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

  // Execute table creation
  for (const sql of tableStatements) {
    try {
      db.exec(sql);
    } catch (error) {
      // Table might already exist
    }
  }

  // Create indexes
  const indexStatements = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_custom_order_messages_order ON custom_order_messages(custom_order_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)'
  ];

  for (const sql of indexStatements) {
    try {
      db.exec(sql);
    } catch (error) {
      // Index might already exist
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
    // Admin user might already exist
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
      // Setting might already exist
    }
  }

  return db;
}

// Function to create SQLite pool wrapper
function createSQLitePool(db) {
  return {
    execute: async (sql, params = []) => {
      try {
        const stmt = db.prepare(sql);
        let result;

        const sqlUpper = sql.toUpperCase().trim();
        if (sqlUpper.startsWith('SELECT')) {
          result = params.length > 0 ? stmt.all(...params) : stmt.all();
          return [result, null];
        } else if (sqlUpper.startsWith('INSERT')) {
          result = params.length > 0 ? stmt.run(...params) : stmt.run();
          return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }, null];
        } else if (sqlUpper.startsWith('UPDATE') || sqlUpper.startsWith('DELETE')) {
          result = params.length > 0 ? stmt.run(...params) : stmt.run();
          return [{ affectedRows: result.changes }, null];
        } else {
          result = params.length > 0 ? stmt.all(...params) : stmt.all();
          return [result, null];
        }
      } catch (error) {
        console.error('Database error:', error.message);
        return [null, error];
      }
    },
    // Provide `query` that returns an object with `.rows` to match Postgres-style models
    query: async (sql, params = []) => {
      try {
        // convert $1 placeholders to ? if present
        const converted = convertDollarToQuestion(sql);
        const stmt = db.prepare(converted);
        const result = params.length > 0 ? stmt.all(...params) : stmt.all();
        return { rows: result };
      } catch (error) {
        return { rows: null, error };
      }
    },
    getConnection: async () => ({
      execute: async (sql, params = []) => {
        try {
          const stmt = db.prepare(sql);
          let result;

          const sqlUpper = sql.toUpperCase().trim();
          if (sqlUpper.startsWith('SELECT')) {
            result = params.length > 0 ? stmt.all(...params) : stmt.all();
            return [result, null];
          } else if (sqlUpper.startsWith('INSERT')) {
            result = params.length > 0 ? stmt.run(...params) : stmt.run();
            return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }, null];
          } else if (sqlUpper.startsWith('UPDATE') || sqlUpper.startsWith('DELETE')) {
            result = params.length > 0 ? stmt.run(...params) : stmt.run();
            return [{ affectedRows: result.changes }, null];
          } else {
            result = params.length > 0 ? stmt.all(...params) : stmt.all();
            return [result, null];
          }
        } catch (error) {
          return [null, error];
        }
      },
      beginTransaction: async () => { db.exec('BEGIN TRANSACTION'); },
      commit: async () => { db.exec('COMMIT'); },
      rollback: async () => { db.exec('ROLLBACK'); },
      release: () => {}
    })
  };
}

// Initialize database based on environment
// Try MySQL first
console.log('🗄️  Connecting to MySQL Database...');
let mysqlConnected = false;

try {
  const testPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'pastodev_marketplace',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
  });

  // Test the connection
  const testConnection = await testPool.getConnection();
  testConnection.release();
  console.log('✅ MySQL database connection successful!');
  // Wrap pool to provide `query(sql, params)` that accepts $n placeholders and returns { rows }
  pool = {
    // keep native execute for existing code that expects mysql2 execute signature
    execute: (...args) => testPool.execute(...args),
    getConnection: async () => {
      const conn = await testPool.getConnection();
      return {
        execute: (...args) => conn.execute(...args),
        beginTransaction: async () => { await conn.beginTransaction?.(); },
        commit: async () => { await conn.commit?.(); },
        rollback: async () => { await conn.rollback?.(); },
        release: () => conn.release(),
      };
    },
    // `query` converts $1 placeholders to ? and returns object `{ rows }` to match Postgres-style models
    query: async (sql, params = []) => {
      const converted = convertDollarToQuestion(sql);
      const [rows] = await testPool.execute(converted, params);
      return { rows };
    }
  };
  mysqlConnected = true;

} catch (error) {
  console.error('❌ MySQL database connection failed:', error.message);
}

// If MySQL failed, use SQLite as fallback
if (!mysqlConnected) {
  console.log('💡 Switching to SQLite database for production...');

  try {
    const dbPath = path.join(__dirname, '../../data/production.db');
    const db = initializeSQLiteDatabase(dbPath);
    pool = createSQLitePool(db);
    console.log('✅ SQLite database initialized as fallback');
  } catch (sqliteError) {
    console.error('❌ SQLite initialization failed:', sqliteError.message);
    throw new Error('No database connection available');
  }
}

export default pool;
