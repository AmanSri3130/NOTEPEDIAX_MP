import supabase from '../config/supabase.js';

export const Chapter = {
  async find(query = {}) {
    let q = supabase.from('chapters').select('*');
    if (query.subjectId) q = q.eq('subject_id', query.subjectId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from('chapters').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('chapters').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getChapterModel = () => Chapter;
export default Chapter;
