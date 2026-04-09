import pool from '../config/database.js';

export const CustomOrder = {
  create: async (data) => {
    const { user_id, order_number, title, description, budget } = data;
    const result = await pool.query(
      `INSERT INTO custom_orders (user_id, order_number, title, description, budget)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, order_number, title, description, budget]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM custom_orders WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  getByUserId: async (userId, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM custom_orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  getAll: async (limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT co.*, u.name as user_name, u.email
       FROM custom_orders co
       JOIN users u ON co.user_id = u.id
       ORDER BY co.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  update: async (id, data) => {
    const { title, description, budget, status, result_file_url } = data;
    const result = await pool.query(
      `UPDATE custom_orders 
       SET title = $1, description = $2, budget = $3, status = $4, result_file_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, budget, status, result_file_url, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM custom_orders WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },
};

export const CustomOrderMessage = {
  create: async (data) => {
    const { custom_order_id, user_id, message, file_url } = data;
    const result = await pool.query(
      `INSERT INTO custom_order_messages (custom_order_id, user_id, message, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [custom_order_id, user_id, message, file_url]
    );

    const inserted = result.rows[0];
    const userResult = await pool.query(
      'SELECT name as user_name, avatar_url FROM users WHERE id = $1',
      [user_id]
    );

    return {
      ...inserted,
      user_name: userResult.rows[0]?.user_name || null,
      avatar_url: userResult.rows[0]?.avatar_url || null,
    };
  },

  getByOrderId: async (customOrderId) => {
    const result = await pool.query(
      `SELECT m.*, u.name as user_name, u.avatar_url
       FROM custom_order_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.custom_order_id = $1
       ORDER BY m.created_at ASC`,
      [customOrderId]
    );
    return result.rows;
  },
};
