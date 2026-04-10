import pool from '../config/database.js';
import { getInsertId } from '../utils/db.js';

export const Voucher = {
  create: async (data) => {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      usage_limit,
      valid_from,
      valid_until,
    } = data;
    const { rows: insertMeta } = await pool.query(
      `INSERT INTO vouchers (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        description ?? null,
        discount_type,
        discount_value,
        min_purchase ?? null,
        max_discount ?? null,
        usage_limit ?? null,
        valid_from ?? null,
        valid_until ?? null,
      ]
    );
    const insertId = getInsertId(insertMeta);
    const { rows } = await pool.query('SELECT * FROM vouchers WHERE id = ?', [insertId]);
    return rows[0];
  },

  findByCode: async (code) => {
    if (!code || typeof code !== 'string') return undefined;
    const { rows } = await pool.query(
      `SELECT * FROM vouchers 
       WHERE code = ? 
       AND is_active = 1
       AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)`,
      [code.toUpperCase()]
    );
    return rows[0];
  },

  getAll: async (limit = 20, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT * FROM vouchers
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  update: async (id, data) => {
    const allowed = [
      'code',
      'description',
      'discount_type',
      'discount_value',
      'min_purchase',
      'max_discount',
      'usage_limit',
      'valid_from',
      'valid_until',
      'is_active',
    ];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      const { rows } = await pool.query('SELECT * FROM vouchers WHERE id = ?', [id]);
      return rows[0];
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.query(`UPDATE vouchers SET ${fields.join(', ')} WHERE id = ?`, params);
    const { rows } = await pool.query('SELECT * FROM vouchers WHERE id = ?', [id]);
    return rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM vouchers WHERE id = ?', [id]);
    return { id };
  },

  incrementUsage: async (id) => {
    await pool.query('UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?', [id]);
  },
};

export const BalanceHistory = {
  create: async (data) => {
    const {
      user_id,
      type,
      amount,
      description,
      balance_before,
      balance_after,
      reference_id,
    } = data;
    const { rows: insertMeta } = await pool.query(
      `INSERT INTO balance_history (user_id, type, amount, description, balance_before, balance_after, reference_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        type,
        amount,
        description ?? null,
        balance_before ?? null,
        balance_after ?? null,
        reference_id ?? null,
      ]
    );
    const insertId = getInsertId(insertMeta);
    const { rows } = await pool.query('SELECT * FROM balance_history WHERE id = ?', [insertId]);
    return rows[0];
  },

  getByUserId: async (userId, limit = 50, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT * FROM balance_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },
};
