import bcrypt from 'bcryptjs';
import supabase from '../config/supabase.js';

export const User = {
  async findOne({ email, phone, id }) {
    let query = supabase.from('users').select('*');
    if (email) query = query.eq('email', email.toLowerCase());
    if (phone) query = query.eq('phone', phone);
    if (id) query = query.eq('id', id);

    const { data, error } = await query.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    // Attach password matching method
    data.matchPassword = async function (enteredPassword) {
      if (!data.password_hash) return false;
      return await bcrypt.compare(enteredPassword, data.password_hash);
    };

    return data;
  },

  async findById(id) {
    return this.findOne({ id });
  },

  async create({ name, email, password, role = 'student', phone = null, targetExam = 'JEE_MAIN' }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = password ? await bcrypt.hash(password, salt) : null;

    // 1. Create role-specific profile
    let studentId = null;
    let teacherId = null;
    let adminId = null;

    if (role === 'student') {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .insert([{ phone, target_exam: targetExam }])
        .select()
        .single();
      if (!sErr && student) studentId = student.id;
    } else if (role === 'teacher' || role === 'instructor') {
      const { data: teacher, error: tErr } = await supabase
        .from('teachers')
        .insert([{ full_name: name, email, phone }])
        .select()
        .single();
      if (!tErr && teacher) teacherId = teacher.id;
    } else if (role === 'admin' || role === 'school_admin') {
      const { data: admin, error: aErr } = await supabase
        .from('admins')
        .insert([{ full_name: name }])
        .select()
        .single();
      if (!aErr && admin) adminId = admin.id;
    }

    // 2. Insert into users table
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name,
        email: email ? email.toLowerCase() : null,
        phone,
        password_hash,
        role,
        student_id: studentId,
        teacher_id: teacherId,
        admin_id: adminId,
      }])
      .select()
      .single();

    if (error) throw error;
    return newUser;
  },

  async matchPassword(enteredPassword, hashedPassword) {
    if (!hashedPassword) return false;
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
};

export const getUserModel = () => User;
export default User;
