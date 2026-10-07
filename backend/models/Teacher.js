import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'teacher' },
  // Each and every detail of teachers
  bio: { type: String },
  qualifications: [String],
  experienceYears: { type: Number, default: 0 },
  subjectsTaught: [String],
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
