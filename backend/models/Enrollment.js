import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  // Auto-migrated schema stub
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

const exportedObj = {
  findOne: async (query) => await Enrollment.findOne(query),
  find: async (query) => await Enrollment.find(query),
  create: async (data) => await Enrollment.create(data),
  model: Enrollment
};

export const getEnrollmentModel = () => exportedObj;

export default exportedObj;
