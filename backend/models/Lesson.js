import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

const exportedObj = {
  findOne: async (query) => await Lesson.findOne(query),
  find: async (query) => await Lesson.find(query),
  create: async (data) => await Lesson.create(data),
  model: Lesson
};

export const getLessonModel = () => exportedObj;

export default exportedObj;
