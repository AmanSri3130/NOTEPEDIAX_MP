import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';

const normalizeOverview = (overview = {}) => {
  const learnerState = overview.learnerState || null;
  const mastery = learnerState?.topic_mastery || {};
  const masteryEntries = Object.entries(mastery)
    .filter(([, score]) => Number.isFinite(score))
    .sort(([, first], [, second]) => first - second);
  const overallMastery = masteryEntries.length
    ? masteryEntries.reduce((sum, [, score]) => sum + score, 0) / masteryEntries.length
    : null;

  return {
    learnerState: learnerState ? {
      ...learnerState,
      profile: {
        overall_mastery: overallMastery,
        weak_topics: masteryEntries.filter(([, score]) => score < 0.6).map(([topic]) => topic),
      },
    } : null,
    revisionDue: {
      topics: (overview.topicsDue || []).map((topic) => ({
        ...topic,
        name: topic.name || topic.topic_id,
      })),
    },
    recommendations: overview.recommendations || [],
  };
};

export function useLearnerState() {
  const { user } = useAuth();
  const isElite = user?.role === 'elite_student';
  const [learnerState, setLearnerState] = useState(null);
  const [revisionDue, setRevisionDue] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    const response = await api.get('/adaptive-engine/overview');
    return normalizeOverview(response.data?.data);
  }, []);

  const applyOverview = useCallback((overview) => {
    setLearnerState(overview.learnerState);
    setRevisionDue(overview.revisionDue);
    setRecommendations(overview.recommendations);
  }, []);

  useEffect(() => {
    if (!isElite) return undefined;
    let active = true;

    fetchOverview()
      .then((overview) => {
        if (active) {
          applyOverview(overview);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (active) {
          console.warn('[useLearnerState] Error loading student data:', requestError);
          setError(requestError.response?.data?.message || requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isElite, fetchOverview, applyOverview]);

  const refresh = useCallback(async () => {
    if (!isElite) return;
    setLoading(true);
    setError(null);
    try {
      applyOverview(await fetchOverview());
    } catch (requestError) {
      console.warn('[useLearnerState] Error refreshing student data:', requestError);
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setLoading(false);
    }
  }, [isElite, fetchOverview, applyOverview]);

  return {
    learnerState,
    revisionDue,
    recommendations,
    loading: isElite && loading,
    error,
    refresh,
  };
}
