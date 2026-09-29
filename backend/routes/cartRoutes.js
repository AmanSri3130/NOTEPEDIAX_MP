import express from 'express';
import { getCart, addToCart, removeFromCart, applyCoupon, removeCoupon, clearCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:itemId', removeFromCart);
router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);
router.delete('/clear', clearCart);

export default router;
