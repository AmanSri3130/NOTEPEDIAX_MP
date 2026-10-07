import axios from 'axios';

// Base API URL for NotepediaX FastAPI Adaptive Learning Engine
const ENGINE_BASE_URL = 
  import.meta.env.VITE_ENGINE_API_URL || 
  import.meta.env.VITE_API_URL || 
  import.meta.env.NEXT_PUBLIC_API_URL || 
  'http://localhost:8000';

const engineClient = axios.create({
  baseURL: ENGINE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for unified unwrapping and error logging
engineClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetail = 
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.message || 
      'Unknown Engine API error';
    console.error(`[Engine API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, errorDetail);
    return Promise.reject(error);
  }
);

/**
 * NotepediaX Adaptive Learning Engine API Service Layer
 */
export const engineApi = {
  // ---------------------------------------------------------------------------
  // Health & Diagnostic
  // ---------------------------------------------------------------------------
  async checkHealth() {
    const res = await engineClient.get('/health');
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 1. Student Onboarding & Profiles
  // POST /student/onboard
  // ---------------------------------------------------------------------------
  async onboardStudent({ academic_level, exam_target, target_score = 0, daily_available_minutes = 60, preferred_language = 'en' }) {
    const payload = {
      academic_level,
      exam_target,
      target_score: Number(target_score),
      daily_available_minutes: Number(daily_available_minutes),
      preferred_language,
    };
    const res = await engineClient.post('/student/onboard', payload);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 2. Diagnostic Assessment
  // POST /student/{student_id}/diagnostic
  // ---------------------------------------------------------------------------
  async submitDiagnostic(studentId, scores) {
    const payload = { scores };
    const res = await engineClient.post(`/student/${studentId}/diagnostic`, payload);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 3. Learner State & Topic Mastery
  // GET /student/{student_id}/state
  // ---------------------------------------------------------------------------
  async getLearnerState(studentId) {
    const res = await engineClient.get(`/student/${studentId}/state`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 4. Universal Event Ingestion
  // POST /student/{student_id}/event
  // ---------------------------------------------------------------------------
  async trackEvent(studentId, { event_type, topic_id, metadata = {}, timestamp = null }) {
    const payload = {
      student_id: studentId,
      event_type,
      topic_id,
      metadata,
      ...(timestamp ? { timestamp } : {}),
    };
    const res = await engineClient.post(`/student/${studentId}/event`, payload);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 5. Spaced Revision & Retention Alerts
  // GET /student/{student_id}/revision-due
  // ---------------------------------------------------------------------------
  async getRevisionDue(studentId, threshold = null) {
    const params = threshold !== null ? { threshold } : {};
    const res = await engineClient.get(`/student/${studentId}/revision-due`, { params });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 6. ML Feature Vector
  // GET /student/{student_id}/features/{topic_id}
  // ---------------------------------------------------------------------------
  async getFeatureVector(studentId, topicId) {
    const res = await engineClient.get(`/student/${studentId}/features/${topicId}`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 7. Multi-Factor Activity Recommendations
  // GET /student/{student_id}/recommendations
  // ---------------------------------------------------------------------------
  async getRecommendations(studentId, limit = 10, useMlReranker = false) {
    const params = { limit, use_ml_reranker: useMlReranker };
    const res = await engineClient.get(`/student/${studentId}/recommendations`, { params });
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 8. Optimize Daily Study Plan
  // POST /student/{student_id}/optimize-plan
  // ---------------------------------------------------------------------------
  async optimizePlan(studentId, { available_minutes = null, plan_date = null, focus_topics = null } = {}) {
    const payload = {};
    if (available_minutes !== null && available_minutes !== undefined) {
      payload.available_minutes = Number(available_minutes);
    }
    if (plan_date) {
      payload.plan_date = plan_date;
    }
    if (focus_topics && Array.isArray(focus_topics) && focus_topics.length > 0) {
      payload.focus_topics = focus_topics;
    }
    const res = await engineClient.post(`/student/${studentId}/optimize-plan`, payload);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 9. Today's Scheduled Plan
  // GET /student/{student_id}/plan/today
  // ---------------------------------------------------------------------------
  async getTodayPlan(studentId) {
    const res = await engineClient.get(`/student/${studentId}/plan/today`);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // 10. Plan Feedback & Dynamic Adaptive Replan
  // POST /student/{student_id}/plan/{activity_id}/feedback
  // ---------------------------------------------------------------------------
  async submitPlanFeedback(studentId, activityId, {
    status = 'COMPLETED',
    difficulty_feedback = null,
    relevance_feedback = null,
    performance_score = null,
    actual_duration_minutes = null,
  }) {
    const payload = {
      activity_id: activityId,
      status,
      ...(difficulty_feedback ? { difficulty_feedback } : {}),
      ...(relevance_feedback ? { relevance_feedback } : {}),
      ...(performance_score !== null && performance_score !== undefined ? { performance_score: Number(performance_score) } : {}),
      ...(actual_duration_minutes !== null && actual_duration_minutes !== undefined ? { actual_duration_minutes: Number(actual_duration_minutes) } : {}),
    };
    const res = await engineClient.post(`/student/${studentId}/plan/${activityId}/feedback`, payload);
    return res.data;
  },
};

export default engineApi;
