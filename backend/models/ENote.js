import supabase from '../config/supabase.js';

export const ENote = {
  async find(query = {}) {
    let q = supabase.from('e_notes').select('*');
    if (query.isFree !== undefined) q = q.eq('is_free', query.isFree);
    if (query.subject) q = q.eq('subject', query.subject);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const { data, error } = await supabase.from('e_notes').select('*').eq('id', id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(noteData) {
    const { data, error } = await supabase.from('e_notes').insert([noteData]).select().single();
    if (error) throw error;
    return data;
  }
};

export const getENoteModel = () => ENote;
export default ENote;
