import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { midtransController } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', authMiddleware, midtransController.topup);

export default router;
