import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemType: { type: String, enum: ['course', 'note'], required: true },
  title: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  mrp: { type: Number, min: 0, required: true },
}, { _id: false });

const appliedCouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discountType: { type: String, enum: ['percent', 'flat'], required: true },
  discountValue: { type: Number, min: 0, required: true },
  minOrderValue: { type: Number, min: 0, default: 0 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: [cartItemSchema], default: [] },
  coupon: { type: appliedCouponSchema, default: null },
}, { timestamps: true, strict: false });

cartSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } },
);

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

const exportedObj = {
  findOne: async (query) => await Cart.findOne(query),
  find: async (query) => await Cart.find(query),
  create: async (data) => await Cart.create(data),
  model: Cart
};

export const getCartModel = () => exportedObj;

export default exportedObj;
