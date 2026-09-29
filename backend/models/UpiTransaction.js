import supabase from '../config/supabase.js';

export const UpiTransaction = {
  async findOne(query = {}) {
    let q = supabase.from('payments').select('*');
    if (query.transactionId) q = q.eq('transaction_id', query.transactionId);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('payments').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getUpiTransactionModel = () => UpiTransaction;
export default UpiTransaction;
