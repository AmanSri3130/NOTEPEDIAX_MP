import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' }, courseId: { $type: 'objectId' } } }
);
enrollmentSchema.index({ status: 1, userId: 1 });

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

const exportedObj = {
  findOne: async (query) => Enrollment.findOne(query),
  find: async (query) => Enrollment.find(query),
  create: async (data) => Enrollment.create(data),
  model: Enrollment,
};

export const getEnrollmentModel = () => exportedObj;

export default exportedObj;
