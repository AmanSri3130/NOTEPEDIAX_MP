import supabase from '../config/supabase.js';

export const ActivityLog = {
  async find(query = {}) {
    let q = supabase.from('activity_logs').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: res, error } = await supabase.from('activity_logs').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getActivityLogModel = () => ActivityLog;
export default ActivityLog;
