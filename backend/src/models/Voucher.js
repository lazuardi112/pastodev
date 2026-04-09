import pool from '../config/database.js';

export const Voucher = {
  create: async (data) => {
    const { code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until } = data;
    await pool.query(
      `INSERT INTO vouchers (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_from, valid_until]
    );
    const { rows } = await pool.query('SELECT * FROM vouchers ORDER BY id DESC LIMIT 1');
    return rows[0];
  },

  findByCode: async (code) => {
    const { rows } = await pool.query(
      `SELECT * FROM vouchers 
       WHERE code = $1 
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
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
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

    if (fields.length === 0) return await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]).then(r => r.rows[0]);

    params.push(id);
    await pool.query(
      `UPDATE vouchers 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${i}`,
      params
    );
    const { rows } = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    return rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM vouchers WHERE id = $1', [id]);
    return { id };
  },

  incrementUsage: async (id) => {
    await pool.query('UPDATE vouchers SET used_count = used_count + 1 WHERE id = $1', [id]);
  },
};

export const BalanceHistory = {
  create: async (data) => {
    const { user_id, type, amount, description, balance_before, balance_after } = data;
    await pool.query(
      `INSERT INTO balance_history (user_id, type, amount, description, balance_before, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, type, amount, description, balance_before, balance_after]
    );
    const { rows } = await pool.query('SELECT * FROM balance_history ORDER BY id DESC LIMIT 1');
    return rows[0];
  },

  getByUserId: async (userId, limit = 50, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT * FROM balance_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },
};
