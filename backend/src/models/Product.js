import pool from '../config/database.js';

export const Product = {
  create: async (data) => {
    const {
      category_id,
      name,
      slug,
      description,
      price,
      discount_percent = 0,
      file_url,
      file_size,
      thumbnail_url,
      created_by,
    } = data;

    const discount_price =
      discount_percent && discount_percent > 0
        ? price * (1 - discount_percent / 100)
        : price;

    await pool.query(
      `INSERT INTO products (
        category_id, name, slug, description, price, 
        discount_percent, discount_price, file_url, file_size, 
        thumbnail_url, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [category_id, name, slug, description, price, discount_percent, discount_price, file_url, file_size, thumbnail_url, created_by]
    );

    const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC LIMIT 1');
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0];
  },

  findBySlug: async (slug) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
      [slug]
    );
    return rows[0];
  },

  search: async (options = {}) => {
    const {
      category_id,
      search,
      limit = 20,
      offset = 0,
    } = options;

    let query = `SELECT p.*, c.name as category_name
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE 1=1`;
    const params = [];
    let i = 1;

    if (category_id) {
      query += ` AND p.category_id = $${i++}`;
      params.push(category_id);
    }

    if (search) {
      query += ` AND (p.name LIKE $${i} OR p.description LIKE $${i + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      i += 2;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  count: async (categoryId = null) => {
    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];

    if (categoryId) {
      query += ' AND category_id = $1';
      params.push(categoryId);
    }

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].count);
  },

  update: async (id, data) => {
    const fields = [];
    const params = [];
    let i = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(data[key]);
      }
    });

    if (fields.length === 0) return await Product.findById(id);

    params.push(id);
    await pool.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i}`,
      params
    );
    return await Product.findById(id);
  },

  incrementViews: async (id) => {
    await pool.query('UPDATE products SET views = views + 1 WHERE id = $1', [id]);
  },

  incrementDownloads: async (id) => {
    await pool.query('UPDATE products SET downloads = downloads + 1 WHERE id = $1', [id]);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return { id };
  },
};
