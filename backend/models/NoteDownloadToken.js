import mongoose from 'mongoose';

const notedownloadtokenSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const NoteDownloadToken = mongoose.models.NoteDownloadToken || mongoose.model('NoteDownloadToken', notedownloadtokenSchema);

const exportedObj = {
  findOne: async (query) => await NoteDownloadToken.findOne(query),
  find: async (query) => await NoteDownloadToken.find(query),
  create: async (data) => await NoteDownloadToken.create(data),
  model: NoteDownloadToken
};

export const getNoteDownloadTokenModel = () => exportedObj;

export default exportedObj;
