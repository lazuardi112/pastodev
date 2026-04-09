import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { productController } from '../controllers/productController.js';
import {
  validateProduct,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Get all products
router.get('/', productController.getAll);

// Get product by ID
router.get('/:id', productController.getById);

// Admin - Create product
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  validateProduct,
  handleValidationErrors,
  productController.create
);

// Admin - Update product
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  productController.update
);

// Admin - Delete product
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  productController.delete
);

// Get reviews
router.get('/:productId/reviews', productController.getReviews);

// Add review
router.post(
  '/:productId/reviews',
  authMiddleware,
  productController.addReview
);

export default router;
