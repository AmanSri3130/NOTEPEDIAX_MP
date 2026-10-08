import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Brain,
  CalendarClock,
  Check,
  CircleAlert,
  Clock3,
  RefreshCw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import api from '../../utils/api';

const emptyOverview = {
  learnerState: null,
  recommendations: [],
  topicsDue: [],
  plan: null,
};

export default function AdaptiveStudyPanel() {
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [availableMinutes, setAvailableMinutes] = useState(60);
  const [topicId, setTopicId] = useState('');
  const [isCorrect, setIsCorrect] = useState(true);
  const [responseTime, setResponseTime] = useState(60);

  const fetchOverview = useCallback(async () => {
    const response = await api.get('/adaptive-engine/overview');
    return { ...emptyOverview, ...response.data.data };
  }, []);

  useEffect(() => {
    let active = true;
    fetchOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            'Could not load adaptive study data. Check that the learning engine is configured and running.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchOverview]);

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      setOverview(await fetchOverview());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Could not load adaptive study data. Check that the learning engine is configured and running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOverview = async (request) => {
    setBusy(true);
    setError('');
    try {
      await request();
      await loadOverview();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.message ||
        'Adaptive study update failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const generatePlan = () =>
    updateOverview(() => {
      const minutes = Number(availableMinutes);
      if (!Number.isInteger(minutes) || minutes < 15 || minutes > 720) {
        throw new Error('Choose a daily study time between 15 and 720 minutes.');
      }
      return api.post('/adaptive-engine/plan', { available_minutes: minutes });
    });

  const recordAttempt = (event) => {
    event.preventDefault();
    if (!topicId.trim()) {
      setError('Enter a topic ID before recording an attempt.');
      return;
    }
    const seconds = Number(responseTime);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 3600) {
      setError('Response time must be a whole number from 0 to 3600 seconds.');
      return;
    }

    updateOverview(() =>
      api.post('/adaptive-engine/event', {
        event_type: 'QUESTION_ATTEMPT',
        topic_id: topicId.trim(),
        metadata: {
          question_id: `dashboard-${Date.now()}`,
          topic_id: topicId.trim(),
          difficulty: 0.5,
          correct: isCorrect,
          response_time_seconds: seconds,
          attempt_number: 1,
        },
      })
    );
  };

  const sendFeedback = (activityId, status) =>
    updateOverview(() =>
      api.post(`/adaptive-engine/plan/${encodeURIComponent(activityId)}/feedback`, { status })
    );

  const mastery = overview.learnerState?.topic_mastery || {};
  const planActivities = overview.plan?.activities || [];

  return (
    <section className="mb-8 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-brand-card to-brand-primary/5 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
            <Brain className="h-3.5 w-3.5" />
            Elite Adaptive Learning
          </span>
          <h2 className="mt-3 flex items-center gap-2 font-display text-lg font-bold text-brand-text">
            Your personalized study engine
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            Recommendations, spaced revision, and a daily plan that adapts to your progress.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOverview}
          disabled={loading || busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-card px-3 py-2 text-xs font-semibold text-brand-text hover:border-brand-primary/40 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs text-brand-muted">Loading your adaptive study profile...</div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-border bg-brand-card/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                <Target className="h-4 w-4 text-brand-primary" /> Topics tracked
              </div>
              <p className="mt-2 text-2xl font-extrabold text-brand-text">{Object.keys(mastery).length}</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-card/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                <RefreshCw className="h-4 w-4 text-orange-500" /> Revision due
              </div>
              <p className="mt-2 text-2xl font-extrabold text-brand-text">{overview.topicsDue.length}</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-card/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                <Sparkles className="h-4 w-4 text-amber-500" /> Next best actions
              </div>
              <p className="mt-2 text-2xl font-extrabold text-brand-text">{overview.recommendations.length}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-text">
                <Activity className="h-4 w-4 text-brand-primary" /> Recommended next steps
              </h3>
              {overview.recommendations.length ? (
                <ul className="space-y-2">
                  {overview.recommendations.slice(0, 4).map((item) => (
                    <li key={item.activity_id} className="rounded-xl border border-brand-border bg-brand-card/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-brand-text">{item.title}</p>
                          <p className="mt-1 text-[11px] text-brand-muted">{item.recommendation_reason}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-brand-primary/10 px-2 py-1 text-[10px] font-bold text-brand-primary">
                          {item.estimated_duration_minutes} min
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-brand-border bg-brand-card/70 p-4 text-xs text-brand-muted">
                  Recommendations will appear once topics are available in the learning taxonomy.
                </p>
              )}

              <form onSubmit={recordAttempt} className="rounded-2xl border border-brand-border bg-brand-card/80 p-4">
                <h4 className="text-xs font-bold text-brand-text">Record a question attempt</h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <input
                    aria-label="Topic ID"
                    value={topicId}
                    onChange={(event) => setTopicId(event.target.value)}
                    placeholder="e.g. physics_electrostatics_ef"
                    className="min-w-0 rounded-lg border border-brand-border bg-brand-base px-3 py-2 text-xs text-brand-text"
                  />
                  <select
                    aria-label="Question result"
                    value={isCorrect ? 'correct' : 'incorrect'}
                    onChange={(event) => setIsCorrect(event.target.value === 'correct')}
                    className="rounded-lg border border-brand-border bg-brand-base px-2 py-2 text-xs text-brand-text"
                  >
                    <option value="correct">Correct</option>
                    <option value="incorrect">Incorrect</option>
                  </select>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Record
                  </button>
                </div>
                <label className="mt-2 flex items-center gap-2 text-[11px] text-brand-muted">
                  Response time (seconds)
                  <input
                    type="number"
                    min="0"
                    max="3600"
                    value={responseTime}
                    onChange={(event) => setResponseTime(event.target.value)}
                    className="w-20 rounded-lg border border-brand-border bg-brand-base px-2 py-1.5 text-xs text-brand-text"
                  />
                </label>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-text">
                <CalendarClock className="h-4 w-4 text-brand-orange" /> Today&apos;s adaptive plan
              </h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  generatePlan();
                }}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-border bg-brand-card/80 p-3"
              >
                <label htmlFor="adaptive-minutes" className="text-xs font-semibold text-brand-muted">
                  Daily study time
                </label>
                <input
                  id="adaptive-minutes"
                  type="number"
                  min="15"
                  max="720"
                  value={availableMinutes}
                  onChange={(event) => setAvailableMinutes(event.target.value)}
                  className="w-20 rounded-lg border border-brand-border bg-brand-base px-2 py-1.5 text-xs text-brand-text"
                />
                <span className="text-xs text-brand-muted">minutes</span>
                <button
                  type="submit"
                  disabled={busy}
                  className="ml-auto rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {busy ? 'Updating...' : 'Build my plan'}
                </button>
              </form>

              {planActivities.length ? (
                <ul className="space-y-2">
                  {planActivities.map((slot) => (
                    <li key={slot.activity_id} className="rounded-xl border border-brand-border bg-brand-card/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-brand-text">
                            {slot.is_break ? 'Rest break' : slot.activity?.title || 'Study activity'}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-brand-muted">
                            <Clock3 className="h-3 w-3" />
                            {slot.time_slot} · {slot.duration_minutes} min · {slot.status}
                          </p>
                        </div>
                        {!slot.is_break && slot.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              aria-label="Mark activity complete"
                              title="Complete"
                              onClick={() => sendFeedback(slot.activity_id, 'COMPLETED')}
                              disabled={busy}
                              className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Skip activity"
                              title="Skip"
                              onClick={() => sendFeedback(slot.activity_id, 'SKIPPED')}
                              disabled={busy}
                              className="rounded-lg bg-red-500/10 p-2 text-red-500 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-brand-border bg-brand-card/70 p-4 text-xs text-brand-muted">
                  Build a plan to get a study schedule tailored to your available time.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
