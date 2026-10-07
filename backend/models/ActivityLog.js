import mongoose from 'mongoose';

const activitylogSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activitylogSchema);

const exportedObj = {
  findOne: async (query) => await ActivityLog.findOne(query),
  find: async (query) => await ActivityLog.find(query),
  create: async (data) => await ActivityLog.create(data),
  model: ActivityLog
};

export const getActivityLogModel = () => exportedObj;

export default exportedObj;
