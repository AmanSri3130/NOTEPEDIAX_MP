import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';
import ENote from '../models/ENote.js';

const getUserId = (req) => String(req.user?._id || req.user?.id || '');

const calculateCart = (cart) => {
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const coupon = cart?.coupon || null;
  let discount = 0;

  if (coupon && subtotal >= coupon.minOrderValue) {
    discount = coupon.discountType === 'percent'
      ? subtotal * coupon.discountValue / 100
      : coupon.discountValue;
    discount = Math.min(subtotal, discount);
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const gst = taxableAmount * 0.18;

  return {
    cart: { items, coupon: discount > 0 ? coupon : null },
    itemCount: items.length,
    subtotal,
    discount,
    gst,
    total: taxableAmount + gst,
  };
};

const getCartForUser = async (userId) => Cart.model.findOne({ userId });

const resolveItem = async (itemId, itemType) => {
  if (!['course', 'note'].includes(itemType)) {
    return { error: 'Item type must be course or note', status: 400 };
  }
  if (!mongoose.isValidObjectId(itemId)) {
    return { error: 'Invalid item ID', status: 400 };
  }

  const model = itemType === 'course' ? Course.model : ENote.model;
  const product = await model.findById(itemId).lean();
  if (!product) return { error: `${itemType === 'course' ? 'Course' : 'Note'} not found`, status: 404 };

  const price = Number(product.price);
  const mrp = Number(product.mrp ?? product.price);
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(mrp) || mrp < price) {
    return { error: 'Item pricing is not configured correctly', status: 422 };
  }

  return {
    item: {
      itemId: String(product._id),
      itemType,
      title: product.title,
      price,
      mrp,
    },
  };
};

export const getCart = async (req, res) => {
  try {
    const cart = await getCartForUser(getUserId(req));
    return res.json({ success: true, data: calculateCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  const userId = getUserId(req);
  const { itemType, itemId } = req.body;

  try {
    const resolved = await resolveItem(itemId, itemType);
    if (resolved.error) {
      return res.status(resolved.status).json({ success: false, message: resolved.error });
    }

    let cart = await getCartForUser(userId);
    if (!cart) cart = await Cart.model.create({ userId, items: [] });

    if (!cart.items.some((item) => item.itemId === resolved.item.itemId)) {
      cart.items.push(resolved.item);
      await cart.save();
    }

    return res.json({ success: true, data: calculateCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const cart = await getCartForUser(getUserId(req));
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.itemId !== req.params.itemId);
    await cart.save();
    return res.json({ success: true, data: calculateCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.model.deleteOne({ userId: getUserId(req) });
    return res.json({ success: true, data: calculateCart(null), message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

  try {
    const cart = await getCartForUser(getUserId(req));
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Add items to your cart before applying a coupon' });
    }

    const coupon = await Coupon.model.findOne({ code }).lean();
    if (!coupon || (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date())) {
      return res.status(400).json({ success: false, message: 'Coupon is invalid or expired' });
    }
    if (!['percent', 'flat'].includes(coupon.discountType)
      || !Number.isFinite(Number(coupon.discountValue))
      || Number(coupon.discountValue) <= 0) {
      return res.status(422).json({ success: false, message: 'Coupon configuration is invalid' });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
    const minOrderValue = Number(coupon.minOrderValue || 0);
    if (subtotal < minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${minOrderValue}`,
      });
    }

    cart.coupon = {
      code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderValue,
    };
    await cart.save();
    return res.json({ success: true, data: calculateCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const cart = await getCartForUser(getUserId(req));
    if (!cart) return res.json({ success: true, data: calculateCart(null) });

    cart.coupon = null;
    await cart.save();
    return res.json({ success: true, data: calculateCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { calculateCart };
