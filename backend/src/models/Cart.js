import pool from '../config/database.js';

export const Cart = {
  addItem: async (userId, productId, quantity = 1) => {
    try {
      // Check if item exists
      const [existing] = await pool.execute(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existing.length > 0) {
        // Update quantity
        await pool.execute(
          'UPDATE cart SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
          [quantity, userId, productId]
        );
      } else {
        // Insert new item
        await pool.execute(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
      }

      // Return updated/inserted item
      const [result] = await pool.execute(
        'SELECT id, user_id, product_id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return result[0];
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  getItems: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT c.id, c.user_id, c.product_id, c.quantity, p.name,
              COALESCE(p.discount_price, p.price) as price,
              p.price as original_price,
              p.discount_percent,
              p.thumbnail_url
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.is_active = true
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows;
  },

  updateQuantity: async (cartId, quantity) => {
    if (quantity <= 0) {
      return await this.removeItem(cartId);
    }
    await pool.execute(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, cartId]
    );
    const [rows] = await pool.execute('SELECT * FROM cart WHERE id = ?', [cartId]);
    return rows[0];
  },

  removeItem: async (cartId) => {
    await pool.execute('DELETE FROM cart WHERE id = ?', [cartId]);
    return { id: cartId };
  },

  clearCart: async (userId) => {
    const [result] = await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    return result.affectedRows;
  },

  getItemCount: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
      [userId]
    );
    return parseInt(rows[0].count);
  },
};

export const Review = {
  create: async (data) => {
    const { product_id, user_id, rating, comment } = data;
    
    // Check if review exists
    const [existing] = await pool.execute(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, user_id]
    );

    if (existing.length > 0) {
      // Update existing review
      await pool.execute(
        'UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND user_id = ?',
        [rating, comment, product_id, user_id]
      );
      const [rows] = await pool.execute(
        'SELECT * FROM reviews WHERE product_id = ? AND user_id = ?',
        [product_id, user_id]
      );
      return rows[0];
    } else {
      // Insert new review
      const [result] = await pool.execute(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, user_id, rating, comment]
      );
      const insertId = result.insertId;
      const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [insertId]);
      return rows[0];
    }
  },

  getByProductId: async (productId) => {
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as user_name, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );
    return rows;
  },

  getByUserIdAndProductId: async (userId, productId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0];
  },

  getStats: async (productId) => {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE product_id = ?`,
      [productId]
    );
    return rows[0];
  },
};
