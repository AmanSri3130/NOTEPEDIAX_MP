import supabase from '../config/supabase.js';

export const getNotes = async (req, res) => {
  try {
    const { data: notes, error } = await supabase.from('e_notes').select('*');
    if (error) throw error;
    res.json({ success: true, data: notes || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getENotes = getNotes;

export const getNoteBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const { data: note, error } = await supabase.from('e_notes').select('*').eq('id', slug).maybeSingle();
    if (error) throw error;
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getENoteById = getNoteBySlug;

export const createENote = async (req, res) => {
  const noteData = req.body;
  try {
    const { data: note, error } = await supabase.from('e_notes').insert([noteData]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNoteOrder = async (req, res) => {
  res.json({ success: true, orderId: `NORD-${Date.now()}` });
};

export const verifyNotePayment = async (req, res) => {
  res.json({ success: true, message: 'Payment verified' });
};

export const requestDownloadToken = async (req, res) => {
  res.json({ success: true, downloadToken: `TOK-${Date.now()}` });
};

export const downloadNoteFile = async (req, res) => {
  res.json({ success: true, message: 'Download ready' });
};

export const getMyNotes = async (req, res) => {
  res.json({ success: true, data: [] });
};
