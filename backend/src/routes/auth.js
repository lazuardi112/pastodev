import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';
import { authController } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../validators/index.js';

const router = express.Router();

// Register
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);

// Login
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  authController.login
);

// Google Login
router.post(
  '/login-google',
  authController.loginWithGoogle
);

// Get Profile
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

// Update Profile
router.put(
  '/profile',
  authMiddleware,
  authController.updateProfile
);

// Get Balance
router.get(
  '/balance',
  authMiddleware,
  authController.getBalance
);

// Get Balance History
router.get(
  '/balance-history',
  authMiddleware,
  authController.getBalanceHistory
);

export default router;
