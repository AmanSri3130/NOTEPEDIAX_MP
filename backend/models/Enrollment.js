import supabase from '../config/supabase.js';

export const Enrollment = {
  async find(query = {}) {
    let q = supabase.from('enrollments').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.courseId) q = q.eq('course_id', query.courseId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findOne(query) {
    let q = supabase.from('enrollments').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.courseId) q = q.eq('course_id', query.courseId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(enrollmentData) {
    const { data, error } = await supabase.from('enrollments').insert([enrollmentData]).select().single();
    if (error) throw error;
    return data;
  }
};

export const getEnrollmentModel = () => Enrollment;
export default Enrollment;
