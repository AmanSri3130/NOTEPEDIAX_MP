import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

const exportedObj = {
  findOne: async (query) => await Course.findOne(query),
  find: async (query) => await Course.find(query),
  create: async (data) => await Course.create(data),
  model: Course
};

export const getCourseModel = () => exportedObj;

export default exportedObj;
