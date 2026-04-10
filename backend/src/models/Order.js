import pool from '../config/database.js';

export const ProductOrder = {
  create: async (data) => {
    const {
      user_id,
      product_id,
      quantity = 1,
      amount,
      status = 'pending',
      transaction_id = null,
      midtrans_order_id = null,
    } = data;
    const [result] = await pool.execute(
      `INSERT INTO orders (user_id, product_id, quantity, amount, status, transaction_id, midtrans_order_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, product_id, quantity, amount, status, transaction_id, midtrans_order_id]
    );
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  },

  findByTransactionId: async (transactionId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE transaction_id = ?',
      [transactionId]
    );
    return rows;
  },

  updateStatusByTransactionId: async (transactionId, status) => {
    await pool.execute(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?`,
      [status, transactionId]
    );
    return ProductOrder.findByTransactionId(transactionId);
  },

  updateStatus: async (id, status) => {
    await pool.execute(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  },

  getByUserId: async (userId, limit = 50, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT o.*,
              p.name AS product_name,
              p.thumbnail_url,
              p.slug AS product_slug
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },

  setTransactionId: async (orderId, transactionId, midtransOrderId) => {
    await pool.execute(
      `UPDATE orders SET transaction_id = ?, midtrans_order_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [transactionId, midtransOrderId, orderId]
    );
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    return rows[0];
  },
};
