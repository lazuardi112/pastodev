import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { checkoutController } from '../controllers/checkoutController.js';

const router = express.Router();

router.get('/', authMiddleware, checkoutController.getTransactions);
router.get('/:transactionId', authMiddleware, checkoutController.getTransactionDetail);

export default router;
