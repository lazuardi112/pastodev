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
      is_active: 1,
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
      query += ' WHERE is_active = 1';
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

    // Build update query dynamically to avoid overwriting with null if not provided
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (icon_url !== undefined) { fields.push('icon_url = ?'); params.push(icon_url); }
    if (thumbnail_url !== undefined) { fields.push('thumbnail_url = ?'); params.push(thumbnail_url); }
    if (display_order !== undefined) { fields.push('display_order = ?'); params.push(display_order); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length === 0) return await Category.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return await Category.findById(id);
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
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
      is_active: 1,
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
      'SELECT * FROM sub_categories WHERE category_id = ? AND is_active = 1 ORDER BY display_order ASC',
      [categoryId]
    );
    return rows;
  },

  update: async (id, data) => {
    const { name, slug, description, display_order, is_active } = data;

    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (display_order !== undefined) { fields.push('display_order = ?'); params.push(display_order); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length === 0) return await SubCategory.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE sub_categories SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return await SubCategory.findById(id);
  },

  delete: async (id) => {
    await pool.execute('DELETE FROM sub_categories WHERE id = ?', [id]);
    return { id };
  },
};
