import pool from '../config/database.js';

export const Category = {
  create: async (data) => {
    const { name, slug, description, icon_url, thumbnail_url } = data;
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description, icon_url, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
      [name, slug, description, icon_url, thumbnail_url]
    );
    return {
      id: result.insertId,
      name,
      slug,
      description,
      icon_url,
      thumbnail_url,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(DISTINCT sc.id) as sub_categories_count
       FROM categories c
       LEFT JOIN sub_categories sc ON c.id = sc.category_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );
    return rows[0];
  },

  findBySlug: async (slug) => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    );
    return rows[0];
  },

  getAll: async (active = true) => {
    let query = 'SELECT * FROM categories';
    if (active) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY display_order ASC, name ASC';
    const [rows] = await pool.execute(query);
    return rows;
  },

  getAllWithSubCategories: async () => {
    const [rows] = await pool.execute(
      `SELECT 
        c.id, c.name, c.slug, c.description, c.icon_url, c.thumbnail_url, c.is_active, c.created_at, c.updated_at
       FROM categories c
       ORDER BY c.display_order ASC, c.name ASC`
    );
    return rows;
  },

  update: async (id, data) => {
    const { name, slug, description, icon_url, thumbnail_url, display_order, is_active } = data;
    const [result] = await pool.execute(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, icon_url = ?, thumbnail_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, slug, description, icon_url, thumbnail_url, display_order, is_active, id]
    );
    return { id, name, slug, description, icon_url, thumbnail_url, display_order, is_active };
  },

  delete: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    return { id };
  },
};

export const SubCategory = {
  create: async (data) => {
    const { category_id, name, slug, description } = data;
    const [result] = await pool.execute(
      'INSERT INTO sub_categories (category_id, name, slug, description) VALUES (?, ?, ?, ?)',
      [category_id, name, slug, description]
    );
    return {
      id: result.insertId,
      category_id,
      name,
      slug,
      description,
      is_active: true,
      created_at: new Date(),
    };
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM sub_categories WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  getByCategoryId: async (categoryId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM sub_categories WHERE category_id = ? AND is_active = true ORDER BY display_order ASC',
      [categoryId]
    );
    return rows;
  },

  update: async (id, data) => {
    const { name, slug, description, display_order, is_active } = data;
    const [result] = await pool.execute(
      `UPDATE sub_categories 
       SET name = ?, slug = ?, description = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, slug, description, display_order, is_active, id]
    );
    return { id, name, slug, description, display_order, is_active };
  },

  delete: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM sub_categories WHERE id = ?',
      [id]
    );
    return { id };
  },
};
