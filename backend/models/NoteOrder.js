import mongoose from 'mongoose';

const noteorderSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const NoteOrder = mongoose.models.NoteOrder || mongoose.model('NoteOrder', noteorderSchema);

const exportedObj = {
  findOne: async (query) => await NoteOrder.findOne(query),
  find: async (query) => await NoteOrder.find(query),
  create: async (data) => await NoteOrder.create(data),
  model: NoteOrder
};

export const getNoteOrderModel = () => exportedObj;

export default exportedObj;
