import pool from '../config/database.js';
import { getInsertId } from '../utils/db.js';

export const Product = {
  create: async (data) => {
    const {
      category_id,
      sub_category_id = null,
      name,
      slug,
      description,
      price,
      discount_percent = 0,
      file_url,
      file_size = null,
      thumbnail_url,
      created_by,
    } = data;

    const discount_price =
      discount_percent && discount_percent > 0
        ? price * (1 - discount_percent / 100)
        : price;

    const is_featured = data.is_featured ? 1 : 0;

    const { rows: insertMeta } = await pool.query(
      `INSERT INTO products (
        category_id, sub_category_id, name, slug, description, price,
        discount_percent, discount_price, file_url, file_size, thumbnail_url, is_featured, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        sub_category_id,
        name,
        slug,
        description,
        price,
        discount_percent,
        discount_price,
        file_url ?? null,
        file_size ?? null,
        thumbnail_url ?? null,
        is_featured,
        created_by,
      ]
    );

    const insertId = getInsertId(insertMeta);
    let id = insertId;
    if (!id) {
      const { rows: last } = await pool.query(
        'SELECT id FROM products WHERE created_by = ? ORDER BY id DESC LIMIT 1',
        [created_by]
      );
      id = last[0]?.id ?? null;
    }
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  findBySlug: async (slug) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? OR p.id = ?
       LIMIT 1`,
      [slug, /^\d+$/.test(String(slug)) ? parseInt(slug, 10) : -1]
    );
    return rows[0];
  },

  search: async (options = {}) => {
    const {
      category_id,
      search,
      limit = 20,
      offset = 0,
      featured,
      only_active,
    } = options;

    let query = `SELECT p.*, c.name as category_name
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (only_active === true) {
      query += ' AND p.is_active = 1';
    }

    if (featured) {
      query += ' AND p.is_featured = 1';
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  count: async (categoryId = null) => {
    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0]?.count ?? 0, 10);
  },

  update: async (id, data) => {
    const allowed = [
      'category_id',
      'sub_category_id',
      'name',
      'slug',
      'description',
      'price',
      'discount_percent',
      'discount_price',
      'file_url',
      'file_size',
      'thumbnail_url',
      'share_link',
      'is_active',
      'is_featured',
    ];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return await Product.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    return await Product.findById(id);
  },

  incrementViews: async (id) => {
    await pool.query('UPDATE products SET views = views + 1 WHERE id = ?', [id]);
  },

  incrementDownloads: async (id) => {
    await pool.query('UPDATE products SET downloads = downloads + 1 WHERE id = ?', [id]);
  },

  delete: async (id) => {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return { id };
  },
};
