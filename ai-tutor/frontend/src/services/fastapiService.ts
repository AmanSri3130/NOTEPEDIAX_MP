import axios from 'axios';

const BASE_URL = import.meta.env.VITE_FASTAPI_ENGINE_BASE_URL || 'http://localhost:8000';

export const fastapiService = {
  async getStudentState(studentId: string) {
    try {
      const { data } = await axios.get(`${BASE_URL}/student/${studentId}/state`);
      return data;
    } catch {
      // Return mock learner state if engine not running
      return {
        student_id: studentId,
        mastery: { Physics: 0.72, Mathematics: 0.55, Chemistry: 0.83, Biology: 0.61 },
        weak_topics: ['Kinematics', 'Organic Chemistry', 'Integration'],
        revision_due: ['Newton\'s Laws', 'Trigonometry'],
        overall_score: 0.68
      };
    }
  },

  async getRevisionDue(studentId: string) {
    try {
      const { data } = await axios.get(`${BASE_URL}/student/${studentId}/revision-due`);
      return data;
    } catch {
      return { topics: ['Newton\'s Laws', 'Trigonometry', 'Acid-Base Reactions'] };
    }
  },

  async postEvent(studentId: string, event: any) {
    try {
      await axios.post(`${BASE_URL}/student/${studentId}/event`, event);
    } catch {
      // silently fail - engine might not be running
    }
  },

  async getRecommendations(studentId: string) {
    try {
      const { data } = await axios.get(`${BASE_URL}/student/${studentId}/recommendations`);
      return data;
    } catch {
      return { activities: [] };
    }
  }
};
