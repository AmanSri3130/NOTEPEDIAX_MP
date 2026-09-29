import express from 'express';
import { getPendingPayments, getPaymentsStats, verifyAdminPayment, createCouponAdmin, getCouponsAdmin } from '../controllers/adminPaymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all admin payment routes

router.get('/', getPendingPayments);
router.get('/stats', getPaymentsStats);
router.post('/:orderId/verify', verifyAdminPayment);
router.post('/coupons', createCouponAdmin);
router.get('/coupons', getCouponsAdmin);

export default router;
