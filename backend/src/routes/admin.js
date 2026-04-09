import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import { adminController, voucherController, customOrderController } from '../controllers/adminController.js';
import { settingsController, notificationController } from '../controllers/settingsController.js';
import { midtransController } from '../controllers/paymentController.js';
import { upload } from '../middlewares/upload.js';
import {
  validateVoucher,
  validateCustomOrder,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Admin Dashboard
router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboardStats);

// Admin Transactions
router.get('/transactions', authMiddleware, adminMiddleware, adminController.getTransactions);
router.put('/transactions/:transactionId/status', authMiddleware, adminMiddleware, adminController.updateTransactionStatus);

// Admin User Management
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.get('/users/:userId', authMiddleware, adminMiddleware, adminController.getUserDetail);
router.put('/users/:userId/block', authMiddleware, adminMiddleware, adminController.toggleBlockUser);
router.post('/users/:userId/balance/add', authMiddleware, adminMiddleware, adminController.addUserBalance);
router.post('/users/:userId/balance/subtract', authMiddleware, adminMiddleware, adminController.subtractUserBalance);

// Vouchers
router.post(
  '/vouchers',
  authMiddleware,
  adminMiddleware,
  validateVoucher,
  handleValidationErrors,
  voucherController.create
);
router.get('/vouchers', authMiddleware, adminMiddleware, voucherController.getAll);
router.put('/vouchers/:id', authMiddleware, adminMiddleware, voucherController.update);
router.delete('/vouchers/:id', authMiddleware, adminMiddleware, voucherController.delete);

// Custom Orders (Admin)
router.get('/custom-orders', authMiddleware, adminMiddleware, customOrderController.getAll);
router.get('/custom-orders/:orderId', authMiddleware, customOrderController.getDetail);
router.put('/custom-orders/:orderId/status', authMiddleware, adminMiddleware, customOrderController.updateStatus);
router.post('/custom-orders/:orderId/payment-link', authMiddleware, adminMiddleware, customOrderController.generatePaymentLink);
router.post('/custom-orders/:orderId/messages', authMiddleware, upload.single('file'), customOrderController.addMessage);

// Settings
router.get('/settings', authMiddleware, adminMiddleware, settingsController.getAllSettings);
router.get('/settings/:key', authMiddleware, adminMiddleware, settingsController.getSetting);
router.put('/settings/:key', authMiddleware, adminMiddleware, settingsController.updateSetting);
router.put('/settings/bulk/update', authMiddleware, adminMiddleware, settingsController.updateMultipleSettings);

// Notifications
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.get('/notifications/unread/count', authMiddleware, notificationController.getUnreadCount);
router.put('/notifications/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/read/all', authMiddleware, notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, notificationController.deleteNotification);
router.delete('/notifications/delete/all', authMiddleware, notificationController.deleteAllNotifications);

// Midtrans Payment
router.post('/midtrans/callback', midtransController.callback);
router.post('/topup', authMiddleware, midtransController.topup);

export default router;
