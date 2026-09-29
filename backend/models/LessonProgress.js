import supabase from '../config/supabase.js';

export const LessonProgress = {
  async findOne(query = {}) {
    let q = supabase.from('lesson_progress').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.lessonId) q = q.eq('lesson_id', query.lessonId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('lesson_progress').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getLessonProgressModel = () => LessonProgress;
export default LessonProgress;
