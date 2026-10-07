import mongoose from 'mongoose';

const lessonprogressSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const LessonProgress = mongoose.models.LessonProgress || mongoose.model('LessonProgress', lessonprogressSchema);

const exportedObj = {
  findOne: async (query) => await LessonProgress.findOne(query),
  find: async (query) => await LessonProgress.find(query),
  create: async (data) => await LessonProgress.create(data),
  model: LessonProgress
};

export const getLessonProgressModel = () => exportedObj;

export default exportedObj;
