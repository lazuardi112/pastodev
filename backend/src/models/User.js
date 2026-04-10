import pool from '../config/database.js';
import { getInsertId } from '../utils/db.js';
import { BalanceHistory } from './Voucher.js';

export const User = {
  create: async (data) => {
    const { name, email, password, phone, google_id, avatar_url } = data;
    const { rows: insertMeta } = await pool.query(
      `INSERT INTO users (name, email, password, phone, google_id, avatar_url, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password ?? null,
        phone ?? null,
        google_id ?? null,
        avatar_url ?? null,
        'user',
      ]
    );
    const insertId = getInsertId(insertMeta);
    if (insertId) {
      const { rows } = await pool.query(
        'SELECT id, name, email, phone, balance, role, is_active, created_at FROM users WHERE id = ?',
        [insertId]
      );
      return rows[0];
    }
    const { rows: fallback } = await pool.query(
      'SELECT id, name, email, phone, balance, role, is_active, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return fallback[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, avatar_url, balance, role, is_active, is_blocked, last_login, created_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  findByGoogleId: async (googleId) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0];
  },

  update: async (id, data) => {
    const allowed = [
      'name',
      'email',
      'phone',
      'avatar_url',
      'google_id',
      'is_active',
      'is_blocked',
      'role',
    ];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return await User.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return await User.findById(id);
  },

  updateLastLogin: async (id) => {
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  },

  getBalance: async (id) => {
    const { rows } = await pool.query('SELECT balance FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  updateBalance: async (id, amount) => {
    await pool.query(
      'UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [amount, id]
    );
    return await User.getBalance(id);
  },

  getAll: async (limit = 10, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, balance, role, is_active, is_blocked, last_login, created_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  count: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user']);
    return parseInt(rows[0]?.count ?? 0, 10);
  },

  findByEmailExcludingId: async (email, excludeId) => {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [
      email,
      excludeId,
    ]);
    return rows[0];
  },

  toggleBlock: async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    const blocked = user.is_blocked === 1 || user.is_blocked === true;
    return await User.update(userId, { is_blocked: blocked ? 0 : 1 });
  },

  /**
   * Penyesuaian saldo oleh admin (+/-) + riwayat saldo.
   */
  adminAdjustBalance: async (userId, amount, type, description) => {
    const user = await User.findById(userId);
    if (!user) return null;
    const balanceBefore = Number(user.balance ?? 0);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt === 0) return user;

    await User.updateBalance(userId, amt);
    const balanceAfter = balanceBefore + amt;

    await BalanceHistory.create({
      user_id: userId,
      type: type || 'admin_adjustment',
      amount: amt,
      description: description || '',
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_id: null,
    });

    return await User.findById(userId);
  },

  deactivate: async (userId) => {
    await pool.query(
      'UPDATE users SET is_active = 0, is_blocked = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
    return await User.findById(userId);
  },

  /** ID semua pengguna (untuk broadcast notifikasi admin). */
  getAllUserIds: async () => {
    const { rows } = await pool.query('SELECT id FROM users');
    return rows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id));
  },

  /** ID akun admin aktif (notifikasi setelah pengaturan diubah). */
  getAdminIds: async () => {
    const { rows } = await pool.query(
      `SELECT id FROM users WHERE role = 'admin' AND is_active = 1 AND (is_blocked = 0 OR is_blocked IS NULL)`
    );
    return rows.map((r) => Number(r.id)).filter((id) => Number.isFinite(id));
  },
};
