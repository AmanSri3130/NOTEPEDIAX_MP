import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

const exportedObj = {
  findOne: async (query) => await Cart.findOne(query),
  find: async (query) => await Cart.find(query),
  create: async (data) => await Cart.create(data),
  model: Cart
};

export const getCartModel = () => exportedObj;

export default exportedObj;
