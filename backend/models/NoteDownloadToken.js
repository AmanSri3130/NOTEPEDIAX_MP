import supabase from '../config/supabase.js';

export const NoteDownloadToken = {
  async findOne(query = {}) {
    let q = supabase.from('note_download_tokens').select('*');
    if (query.token) q = q.eq('token', query.token);
    const { data, error } = await q.maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(data) {
    const { data: res, error } = await supabase.from('note_download_tokens').insert([data]).select().single();
    if (error) throw error;
    return res;
  }
};

export const getNoteDownloadTokenModel = () => NoteDownloadToken;
export default NoteDownloadToken;
