import { useState, useEffect, useCallback } from 'react';
import { fastapiService } from '../services/fastapiService';

/**
 * Custom Hook to fetch real-time student learner state & recommendations from FastAPI engine
 */
export function useLearnerState(studentId = '1') {
  const [learnerState, setLearnerState] = useState(null);
  const [revisionDue, setRevisionDue] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stateRes, revRes, recRes] = await Promise.all([
        fastapiService.getStudentState(studentId),
        fastapiService.getRevisionDue(studentId),
        fastapiService.getRecommendations(studentId),
      ]);

      setLearnerState(stateRes?.data || null);
      setRevisionDue(revRes?.data || null);
      setRecommendations(recRes?.data || null);
    } catch (err) {
      console.warn('[useLearnerState] Error loading student data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const contextPrompt = fastapiService.formatContextPrompt(
    { data: learnerState },
    { data: revisionDue },
    { data: recommendations }
  );

  return {
    learnerState,
    revisionDue,
    recommendations,
    contextPrompt,
    loading,
    error,
    refresh: fetchState,
  };
}
