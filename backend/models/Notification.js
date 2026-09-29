import supabase from '../config/supabase.js';

export const Notification = {
  async find(query = {}) {
    let q = supabase.from('notifications').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: res, error } = await supabase.from('notifications').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getNotificationModel = () => Notification;
export default Notification;
