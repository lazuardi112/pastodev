import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { reviewsController } from '../controllers/reviewsController.js';
import { validateReview, handleValidationErrors } from '../validators/index.js';

const router = express.Router();

router.post('/', authMiddleware, validateReview, handleValidationErrors, reviewsController.create);

export default router;
