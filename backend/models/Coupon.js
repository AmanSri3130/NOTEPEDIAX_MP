import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

const exportedObj = {
  findOne: async (query) => await Coupon.findOne(query),
  find: async (query) => await Coupon.find(query),
  create: async (data) => await Coupon.create(data),
  model: Coupon
};

export const getCouponModel = () => exportedObj;

export default exportedObj;
