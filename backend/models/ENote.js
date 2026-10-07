import mongoose from 'mongoose';

const enoteSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const ENote = mongoose.models.ENote || mongoose.model('ENote', enoteSchema);

const exportedObj = {
  findOne: async (query) => await ENote.findOne(query),
  find: async (query) => await ENote.find(query),
  create: async (data) => await ENote.create(data),
  model: ENote
};

export const getENoteModel = () => exportedObj;

export default exportedObj;
