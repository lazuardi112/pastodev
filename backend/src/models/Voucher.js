import pool from '../config/database.js';

export const Voucher = {
  create: async (data) => {
    const { code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until } = data;
    const result = await pool.query(
      `INSERT INTO vouchers (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until]
    );
    return result.rows[0];
  },

  findByCode: async (code) => {
    const result = await pool.query(
      `SELECT * FROM vouchers 
       WHERE code = $1 
       AND is_active = true 
       AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
       AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)`,
      [code.toUpperCase()]
    );
    return result.rows[0];
  },

  getAll: async (limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM vouchers
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  update: async (id, data) => {
    const { code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until, is_active } = data;
    const result = await pool.query(
      `UPDATE vouchers 
       SET code = $1, description = $2, discount_type = $3, discount_value = $4, min_purchase = $5, max_discount = $6, usage_limit = $7, valid_from = $8, valid_until = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until, is_active, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM vouchers WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  incrementUsage: async (id) => {
    const result = await pool.query(
      'UPDATE vouchers SET used_count = used_count + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

export const BalanceHistory = {
  create: async (data) => {
    const { user_id, type, amount, description, balance_before, balance_after, reference_id } = data;
    const result = await pool.query(
      `INSERT INTO balance_history (user_id, type, amount, description, balance_before, balance_after, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, type, amount, description, balance_before, balance_after, reference_id]
    );
    return result.rows[0];
  },

  getByUserId: async (userId, limit = 50, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM balance_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },
};
