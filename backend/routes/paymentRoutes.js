import express from 'express';
import { submitTransaction, getPaymentStatus, getQrCodeFallback } from '../controllers/paymentController.js';
import { getMyOrders, getOrderDetail } from '../controllers/adminPaymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all payment proof routes

router.post('/submit-txn', submitTransaction);
router.get('/status/:sessionToken', getPaymentStatus);
router.get('/qr/:sessionToken', getQrCodeFallback);
router.get('/my-orders', getMyOrders);
router.get('/order/:orderNumber', getOrderDetail);

export default router;
