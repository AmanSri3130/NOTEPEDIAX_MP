import supabase from '../config/supabase.js';

export const Coupon = {
  async findOne(query = {}) {
    let q = supabase.from('coupons').select('*');
    if (query.code) q = q.eq('code', query.code.toUpperCase());
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('coupons').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getCouponModel = () => Coupon;
export default Coupon;
