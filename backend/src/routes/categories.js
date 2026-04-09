import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { categoryController, subCategoryController } from '../controllers/categoryController.js';
import {
  validateProduct,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Get all categories
router.get('/', categoryController.getAll);

// Get category by ID
router.get('/:id', categoryController.getById);

// Admin - Create category
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  categoryController.create
);

// Admin - Update category
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.update
);

// Admin - Delete category
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.delete
);

// Sub Categories
router.get(
  '/:categoryId/subcategories',
  subCategoryController.getByCategoryId
);

router.post(
  '/subcategories',
  authMiddleware,
  adminMiddleware,
  subCategoryController.create
);

router.put(
  '/subcategories/:id',
  authMiddleware,
  adminMiddleware,
  subCategoryController.update
);

router.delete(
  '/subcategories/:id',
  authMiddleware,
  adminMiddleware,
  subCategoryController.delete
);

export default router;
