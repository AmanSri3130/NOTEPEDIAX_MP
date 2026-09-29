import supabase from '../config/supabase.js';

export const CourseProgress = {
  async findOne(query = {}) {
    let q = supabase.from('course_progress').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.courseId) q = q.eq('course_id', query.courseId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('course_progress').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getCourseProgressModel = () => CourseProgress;
export default CourseProgress;
