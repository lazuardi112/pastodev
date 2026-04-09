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
        message: 'Failed to get products',
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
          message: 'Product not found',
        });
      }

      // Increment views
      await Product.incrementViews(id);

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
        message: 'Failed to get product',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { category_id, sub_category_id, name, description, price } = req.body;
      const files = req.files || {};

      let file_url = null;
      let thumbnail_url = null;

      // Upload product file
      if (files.file) {
        file_url = `/uploads/${files.file[0].filename}`;
      }

      // Upload thumbnail
      if (files.thumbnail) {
        thumbnail_url = `/uploads/${files.thumbnail[0].filename}`;
      }

      const product = await Product.create({
        category_id: parseInt(category_id),
        sub_category_id: sub_category_id ? parseInt(sub_category_id) : null,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        file_url,
        thumbnail_url,
        created_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, is_active } = req.body;
      const files = req.files || {};

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      let file_url = product.file_url;
      let thumbnail_url = product.thumbnail_url;

      // Handle file updates
      if (files.file) {
        const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', product.file_url?.split('/').pop());
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        file_url = `/uploads/${files.file[0].filename}`;
      }

      if (files.thumbnail) {
        const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', product.thumbnail_url?.split('/').pop());
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        thumbnail_url = `/uploads/${files.thumbnail[0].filename}`;
      }

      const updatedProduct = await Product.update(id, {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        file_url,
        thumbnail_url,
        is_active: is_active !== undefined ? is_active : product.is_active,
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
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
          message: 'Product not found',
        });
      }

      // Delete files
      if (product.file_url) {
        const filePath = path.join(process.env.UPLOAD_DIR || './uploads', product.file_url.split('/').pop());
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (product.thumbnail_url) {
        const thumbnailPath = path.join(process.env.UPLOAD_DIR || './uploads', product.thumbnail_url.split('/').pop());
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

      await Product.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
      });
    }
  },

  addReview: async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const review = await Review.create({
        product_id: productId,
        user_id: req.user.id,
        rating: parseInt(rating),
        comment,
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review,
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add review',
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
        message: 'Failed to get reviews',
      });
    }
  },
};
