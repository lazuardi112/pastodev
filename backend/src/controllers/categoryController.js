import { Category, SubCategory } from '../models/Category.js';

export const categoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await Category.getAllWithSubCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori',
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail kategori',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, slug, description, icon_url, thumbnail_url } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori wajib diisi',
        });
      }

      const category = await Category.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        description: description || '',
        icon_url: icon_url || '',
        thumbnail_url: thumbnail_url || '',
      });

      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat kategori',
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await Category.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
        });
      }

      const category = await Category.update(id, data);

      res.json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        data: category,
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui kategori',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await Category.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
        });
      }

      await Category.delete(id);

      res.json({
        success: true,
        message: 'Kategori berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus kategori',
      });
    }
  },
};

export const subCategoryController = {
  getByCategoryId: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const subCategories = await SubCategory.getByCategoryId(categoryId);

      res.json({
        success: true,
        data: subCategories,
      });
    } catch (error) {
      console.error('Get sub categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data sub-kategori',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { category_id, name, slug, description } = req.body;

      if (!category_id || !name) {
        return res.status(400).json({
          success: false,
          message: 'Kategori ID dan nama wajib diisi',
        });
      }

      const subCategory = await SubCategory.create({
        category_id: parseInt(category_id),
        name,
        slug: slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        description: description || '',
      });

      res.status(201).json({
        success: true,
        message: 'Sub-kategori berhasil dibuat',
        data: subCategory,
      });
    } catch (error) {
      console.error('Create sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat sub-kategori',
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const subCategory = await SubCategory.update(id, data);

      res.json({
        success: true,
        message: 'Sub-kategori berhasil diperbarui',
        data: subCategory,
      });
    } catch (error) {
      console.error('Update sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui sub-kategori',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await SubCategory.delete(id);

      res.json({
        success: true,
        message: 'Sub-kategori berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus sub-kategori',
      });
    }
  },
};
