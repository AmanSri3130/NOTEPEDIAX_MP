import supabase from '../config/supabase.js';

export const ZoomClass = {
  async find(query = {}) {
    let q = supabase.from('zoom_classes').select('*');
    if (query.courseId) q = q.eq('course_id', query.courseId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: res, error } = await supabase.from('zoom_classes').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getZoomClassModel = () => ZoomClass;
export default ZoomClass;
