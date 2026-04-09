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
        message: 'Failed to get categories',
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
          message: 'Category not found',
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
        message: 'Failed to get category',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, slug, description, icon_url, thumbnail_url } = req.body;

      const category = await Category.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon_url,
        thumbnail_url,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const category = await Category.update(id, data);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await Category.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
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
        message: 'Failed to get sub categories',
      });
    }
  },

  create: async (req, res) => {
    try {
      const { category_id, name, slug, description } = req.body;

      const subCategory = await SubCategory.create({
        category_id,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Sub category created successfully',
        data: subCategory,
      });
    } catch (error) {
      console.error('Create sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sub category',
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
        message: 'Sub category updated successfully',
        data: subCategory,
      });
    } catch (error) {
      console.error('Update sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update sub category',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await SubCategory.delete(id);

      res.json({
        success: true,
        message: 'Sub category deleted successfully',
      });
    } catch (error) {
      console.error('Delete sub category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete sub category',
      });
    }
  },
};
