import pool from '../config/database.js';

export const ContactInfo = {
  listAll: async () => {
    const [rows] = await pool.execute(
      `SELECT id, title, description, phone, email, address, created_at, updated_at
       FROM contact_info ORDER BY id ASC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM contact_info WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { title, description, phone, email, address } = data;
    const [result] = await pool.execute(
      `INSERT INTO contact_info (title, description, phone, email, address)
       VALUES (?, ?, ?, ?, ?)`,
      [title ?? 'Hubungi Kami', description ?? null, phone ?? null, email ?? null, address ?? null]
    );
    const [rows] = await pool.execute('SELECT * FROM contact_info WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  update: async (id, data) => {
    const allowed = ['title', 'description', 'phone', 'email', 'address'];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return ContactInfo.findById(id);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await pool.execute(`UPDATE contact_info SET ${fields.join(', ')} WHERE id = ?`, params);
    return ContactInfo.findById(id);
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM contact_info WHERE id = ?', [id]);
    return { id };
  },
};
