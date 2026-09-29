import supabase from '../config/supabase.js';

export const Lesson = {
  async find(query = {}) {
    let q = supabase.from('lessons').select('*');
    if (query.chapterId) q = q.eq('chapter_id', query.chapterId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from('lessons').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('lessons').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getLessonModel = () => Lesson;
export default Lesson;
