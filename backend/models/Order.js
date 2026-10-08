import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  itemType: { type: String, enum: ['course', 'note'], required: true },
  title: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  mrp: { type: Number, min: 0, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  order_id: String,
  sessionToken: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'failed'],
    default: 'pending',
  },
  items: { type: [orderItemSchema], required: true },
  amount: { type: Number, min: 0, required: true },
  breakdown: {
    subtotal: { type: Number, min: 0, required: true },
    discount: { type: Number, min: 0, required: true },
    gst: { type: Number, min: 0, required: true },
    total: { type: Number, min: 0, required: true },
  },
  coupon: { type: mongoose.Schema.Types.Mixed, default: null },
  upiTxnId: String,
  upiApp: String,
  expiresAt: { type: Date, required: true },
  verifiedAt: Date,
  rejectionReason: String,
}, { timestamps: true, strict: false });

orderSchema.index(
  { sessionToken: 1 },
  { unique: true, partialFilterExpression: { sessionToken: { $type: 'string' } } },
);
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const exportedObj = {
  findOne: async (query) => await Order.findOne(query),
  find: async (query) => await Order.find(query),
  create: async (data) => await Order.create(data),
  model: Order
};

export const getOrderModel = () => exportedObj;

export default exportedObj;
