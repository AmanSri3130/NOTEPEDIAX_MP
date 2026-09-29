import supabase from '../config/supabase.js';

export const Review = {
  async find(query = {}) {
    let q = supabase.from('reviews').select('*');
    if (query.courseId) q = q.eq('course_id', query.courseId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: res, error } = await supabase.from('reviews').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getReviewModel = () => Review;
export default Review;
