import supabase from '../config/supabase.js';

export const getZoomClasses = async (req, res) => {
  try {
    const { data: classes, error } = await supabase.from('zoom_classes').select('*');
    if (error) throw error;
    res.json({ success: true, data: classes || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassesByCourse = getZoomClasses;

export const getDashboardClasses = async (req, res) => {
  res.json({ success: true, data: [] });
};

export const registerForClass = async (req, res) => {
  res.json({ success: true, message: 'Registered for class' });
};

export const joinClass = async (req, res) => {
  res.json({ success: true, joinUrl: 'https://zoom.us/j/sample' });
};
