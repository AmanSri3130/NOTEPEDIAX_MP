import mongoose from 'mongoose';

const courseprogressSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseprogressSchema);

const exportedObj = {
  findOne: async (query) => await CourseProgress.findOne(query),
  find: async (query) => await CourseProgress.find(query),
  create: async (data) => await CourseProgress.create(data),
  model: CourseProgress
};

export const getCourseProgressModel = () => exportedObj;

export default exportedObj;
