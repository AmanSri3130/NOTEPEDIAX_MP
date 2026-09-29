import { supabase } from '../lib/supabase';

export const quizService = {
  // Record quiz attempt for student performance analytics & leaderboard ranking
  async recordQuizAttempt({ userId, examCode = 'JEE_MAIN', score, maxScore, accuracyPercentage, timeSpentSeconds = 0, weakTopics = [] }) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{
        user_id: userId,
        exam_code: examCode,
        score,
        max_score: maxScore,
        accuracy_percentage: accuracyPercentage,
        time_spent_seconds: timeSpentSeconds,
        weak_topics: weakTopics,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording quiz attempt:', error.message);
      throw error;
    }
    return data;
  },

  // Fetch leaderboard snapshots for exam
  async getLeaderboard(examCode = 'JEE_MAIN', limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard_snapshots')
      .select(`
        id,
        score,
        rank,
        period,
        users(id, name, role)
      `)
      .eq('exam_code', examCode)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error.message);
      throw error;
    }
    return data;
  }
};

export default quizService;
