import pool from '../config/database.js';
import { getInsertId } from '../utils/db.js';

const ORDER_UPDATE_FIELDS = [
  'title',
  'description',
  'budget',
  'status',
  'payment_status',
  'payment_link',
  'result_file_url',
  'request_file_url',
  'admin_notes',
];

export const CustomOrder = {
  create: async (data) => {
    const { user_id, order_number, title, description, budget, request_file_url } = data;
    const { rows: insertMeta } = await pool.query(
      `INSERT INTO custom_orders (user_id, order_number, title, description, budget, request_file_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, order_number, title, description ?? null, budget ?? null, request_file_url ?? null]
    );
    const insertId = getInsertId(insertMeta);
    if (!insertId) {
      const { rows } = await pool.query(
        'SELECT * FROM custom_orders WHERE order_number = ? LIMIT 1',
        [order_number]
      );
      return rows[0];
    }
    const { rows } = await pool.query('SELECT * FROM custom_orders WHERE id = ?', [insertId]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM custom_orders WHERE id = ?', [id]);
    return rows[0];
  },

  findByOrderNumber: async (orderNumber) => {
    const { rows } = await pool.query(
      'SELECT * FROM custom_orders WHERE order_number = ? LIMIT 1',
      [orderNumber]
    );
    return rows[0];
  },

  getByUserId: async (userId, limit = 20, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT * FROM custom_orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },

  getAll: async (limit = 20, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT co.*, u.name as user_name, u.email
       FROM custom_orders co
       JOIN users u ON co.user_id = u.id
       ORDER BY co.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  update: async (id, data) => {
    const fields = [];
    const params = [];

    for (const key of ORDER_UPDATE_FIELDS) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return await CustomOrder.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.query(
      `UPDATE custom_orders SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return await CustomOrder.findById(id);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM custom_orders WHERE id = ?', [id]);
    return { id };
  },
};

export const CustomOrderMessage = {
  create: async (data) => {
    const { custom_order_id, user_id, message, file_url } = data;
    const coId = Number(custom_order_id);
    const uId = Number(user_id);

    const { rows: insertMeta } = await pool.query(
      `INSERT INTO custom_order_messages (custom_order_id, user_id, message, file_url)
       VALUES (?, ?, ?, ?)`,
      [coId, uId, message ?? null, file_url ?? null]
    );

    const insertId = getInsertId(insertMeta);
    const { rows: insertedRows } = await pool.query(
      'SELECT * FROM custom_order_messages WHERE id = ?',
      [insertId]
    );
    const inserted = insertedRows[0];

    const { rows: userRows } = await pool.query(
      'SELECT name as user_name, avatar_url FROM users WHERE id = ?',
      [uId]
    );

    return {
      ...inserted,
      user_name: userRows[0]?.user_name ?? null,
      avatar_url: userRows[0]?.avatar_url ?? null,
    };
  },

  getByOrderId: async (customOrderId) => {
    const { rows } = await pool.query(
      `SELECT m.*, u.name as user_name, u.avatar_url
       FROM custom_order_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.custom_order_id = ?
       ORDER BY m.created_at ASC`,
      [customOrderId]
    );
    return rows;
  },
};
