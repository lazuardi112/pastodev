import pool from '../config/database.js';

export const Transaction = {
  create: async (data) => {
    const {
      user_id,
      order_id,
      gross_amount,
      discount_amount = 0,
      final_amount = null,
      payment_method,
      midtrans_snap_token,
      midtrans_transaction_id = null,
      status = 'pending',
      notes = null,
    } = data;
    const [result] = await pool.execute(
      `INSERT INTO transactions (user_id, order_id, gross_amount, discount_amount, final_amount, payment_method, midtrans_snap_token, midtrans_transaction_id, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        order_id,
        gross_amount,
        discount_amount,
        final_amount,
        payment_method,
        midtrans_snap_token,
        midtrans_transaction_id,
        status,
        notes,
      ]
    );
    const insertId = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [insertId]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findByOrderId: async (orderId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE order_id = ?',
      [orderId]
    );
    return rows[0];
  },

  getByUserId: async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT t.* FROM transactions t
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // Get items for each transaction
    const transactions = [];
    for (const t of rows) {
      const [items] = await pool.execute(
        'SELECT * FROM transaction_items WHERE transaction_id = ?',
        [t.id]
      );
      transactions.push({ ...t, items });
    }
    return transactions;
  },

  update: async (id, data) => {
    const allowed = ['status', 'midtrans_transaction_id', 'midtrans_snap_token', 'notes'];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) {
      const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
      return rows[0];
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await pool.execute(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [id]);
    return rows[0];
  },

  updateStatus: async (orderId, status) => {
    await pool.execute(
      `UPDATE transactions 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?`,
      [status, orderId]
    );
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE order_id = ?', [orderId]);
    return rows[0];
  },

  getAll: async (limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name as user_name, u.email
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  getStatistics: async () => {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
        SUM(CASE WHEN status = 'success' THEN gross_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'success' THEN gross_amount ELSE 0 END) as avg_transaction
       FROM transactions`
    );
    return rows[0];
  },
};

export const TransactionItem = {
  create: async (data) => {
    const { transaction_id, product_id, product_name, price, quantity, subtotal } = data;
    const [result] = await pool.execute(
      `INSERT INTO transaction_items (transaction_id, product_id, product_name, price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transaction_id, product_id, product_name, price, quantity, subtotal]
    );
    const insertId = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM transaction_items WHERE id = ?', [insertId]);
    return rows[0];
  },

  getByTransactionId: async (transactionId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM transaction_items WHERE transaction_id = ?',
      [transactionId]
    );
    return rows;
  },
};
