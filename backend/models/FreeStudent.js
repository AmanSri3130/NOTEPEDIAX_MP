import mongoose from 'mongoose';

const freeStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'free_student' },
  targetExam: { type: String },
  // Additional complete details for free students
  subscriptionType: { type: String, default: 'free' },
  progress: { type: Object, default: {} },
}, { timestamps: true });

const FreeStudent = mongoose.model('FreeStudent', freeStudentSchema);
export default FreeStudent;
