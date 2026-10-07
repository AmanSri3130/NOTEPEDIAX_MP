import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

const exportedObj = {
  findOne: async (query) => await Notification.findOne(query),
  find: async (query) => await Notification.find(query),
  create: async (data) => await Notification.create(data),
  model: Notification
};

export const getNotificationModel = () => exportedObj;

export default exportedObj;
