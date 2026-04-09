import { Product } from '../models/Product.js';
import { Review } from '../models/Cart.js';
import fs from 'fs';
import path from 'path';

export const productController = {
  getAll: async (req, res) => {
    try {
      const { category_id, search, limit = 20, offset = 0 } = req.query;

      const products = await Product.search({
        category_id: category_id ? parseInt(category_id) : null,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const count = await Product.count(category_id ? parseInt(category_id) : null);

      res.json({
        success: true,
        data: products,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk',
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
        });
      }

      // Increment views (don't wait for it)
      Product.incrementViews(id).catch(err => console.error('Increment views error:', err));

      // Get reviews
      const reviews = await Review.getByProductId(id);
      const stats = await Review.getStats(id);

      res.json({
        success: true,
        data: {
          ...product,
          reviews,
          stats,
        },
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail produk',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { category_id, sub_category_id, name, description, price, discount_percent } = req.body;
      const files = req.files || {};

      if (!name || !price || !category_id) {
        return res.status(400).json({
          success: false,
          message: 'Nama, harga, dan kategori wajib diisi',
        });
      }

      let file_url = null;
      let thumbnail_url = null;

      // Upload product file
      if (files.file && files.file[0]) {
        file_url = `/uploads/${files.file[0].filename}`;
      }

      // Upload thumbnail
      if (files.thumbnail && files.thumbnail[0]) {
        thumbnail_url = `/uploads/${files.thumbnail[0].filename}`;
      }

      const product = await Product.create({
        category_id: parseInt(category_id),
        sub_category_id: sub_category_id ? parseInt(sub_category_id) : null,
        name,
        slug: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        description: description || '',
        price: parseFloat(price),
        discount_percent: discount_percent ? parseFloat(discount_percent) : 0,
        file_url,
        thumbnail_url,
        created_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Produk berhasil dibuat',
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat produk',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, discount_percent, is_active } = req.body;
      const files = req.files || {};

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
        });
      }

      let file_url = product.file_url;
      let thumbnail_url = product.thumbnail_url;

      const uploadDir = process.env.UPLOAD_DIR || './uploads';

      // Handle file updates
      if (files.file && files.file[0]) {
        if (product.file_url) {
          const oldPath = path.join(uploadDir, product.file_url.split('/').pop());
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error unlinking file:', e); }
          }
        }
        file_url = `/uploads/${files.file[0].filename}`;
      }

      if (files.thumbnail && files.thumbnail[0]) {
        if (product.thumbnail_url) {
          const oldPath = path.join(uploadDir, product.thumbnail_url.split('/').pop());
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error unlinking thumbnail:', e); }
          }
        }
        thumbnail_url = `/uploads/${files.thumbnail[0].filename}`;
      }

      const updatedProduct = await Product.update(id, {
        name: name || product.name,
        slug: name ? name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : product.slug,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        discount_percent: discount_percent !== undefined ? parseFloat(discount_percent) : product.discount_percent,
        file_url,
        thumbnail_url,
        is_active: is_active !== undefined ? (is_active === 'true' || is_active === true || is_active === 1) : product.is_active,
      });

      res.json({
        success: true,
        message: 'Produk berhasil diperbarui',
        data: updatedProduct,
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui produk',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
        });
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads';

      // Delete files
      if (product.file_url) {
        const filePath = path.join(uploadDir, product.file_url.split('/').pop());
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) { console.error('Error deleting file:', e); }
        }
      }

      if (product.thumbnail_url) {
        const thumbnailPath = path.join(uploadDir, product.thumbnail_url.split('/').pop());
        if (fs.existsSync(thumbnailPath)) {
          try { fs.unlinkSync(thumbnailPath); } catch (e) { console.error('Error deleting thumbnail:', e); }
        }
      }

      await Product.delete(id);

      res.json({
        success: true,
        message: 'Produk berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus produk',
      });
    }
  },

  addReview: async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({
          success: false,
          message: 'Rating wajib diisi',
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan',
        });
      }

      const review = await Review.create({
        product_id: productId,
        user_id: req.user.id,
        rating: parseInt(rating),
        comment: comment || '',
      });

      res.status(201).json({
        success: true,
        message: 'Review berhasil ditambahkan',
        data: review,
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan review',
      });
    }
  },

  getReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await Review.getByProductId(productId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data review',
      });
    }
  },
};
