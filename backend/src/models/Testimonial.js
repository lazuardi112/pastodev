import pool from '../config/database.js';

export const Testimonial = {
  listActive: async (limit = 20) => {
    const [rows] = await pool.execute(
      `SELECT * FROM testimonials WHERE is_active = 1
       ORDER BY display_order ASC, id DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  listAll: async (limit = 100, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT * FROM testimonials ORDER BY display_order ASC, id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { name, role, comment, avatar_initials, rating = 5, display_order = 0, is_active = true } = data;
    const [result] = await pool.execute(
      `INSERT INTO testimonials (name, role, comment, avatar_initials, rating, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, role ?? null, comment, avatar_initials ?? null, rating, display_order, is_active ? 1 : 0]
    );
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  update: async (id, data) => {
    const allowed = ['name', 'role', 'comment', 'avatar_initials', 'rating', 'display_order', 'is_active'];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        if (key === 'is_active') params.push(data[key] ? 1 : 0);
        else params.push(data[key]);
      }
    }
    if (fields.length === 0) return Testimonial.findById(id);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    await pool.execute(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`, params);
    return Testimonial.findById(id);
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    return { id };
  },
};
