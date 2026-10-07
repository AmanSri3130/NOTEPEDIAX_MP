import mongoose from 'mongoose';

const toolquotaSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const ToolQuota = mongoose.models.ToolQuota || mongoose.model('ToolQuota', toolquotaSchema);

const exportedObj = {
  findOne: async (query) => await ToolQuota.findOne(query),
  find: async (query) => await ToolQuota.find(query),
  create: async (data) => await ToolQuota.create(data),
  model: ToolQuota
};

export const getToolQuotaModel = () => exportedObj;

export default exportedObj;
