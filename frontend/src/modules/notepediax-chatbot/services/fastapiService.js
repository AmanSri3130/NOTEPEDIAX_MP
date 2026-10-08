import api from '../../../utils/api';

export const fastapiService = {
  async getOverview() {
    const response = await api.get('/adaptive-engine/overview');
    return response.data?.data || {};
  },

  async getStudentState() {
    const overview = await this.getOverview();
    return overview.learnerState || null;
  },

  async getRevisionDue() {
    const overview = await this.getOverview();
    return overview.topicsDue || [];
  },

  async getRecommendations() {
    const overview = await this.getOverview();
    return overview.recommendations || [];
  },

  formatContextPrompt(state, revisionDue, recommendations) {
    const details = [];
    const mastery = state?.profile?.overall_mastery;
    if (Number.isFinite(mastery)) {
      details.push(`Mastery: ${Math.round(mastery * 100)}%`);
    }
    if (state?.profile?.weak_topics?.length) {
      details.push(`Topics to improve: ${state.profile.weak_topics.join(', ')}`);
    }
    if (revisionDue?.length) {
      details.push(`Topics due for revision: ${revisionDue.map((topic) => topic.name || topic.topic_id).join(', ')}`);
    }
    if (recommendations?.length) {
      details.push(`Recommended practice: ${recommendations.slice(0, 3).map((item) => item.title || item.topic).join(', ')}`);
    }
    return details.length ? `\nLearner context from your account:\n${details.join('\n')}\n` : '';
  },
};
