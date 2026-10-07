import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const exportedObj = {
  findOne: async (query) => await Order.findOne(query),
  find: async (query) => await Order.find(query),
  create: async (data) => await Order.create(data),
  model: Order
};

export const getOrderModel = () => exportedObj;

export default exportedObj;
