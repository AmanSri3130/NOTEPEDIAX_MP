import { supabase } from '../lib/supabase';

export const notesService = {
  // Fetch free/published study notes catalog
  async getENotes(examId = null) {
    let query = supabase
      .from('e_notes')
      .select(`
        id,
        title,
        subject,
        chapter,
        is_free,
        file_url,
        page_count,
        created_at,
        exams(id, code, title)
      `)
      .order('created_at', { ascending: false });

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching e-notes:', error.message);
      throw error;
    }
    return data;
  },

  // RAG Similarity Match via Supabase RPC function
  async searchNoteChunks({ queryEmbedding, matchThreshold = 0.75, matchCount = 5, examCode = 'JEE_MAIN' }) {
    const { data, error } = await supabase.rpc('match_note_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_exam_code: examCode,
    });

    if (error) {
      console.error('Error executing RAG note chunk vector search:', error.message);
      throw error;
    }
    return data;
  }
};

export default notesService;
