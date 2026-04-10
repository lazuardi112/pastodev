import express from 'express';
import { landingController } from '../controllers/landingController.js';
import { contactInfoController } from '../controllers/contactInfoController.js';

const router = express.Router();

router.get('/landing', landingController.getLanding);
router.get('/contact-info', contactInfoController.listPublic);

export default router;
