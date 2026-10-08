import { useState, useCallback } from 'react';
import { fastapiService } from '../services/fastapiService';

export const useLearnerState = (studentId: string) => {
  const [learnerState, setLearnerState] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await fastapiService.getStudentState(studentId);
      setLearnerState(state);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const buildContextPrompt = useCallback(() => {
    if (!learnerState) return '';
    const weakList = learnerState.weak_topics?.slice(0, 3).join(', ') || 'none';
    const dueList = learnerState.revision_due?.slice(0, 3).join(', ') || 'none';
    const score = Math.round((learnerState.overall_score || 0) * 100);
    return `\n\n[STUDENT CONTEXT]\nOverall Mastery: ${score}%. Weak topics: ${weakList}. Revision due: ${dueList}. Adapt your explanation depth and vocabulary accordingly.`;
  }, [learnerState]);

  return { learnerState, loading, refresh, buildContextPrompt };
};
