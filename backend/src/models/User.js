import pool from '../config/database.js';

export const User = {
  create: async (data) => {
    const { name, email, password, phone, google_id } = data;
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone, google_id, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, phone || null, google_id || null, 'user']
    );
    const insertId = result.insertId;
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, balance, role, is_active, created_at FROM users WHERE id = ?',
      [insertId]
    );
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, avatar_url, balance, role, is_active, is_blocked, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findByGoogleId: async (googleId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const { name, phone, avatar_url } = data;
    await pool.execute(
      'UPDATE users SET name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, phone, avatar_url, id]
    );
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, avatar_url, balance, role, is_active FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  updateLastLogin: async (id) => {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  },

  getBalance: async (id) => {
    const [rows] = await pool.execute(
      'SELECT balance FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  updateBalance: async (id, amount) => {
    await pool.execute(
      'UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [amount, id]
    );
    const [rows] = await pool.execute(
      'SELECT balance FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  toggleBlock: async (id) => {
    const [rows] = await pool.execute('SELECT is_blocked FROM users WHERE id = ?', [id]);
    if (!rows.length) return null;

    const isBlocked = !rows[0].is_blocked;
    await pool.execute(
      'UPDATE users SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [isBlocked, id]
    );
    const [updatedRows] = await pool.execute(
      'SELECT id, is_blocked FROM users WHERE id = ?',
      [id]
    );
    return updatedRows[0];
  },

  getAll: async (limit = 10, offset = 0) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, balance, role, is_active, is_blocked, last_login, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  },

  count: async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user']);
    return parseInt(rows[0].count);
  },

  adminAddBalance: async (userId, amount, reason) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update balance
      await connection.execute(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [amount, userId]
      );

      // Get new balance
      const [userRows] = await connection.execute(
        'SELECT balance FROM users WHERE id = ?',
        [userId]
      );

      const newBalance = userRows[0].balance;
      const balanceBefore = newBalance - amount;

      await connection.execute(
        'INSERT INTO balance_history (user_id, type, amount, description, balance_before, balance_after) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'topup', amount, `Admin tambah saldo: ${reason}`, balanceBefore, newBalance]
      );

      await connection.commit();
      return { balance: newBalance };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
