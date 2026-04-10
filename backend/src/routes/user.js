import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { authController } from '../controllers/authController.js';
import { notificationController } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/balance', authMiddleware, authController.getBalance);
router.get('/balance-history', authMiddleware, authController.getBalanceHistory);

router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.get('/notifications/unread/count', authMiddleware, notificationController.getUnreadCount);
router.put('/notifications/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/read/all', authMiddleware, notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, notificationController.deleteNotification);

export default router;
