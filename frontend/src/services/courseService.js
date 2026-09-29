import { supabase } from '../lib/supabase';

export const courseService = {
  // Fetch active exam categories
  async getExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('id, code, title, category, is_active')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching exams:', error.message);
      throw error;
    }
    return data;
  },

  // Fetch published courses with instructor info
  async getCourses(examCode = null) {
    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        slug,
        description,
        price,
        discount_price,
        thumbnail_url,
        is_published,
        created_at,
        exams!inner(id, code, title),
        teachers(id, full_name, profile_picture_url)
      `)
      .eq('is_published', true);

    if (examCode) {
      query = query.eq('exams.code', examCode);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching courses:', error.message);
      throw error;
    }
    return data;
  },

  // Fetch course details by slug or ID
  async getCourseBySlug(slug) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        exams(*),
        teachers(*),
        subjects(
          id,
          title,
          order_index,
          chapters(
            id,
            title,
            order_index,
            lessons(
              id,
              title,
              type,
              video_url,
              duration_seconds,
              is_free_preview,
              order_index
            )
          )
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching course detail:', error.message);
      throw error;
    }
    return data;
  }
};

export default courseService;
