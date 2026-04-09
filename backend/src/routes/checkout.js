import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { cartController, checkoutController } from '../controllers/checkoutController.js';
import {
  validateCheckout,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Cart
router.get('/items', authMiddleware, cartController.getItems);
router.post('/items', authMiddleware, cartController.addItem);
router.put('/items/:cartId', authMiddleware, cartController.updateQuantity);
router.delete('/items/:cartId', authMiddleware, cartController.removeItem);
router.delete('/', authMiddleware, cartController.clearCart);

// Checkout
router.post(
  '/checkout',
  authMiddleware,
  validateCheckout,
  handleValidationErrors,
  checkoutController.checkout
);

// Transactions
router.get('/transactions', authMiddleware, checkoutController.getTransactions);
router.get('/transactions/:transactionId', authMiddleware, checkoutController.getTransactionDetail);

// Download product
router.get('/download/:productId', authMiddleware, checkoutController.downloadProduct);

export default router;
