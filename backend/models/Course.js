import supabase from '../config/supabase.js';

export const Course = {
  async find(query = {}) {
    let q = supabase.from('courses').select('*');
    if (query.isPublished !== undefined) q = q.eq('is_published', query.isPublished);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(courseData) {
    const { data, error } = await supabase.from('courses').insert([courseData]).select().single();
    if (error) throw error;
    return data;
  }
};

export const getCourseModel = () => Course;
export default Course;
