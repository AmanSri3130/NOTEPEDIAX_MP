import { randomBytes, randomInt } from 'node:crypto';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { calculateCart } from './cartController.js';

const getUserId = (req) => String(req.user?._id || req.user?.id || '');

const buildCheckoutResponse = (order) => {
  const amount = order.breakdown.total;
  const payee = process.env.PAYMENT_UPI_VPA?.trim();
  if (!payee) throw new Error('UPI payment destination is not configured');
  const paymentUri = new URL('upi://pay');
  paymentUri.search = new URLSearchParams({
    pa: payee,
    pn: 'Notepediax',
    am: amount.toFixed(2),
    cu: 'INR',
    tn: order.orderNumber,
  }).toString();

  return {
    orderNumber: order.orderNumber,
    sessionToken: order.sessionToken,
    amount,
    expiresAt: order.expiresAt,
    deepLinks: Object.fromEntries(
      ['gpay', 'phonepe', 'paytm', 'bhim', 'navi'].map((app) => [app, paymentUri.toString()]),
    ),
    isMobile: /android|iphone|ipad|ipod/i.test(String(order.device || '')),
    upiVpa: payee,
    items: order.items,
    breakdown: order.breakdown,
  };
};

export const initiateCheckout = async (req, res) => {
  const userId = getUserId(req);
  if (!process.env.PAYMENT_UPI_VPA?.trim()) {
    return res.status(503).json({ success: false, message: 'Checkout is unavailable until the business UPI destination is configured' });
  }

  try {
    const cart = await Cart.model.findOne({ userId }).lean();
    const totals = calculateCart(cart);
    if (totals.itemCount === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const now = new Date();
    const breakdown = {
      subtotal: totals.subtotal,
      discount: totals.discount,
      gst: totals.gst,
      total: totals.total,
    };
    const orderNumber = `ORD-${Date.now()}-${randomInt(10000, 100000)}`;
    const order = await Order.model.create({
      userId,
      orderNumber,
      order_id: orderNumber,
      sessionToken: randomBytes(24).toString('hex'),
      status: 'pending',
      items: totals.cart.items,
      coupon: totals.cart.coupon,
      amount: breakdown.total,
      breakdown,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      device: req.get('user-agent') || '',
    });

    return res.status(201).json({ success: true, data: buildCheckoutResponse(order) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionDetails = async (req, res) => {
  if (!process.env.PAYMENT_UPI_VPA?.trim()) {
    return res.status(503).json({ success: false, message: 'UPI payment destination is not configured' });
  }
  try {
    const order = await Order.model.findOne({
      sessionToken: req.params.sessionToken,
      userId: getUserId(req),
    }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Checkout session not found' });
    return res.json({ success: true, data: buildCheckoutResponse(order) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { buildCheckoutResponse };
