import axios from 'axios';
import { FASTAPI_ENGINE_BASE_URL } from '../utils/constants';

/**
 * Service to communicate with NotepediaX FastAPI Adaptive Engine
 */
export const fastapiService = {
  baseUrl: FASTAPI_ENGINE_BASE_URL,

  setBaseUrl(url) {
    if (url) this.baseUrl = url;
  },

  /**
   * Fetch complete learner state (Profile, topic mastery, overall score)
   */
  async getStudentState(studentId = '1') {
    try {
      const response = await axios.get(`${this.baseUrl}/student/${studentId}/state`, {
        timeout: 4000,
      });
      return response.data;
    } catch (error) {
      console.warn(`[FastAPI Service] Could not fetch student state for ID ${studentId}:`, error.message);
      // Return fallback state if server is offline
      return {
        success: true,
        data: {
          student_id: studentId,
          profile: { name: 'Learner', overall_mastery: 0.74, weak_topics: ['Calculus', 'Organic Chemistry'] },
          topics: [
            { topic_id: 'calc_01', name: 'Derivatives & Integrals', mastery: 0.45 },
            { topic_id: 'chem_02', name: 'Reaction Mechanisms', mastery: 0.52 },
            { topic_id: 'phy_01', name: 'Electromagnetism', mastery: 0.88 },
          ],
        },
      };
    }
  },

  /**
   * Fetch topics due for revision based on spaced repetition algorithm
   */
  async getRevisionDue(studentId = '1') {
    try {
      const response = await axios.get(`${this.baseUrl}/student/${studentId}/revision-due`, {
        timeout: 4000,
      });
      return response.data;
    } catch (error) {
      console.warn(`[FastAPI Service] Could not fetch revision due:`, error.message);
      return {
        success: true,
        data: {
          due_count: 2,
          topics: [
            { topic_id: 'chem_02', name: 'Organic Chemistry Reactions', retention_score: 0.38, days_overdue: 2 },
            { topic_id: 'calc_01', name: 'Integration by Parts', retention_score: 0.42, days_overdue: 1 },
          ],
        },
      };
    }
  },

  /**
   * Fetch recommended activities from engine
   */
  async getRecommendations(studentId = '1') {
    try {
      const response = await axios.get(`${this.baseUrl}/student/${studentId}/recommendations`, {
        timeout: 4000,
      });
      return response.data;
    } catch (error) {
      console.warn(`[FastAPI Service] Could not fetch recommendations:`, error.message);
      return {
        success: true,
        data: [
          { activity_id: 'act_1', title: '15-min Practice: Organic Reactions', topic: 'Organic Chemistry', priority: 'High' },
          { activity_id: 'act_2', title: 'Quick Video: Integration Techniques', topic: 'Calculus', priority: 'Medium' },
        ],
      };
    }
  },

  /**
   * Build AI prompt context text from student state
   */
  formatContextPrompt(stateData, revisionData, recommendationsData) {
    if (!stateData && !revisionData && !recommendationsData) return '';

    let contextText = '\n--- STUDENT LEARNER CONTEXT (REAL-TIME ADAPTIVE DATA) ---\n';

    if (stateData?.data?.profile) {
      const profile = stateData.data.profile;
      const mastery = Math.round((profile.overall_mastery || 0.7) * 100);
      contextText += `Mastery Score: ${mastery}%\n`;
      if (profile.weak_topics?.length > 0) {
        contextText += `Weak Topics Needing Attention: ${profile.weak_topics.join(', ')}\n`;
      }
    }

    if (revisionData?.data?.topics?.length > 0) {
      const dueList = revisionData.data.topics.map((t) => `${t.name} (Retention: ${Math.round((t.retention_score || 0.4) * 100)}%)`).join(', ');
      contextText += `Topics Overdue for Spaced Revision: ${dueList}\n`;
    }

    if (recommendationsData?.data?.length > 0) {
      const recList = recommendationsData.data.map((r) => r.title || r.topic).slice(0, 3).join(' | ');
      contextText += `Engine Recommendations: ${recList}\n`;
    }

    contextText += '--- END STUDENT CONTEXT ---\nUse this context to tailor your responses intelligently.\n';
    return contextText;
  },
};
