import { Review } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export const reviewsController = {
  create: async (req, res) => {
    try {
      const productId = parseInt(req.body?.product_id, 10);
      const rating = parseInt(req.body?.rating, 10);
      const comment = req.body?.comment != null ? String(req.body.comment).trim() : '';

      if (!productId) {
        return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
      }
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating 1–5' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      const row = await Review.create({
        product_id: productId,
        user_id: req.user.id,
        rating,
        comment: comment || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Ulasan disimpan',
        data: row,
      });
    } catch (error) {
      console.error('Review create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menyimpan ulasan',
      });
    }
  },
};
