import pool from '../config/database.js';

export const Settings = {
  get: async (key) => {
    const [rows] = await pool.execute(
      'SELECT `key`, value, description FROM settings WHERE `key` = ?',
      [key]
    );
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await pool.execute(
      'SELECT `key`, value, description FROM settings ORDER BY `key` ASC'
    );
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });
    return settings;
  },

  update: async (key, value) => {
    await pool.execute(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?',
      [value, key]
    );
    const [rows] = await pool.execute(
      'SELECT `key`, value, description FROM settings WHERE `key` = ?',
      [key]
    );
    return rows[0];
  },

  set: async (key, value, description = '') => {
    await pool.execute(
      `INSERT INTO settings (\`key\`, value, description) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, value, description, value]
    );
    const [rows] = await pool.execute(
      'SELECT `key`, value, description FROM settings WHERE `key` = ?',
      [key]
    );
    return rows[0];
  }
};

export const Notification = {
  create: async (data) => {
    const { user_id, type, title, message, related_id } = data;
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, type, title, message, related_id]
    );
    const insertId = result.insertId;
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [insertId]
    );
    return rows[0];
  },

  getByUserId: async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },

  markAsRead: async (id) => {
    await pool.execute(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [id]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  markAllAsRead: async (userId) => {
    await pool.execute(
      'UPDATE notifications SET is_read = true WHERE user_id = ?',
      [userId]
    );
  },

  getUnreadCount: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );
    return parseInt(rows[0].count);
  },

  delete: async (id) => {
    await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    return { id };
  },

  deleteByUserId: async (userId) => {
    await pool.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
  },

  deleteExpired: async (daysOld = 30) => {
    await pool.execute(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
  }
};
