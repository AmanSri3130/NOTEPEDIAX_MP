import supabase from '../config/supabase.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// Get dashboard overview stats
export const getOverview = async (req, res) => {
  const userId = req.user?.id;

  try {
    const { count: enrolledCount } = await supabase
      .from('enrollments')
      .select('count', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: lecturesDone } = await supabase
      .from('lesson_progress')
      .select('count', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true);

    const { data: lastEnrollment } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let resumeCourse = null;
    if (lastEnrollment && lastEnrollment.courses) {
      resumeCourse = {
        id: lastEnrollment.courses.id,
        title: lastEnrollment.courses.title,
        slug: lastEnrollment.courses.slug,
        completionPercent: lastEnrollment.completion_percent || 0,
        chapterTitle: 'Chapter 1: Getting Started',
        lessonTitle: 'Welcome & System Overview',
      };
    }

    res.json({
      success: true,
      data: {
        stats: {
          enrolledCount: enrolledCount || 0,
          streak: req.user?.streak || 12,
          rank: (req.user?.level || 1) * 10 + 2,
          lecturesDone: lecturesDone || 0,
          xp: req.user?.xp || 1820,
        },
        resumeCourse,
        recentLogs: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lesson watch duration progress
export const updateProgress = async (req, res) => {
  const { lessonId, watchedDuration, totalDuration } = req.body;
  const userId = req.user?.id;

  try {
    const completionPercent = totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0;
    const shouldComplete = completionPercent >= 80;

    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        watched_duration: watchedDuration,
        total_duration: totalDuration,
        completion_percent: completionPercent,
        is_completed: shouldComplete,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manually complete lesson
export const completeLesson = async (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user?.id;

  try {
    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completion_percent: 100,
        is_completed: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get filterable activity log
export const getActivityLogs = async (req, res) => {
  const userId = req.user?.id;

  try {
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: logs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get achievements, badges, level
export const getAchievements = async (req, res) => {
  try {
    const xp = req.user?.xp || 1820;
    const badges = [
      { id: 'first_enroll', name: 'First Enrollment', desc: 'Enrolled in your first course', earned: true },
      { id: 'streak_7', name: '7-Day Streak', desc: 'Studied 7 days in a row', earned: true },
      { id: 'bookworm', name: 'Bookworm', desc: 'Downloaded 10+ notes', earned: true },
    ];

    res.json({
      success: true,
      data: {
        xp,
        level: req.user?.level || 1,
        badges,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get billing subscriptions
export const getBilling = async (req, res) => {
  const userId = req.user?.id;

  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    res.json({
      success: true,
      data: {
        subscription: req.user?.subscription || { plan: 'free' },
        orders: orders || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete course
export const completeCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const certificateUrl = `https://notepediax-certificates.s3.amazonaws.com/${userId}_${id}.pdf`;
    res.json({ success: true, certificateUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course progress
export const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const { data: progress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    res.json({
      success: true,
      data: {
        progress: progress || { completionPercent: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
