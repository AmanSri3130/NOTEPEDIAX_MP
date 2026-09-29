import express from 'express';
import { initiateCheckout, getSessionDetails } from '../controllers/checkoutController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all checkout routes

router.post('/initiate', initiateCheckout);
router.get('/session/:sessionToken', getSessionDetails);

export default router;
