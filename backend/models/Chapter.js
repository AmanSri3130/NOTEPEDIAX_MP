import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);

const exportedObj = {
  findOne: async (query) => await Chapter.findOne(query),
  find: async (query) => await Chapter.find(query),
  create: async (data) => await Chapter.create(data),
  model: Chapter
};

export const getChapterModel = () => exportedObj;

export default exportedObj;
