import mongoose from 'mongoose';

const eliteStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'elite_student' },
  targetExam: { type: String },
  xp: { type: Number, min: 0, default: 0 },
  level: { type: Number, min: 1, default: 1 },
  // Additional complete details for elite students
  subscriptionType: { type: String, default: 'elite' },
  progress: { type: Object, default: {} },
}, { timestamps: true });

const EliteStudent = mongoose.model('EliteStudent', eliteStudentSchema);
export default EliteStudent;
