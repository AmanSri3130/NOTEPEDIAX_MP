import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  watchedDuration: { type: Number, min: 0, default: 0 },
  totalDuration: { type: Number, min: 0, default: 0 },
  totalWatchSeconds: { type: Number, min: 0, default: 0 },
  completionPercent: { type: Number, min: 0, max: 100, default: 0 },
  isCompleted: { type: Boolean, default: false },
  xpAwarded: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

lessonProgressSchema.index(
  { userId: 1, lessonId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'objectId' }, lessonId: { $type: 'objectId' } } }
);
lessonProgressSchema.index({ userId: 1, courseId: 1, isCompleted: 1 });

const LessonProgress = mongoose.models.LessonProgress ||
  mongoose.model('LessonProgress', lessonProgressSchema);

const exportedObj = {
  findOne: async (query) => LessonProgress.findOne(query),
  find: async (query) => LessonProgress.find(query),
  create: async (data) => LessonProgress.create(data),
  model: LessonProgress,
};

export const getLessonProgressModel = () => exportedObj;

export default exportedObj;
