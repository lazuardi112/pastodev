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

    // Calculate discount price
    const discount_price =
      discount_percent && discount_percent > 0
        ? price * (1 - discount_percent / 100)
        : price;

    const [insertResult] = await pool.execute(
      `INSERT INTO products (
        category_id, name, slug, description, price, 
        discount_percent, discount_price, file_url, file_size, 
        thumbnail_url, created_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        slug,
        description,
        price,
        discount_percent,
        discount_price,
        file_url,
        file_size,
        thumbnail_url,
        created_by,
      ]
    );
    const insertId = insertResult.insertId;
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [insertId]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  findBySlug: async (slug) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
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

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  getAll: async (limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  },

  getByCategoryId: async (categoryId, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );
    return rows;
  },

  getTopDownloaded: async (limit = 10) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.downloads DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  getTopViewed: async (limit = 10) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.views DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  update: async (id, data) => {
    const {
      name,
      slug,
      description,
      price,
      discount_percent,
      file_url,
      file_size,
      thumbnail_url,
    } = data;

    let updateQuery = `UPDATE products SET`;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push(`name = ?`);
      values.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = ?`);
      values.push(slug);
    }
    if (description !== undefined) {
      updates.push(`description = ?`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = ?`);
      values.push(price);
    }
    if (discount_percent !== undefined) {
      updates.push(`discount_percent = ?`);
      values.push(discount_percent);

      // Calculate and set discount_price
      const discountPrice =
        discount_percent > 0
          ? (price || 'price') * (1 - discount_percent / 100)
          : price || 'price';
      updates.push(`discount_price = ?`);
      values.push(discountPrice);
    }
    if (file_url !== undefined) {
      updates.push(`file_url = ?`);
      values.push(file_url);
    }
    if (file_size !== undefined) {
      updates.push(`file_size = ?`);
      values.push(file_size);
    }
    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = ?`);
      values.push(thumbnail_url);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    updateQuery += ` ${updates.join(', ')} WHERE id = ?`;

    await pool.execute(updateQuery, values);
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  incrementViews: async (id) => {
    await pool.execute('UPDATE products SET views = views + 1 WHERE id = ?', [
      id,
    ]);
  },

  incrementDownloads: async (id) => {
    await pool.execute(
      'UPDATE products SET downloads = downloads + 1 WHERE id = ?',
      [id]
    );
  },

  delete: async (id) => {
    await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return { id };
  },

  count: async (categoryId = null) => {
    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }

    const [rows] = await pool.execute(query, params);
    return parseInt(rows[0].count);
  },

  getTotalRevenue: async () => {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(final_amount), 0) as total
       FROM transactions
       WHERE status = 'settlement'`
    );
    return parseFloat(rows[0].total || 0);
  },

  getTopProducts: async (limit = 10) => {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name,
              COUNT(DISTINCT ti.id) as total_sold
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN transaction_items ti ON p.id = ti.product_id
       LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.status = 'settlement'
       GROUP BY p.id, c.id
       ORDER BY total_sold DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },
};
