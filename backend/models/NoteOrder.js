import supabase from '../config/supabase.js';

export const NoteOrder = {
  async findOne(query = {}) {
    let q = supabase.from('note_orders').select('*');
    if (query.orderId) q = q.eq('order_id', query.orderId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('note_orders').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getNoteOrderModel = () => NoteOrder;
export default NoteOrder;
