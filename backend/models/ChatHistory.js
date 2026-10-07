import mongoose from 'mongoose';

const chathistorySchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', chathistorySchema);

const exportedObj = {
  findOne: async (query) => await ChatHistory.findOne(query),
  find: async (query) => await ChatHistory.find(query),
  create: async (data) => await ChatHistory.create(data),
  model: ChatHistory
};

export const getChatHistoryModel = () => exportedObj;

export default exportedObj;
