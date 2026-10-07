import mongoose from 'mongoose';

const notechunkSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const NoteChunk = mongoose.models.NoteChunk || mongoose.model('NoteChunk', notechunkSchema);

const exportedObj = {
  findOne: async (query) => await NoteChunk.findOne(query),
  find: async (query) => await NoteChunk.find(query),
  create: async (data) => await NoteChunk.create(data),
  model: NoteChunk
};

export const getNoteChunkModel = () => exportedObj;

export default exportedObj;
