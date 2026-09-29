import supabase from '../config/supabase.js';

export const getCourses = async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, exams(*)');

    if (error) throw error;
    res.json({ success: true, data: courses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*, exams(*), subjects(*, chapters(*, lessons(*)))')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  const courseData = req.body;
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourseReview = async (req, res) => {
  res.json({ success: true, message: 'Review added' });
};

export const getCourseReviews = async (req, res) => {
  res.json({ success: true, data: [] });
};
