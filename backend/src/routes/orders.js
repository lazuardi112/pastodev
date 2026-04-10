import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { ordersController } from '../controllers/ordersController.js';

const router = express.Router();

router.post('/', authMiddleware, ordersController.create);
router.get('/user', authMiddleware, ordersController.listMine);

export default router;
