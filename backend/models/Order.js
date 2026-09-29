import supabase from '../config/supabase.js';

export const Order = {
  async find(query = {}) {
    let q = supabase.from('orders').select('*');
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.status) q = q.eq('status', query.status);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findOne(query) {
    let q = supabase.from('orders').select('*');
    if (query.orderId) q = q.eq('order_id', query.orderId);
    if (query.idempotencyKey) q = q.eq('idempotency_key', query.idempotencyKey);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(orderData) {
    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
    if (error) throw error;
    return data;
  }
};

export const getOrderModel = () => Order;
export default Order;
