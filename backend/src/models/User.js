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
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, avatar_url, balance, role, is_active, is_blocked, last_login, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  findByGoogleId: async (googleId) => {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const params = [];
    let i = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(data[key]);
      }
    });

    if (fields.length === 0) return await User.findById(id);

    params.push(id);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i}`,
      params
    );
    return await User.findById(id);
  },

  updateLastLogin: async (id) => {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  getBalance: async (id) => {
    const { rows } = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  updateBalance: async (id, amount) => {
    await pool.query(
      'UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [amount, id]
    );
    return await User.getBalance(id);
  },

  getAll: async (limit = 10, offset = 0) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, balance, role, is_active, is_blocked, last_login, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  },

  count: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
    return parseInt(rows[0].count);
  },
};
