import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import { customOrderController } from '../controllers/adminController.js';
import { upload } from '../middlewares/upload.js';
import {
  validateCustomOrder,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Create custom order
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  validateCustomOrder,
  handleValidationErrors,
  customOrderController.create
);

// Get my custom orders
router.get('/my-orders', authMiddleware, customOrderController.getMyOrders);

// Download hasil (ZIP) — harus sebelum /:orderId
router.get('/download/:id', authMiddleware, customOrderController.downloadResult);

// Get order detail
router.get('/:orderId', authMiddleware, customOrderController.getDetail);

// Update order status (admin only — was missing adminMiddleware)
router.put(
  '/:orderId/status',
  authMiddleware,
  adminMiddleware,
  customOrderController.updateStatus
);

// Add message
router.post(
  '/:orderId/messages',
  authMiddleware,
  upload.single('file'),
  customOrderController.addMessage
);

export default router;
