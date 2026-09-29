import supabase from '../config/supabase.js';

export const Cart = {
  async findOne(query = {}) {
    let q = supabase.from('carts').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('carts').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getCartModel = () => Cart;
export default Cart;
