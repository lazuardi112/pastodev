import pool from '../config/database.js';

export const CustomOrderPayment = {
  create: async (data) => {
    const { custom_order_id, amount, status = 'pending', midtrans_order_id, snap_token = null } = data;
    const [result] = await pool.execute(
      `INSERT INTO custom_order_payments (custom_order_id, amount, status, midtrans_order_id, snap_token)
       VALUES (?, ?, ?, ?, ?)`,
      [custom_order_id, amount, status, midtrans_order_id, snap_token]
    );
    const [rows] = await pool.execute('SELECT * FROM custom_order_payments WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  findByMidtransOrderId: async (midtransOrderId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM custom_order_payments WHERE midtrans_order_id = ? LIMIT 1',
      [midtransOrderId]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const allowed = ['status', 'snap_token', 'amount'];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) {
      const [rows] = await pool.execute('SELECT * FROM custom_order_payments WHERE id = ?', [id]);
      return rows[0];
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await pool.execute(`UPDATE custom_order_payments SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.execute('SELECT * FROM custom_order_payments WHERE id = ?', [id]);
    return rows[0];
  },
};
