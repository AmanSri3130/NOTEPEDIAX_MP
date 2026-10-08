import QRCode from 'qrcode';
import Order from '../models/Order.js';
import { buildCheckoutResponse } from './checkoutController.js';

const getUserId = (req) => String(req.user?._id || req.user?.id || '');
const availableApps = new Set(['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Navi']);
const transactionIdPattern = /^[A-Za-z0-9]{12,15}$/;

export const submitTransaction = async (req, res) => {
  const { sessionToken, upiTxnId, upiApp } = req.body;
  if (!sessionToken || !transactionIdPattern.test(String(upiTxnId || '')) || !availableApps.has(upiApp)) {
    return res.status(400).json({ success: false, message: 'A valid session, transaction ID, and UPI app are required' });
  }

  try {
    const order = await Order.model.findOne({
      sessionToken,
      userId: getUserId(req),
    });
    if (!order) return res.status(404).json({ success: false, message: 'Checkout session not found' });
    if (order.status !== 'pending') {
      return res.status(409).json({ success: false, message: `Payment cannot be submitted while order is ${order.status}` });
    }
    if (order.expiresAt <= new Date()) {
      return res.status(410).json({ success: false, message: 'Checkout session has expired' });
    }

    const duplicateTransaction = await Order.model.exists({
      upiTxnId: String(upiTxnId),
      _id: { $ne: order._id },
    });
    if (duplicateTransaction) {
      return res.status(409).json({ success: false, message: 'This transaction ID has already been submitted' });
    }

    order.upiTxnId = String(upiTxnId);
    order.upiApp = upiApp;
    order.status = 'submitted';
    order.submittedAt = new Date();
    await order.save();
    return res.json({ success: true, status: order.status, message: 'Transaction submitted for manual verification' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.model.findOne({
      sessionToken: req.params.sessionToken,
      userId: getUserId(req),
    }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Checkout session not found' });

    const status = order.status === 'pending' && order.expiresAt <= new Date()
      ? 'expired'
      : order.status;
    return res.json({
      success: true,
      status,
      rejectionReason: order.rejectionReason || '',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQrCodeFallback = async (req, res) => {
  try {
    const order = await Order.model.findOne({
      sessionToken: req.params.sessionToken,
      userId: getUserId(req),
    }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Checkout session not found' });
    if (order.status !== 'pending' || order.expiresAt <= new Date()) {
      return res.status(410).json({ success: false, message: 'Checkout session is no longer payable' });
    }

    const checkout = buildCheckoutResponse(order);
    const qrCode = await QRCode.toDataURL(checkout.deepLinks.gpay);
    return res.json({ success: true, qrCode });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
