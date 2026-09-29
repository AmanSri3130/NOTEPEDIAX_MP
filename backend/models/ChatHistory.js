import supabase from '../config/supabase.js';

export const ChatHistory = {
  async find(query = {}) {
    let q = supabase.from('chat_history').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: res, error } = await supabase.from('chat_history').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getChatHistoryModel = () => ChatHistory;
export default ChatHistory;
