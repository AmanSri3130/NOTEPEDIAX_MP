import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import Enrollment from '../models/Enrollment.js';
import Order from '../models/Order.js';

const getUserId = (req) => String(req.user?._id || req.user?.id || '');

const findOrder = (orderId) => {
  const clauses = [{ orderNumber: orderId }, { order_id: orderId }];
  if (mongoose.isValidObjectId(orderId)) clauses.push({ _id: orderId });
  return Order.model.findOne({ $or: clauses });
};

export const getPaymentStats = async (req, res) => {
  try {
    const [totalOrders, verifiedOrders] = await Promise.all([
      Order.model.countDocuments(),
      Order.model.find({ status: 'verified' }).select('amount').lean(),
    ]);
    return res.json({
      success: true,
      data: {
        totalOrders,
        paidOrders: verifiedOrders.length,
        totalRevenue: verifiedOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsStats = getPaymentStats;

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Order.model.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const pending = await Order.model.find({ status: 'submitted' }).sort({ submittedAt: 1 }).lean();
    return res.json({ success: true, data: pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAdminPayment = async (req, res) => {
  try {
    const order = await findOrder(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'submitted') {
      return res.status(409).json({ success: false, message: `Only submitted payments can be verified (current status: ${order.status})` });
    }

    const courseItems = order.items.filter((item) => item.itemType === 'course');
    if (courseItems.some((item) => !mongoose.isValidObjectId(item.itemId))) {
      return res.status(422).json({ success: false, message: 'Order contains an invalid course reference' });
    }
    if (courseItems.length > 0) {
      await Enrollment.model.bulkWrite(courseItems.map((item) => {
        const userId = new mongoose.Types.ObjectId(order.userId);
        const courseId = new mongoose.Types.ObjectId(item.itemId);
        return {
          updateOne: {
            filter: { userId, courseId },
            update: { $set: { status: 'active' }, $setOnInsert: { userId, courseId } },
            upsert: true,
          },
        };
      }));
    }

    order.status = 'verified';
    order.verifiedAt = new Date();
    await order.save();
    req.app.get('io')?.emit(`payment_verified_${order.userId}`, { orderNumber: order.orderNumber });
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePayment = async (req, res) => verifyAdminPayment(req, res);

export const rejectPayment = async (req, res) => {
  try {
    const order = await findOrder(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'submitted') {
      return res.status(409).json({ success: false, message: `Only submitted payments can be rejected (current status: ${order.status})` });
    }

    order.status = 'failed';
    order.rejectionReason = String(req.body?.reason || 'Payment reference could not be verified').slice(0, 500);
    await order.save();
    req.app.get('io')?.emit(`payment_rejected_${order.userId}`, { reason: order.rejectionReason });
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.model.find({ userId: getUserId(req) }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.model.findOne({
      orderNumber: req.params.orderNumber,
      userId: getUserId(req),
    }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCouponAdmin = async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const { discountType, discountValue, minOrderValue = 0, expiresAt } = req.body;
  const value = Number(discountValue);
  const minimum = Number(minOrderValue);

  if (!code || !['percent', 'flat'].includes(discountType)
    || !Number.isFinite(value) || value <= 0
    || (discountType === 'percent' && value > 100)
    || !Number.isFinite(minimum) || minimum < 0
    || (expiresAt && Number.isNaN(new Date(expiresAt).getTime()))) {
    return res.status(400).json({ success: false, message: 'Invalid coupon configuration' });
  }

  try {
    if (await Coupon.model.exists({ code })) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    const coupon = await Coupon.model.create({
      code,
      discountType,
      discountValue: value,
      minOrderValue: minimum,
      ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
    });
    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCouponsAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.model.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
