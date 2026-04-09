import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
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
  validateCustomOrder,
  handleValidationErrors,
  customOrderController.create
);

// Get my custom orders
router.get('/my-orders', authMiddleware, customOrderController.getMyOrders);

// Get order detail
router.get('/:orderId', authMiddleware, customOrderController.getDetail);

// Update order status (admin only)
router.put(
  '/:orderId/status',
  authMiddleware,
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
