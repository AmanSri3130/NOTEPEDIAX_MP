import bcrypt from 'bcryptjs';
import EliteStudent from './EliteStudent.js';
import FreeStudent from './FreeStudent.js';
import Teacher from './Teacher.js';

export const User = {
  async findOne({ email, phone, id }) {
    let query = {};
    if (email) query.email = email.toLowerCase();
    if (phone) query.phone = phone;
    if (id) query._id = id;

    let user = await EliteStudent.findOne(query);
    if (!user) user = await FreeStudent.findOne(query);
    if (!user) user = await Teacher.findOne(query);

    return user;
  },

  async findById(id) {
    return this.findOne({ id });
  },

  async create({ name, email, password, role = 'free_student', phone = null, targetExam = 'JEE_MAIN' }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = password ? await bcrypt.hash(password, salt) : null;

    let user;
    if (role === 'elite_student') {
      user = await EliteStudent.create({
        name,
        email: email ? email.toLowerCase() : null,
        phone,
        password_hash,
        role,
        targetExam,
      });
    } else if (role === 'teacher' || role === 'instructor') {
      user = await Teacher.create({
        name,
        email: email ? email.toLowerCase() : null,
        phone,
        password_hash,
        role,
      });
    } else {
      user = await FreeStudent.create({
        name,
        email: email ? email.toLowerCase() : null,
        phone,
        password_hash,
        role: 'free_student',
        targetExam,
      });
    }

    return user;
  },

  async matchPassword(enteredPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
};

export const getUserModel = () => User;
export default User;
