import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { engineApi } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Universal Event Ingestion Hook for NotepediaX Adaptive Learning
 * Allows any UI component (Quiz, Notes, Video, Flashcards, Chat, Plan) to emit
 * real-time learning telemetry to the engine to update mastery and retention.
 */
export function useTrackLearningEvent() {
  const { user } = useAuth();

  // Resolve active student ID from auth session or local cache
  const getActiveStudentId = useCallback(() => {
    if (user?.id) return user.id;
    const storedStudentId = localStorage.getItem('notepediax_student_id');
    return storedStudentId || null;
  }, [user]);

  /**
   * Generic event dispatcher
   */
  const emitEvent = useCallback(
    async ({ event_type, topic_id, metadata = {}, showToast = false, toastMessage = null }) => {
      const studentId = getActiveStudentId();
      if (!studentId) {
        console.warn('[useTrackLearningEvent] No active student ID found. Event skipped:', event_type);
        return { success: false, error: 'NO_STUDENT_ID' };
      }

      try {
        const response = await engineApi.trackEvent(studentId, {
          event_type,
          topic_id,
          metadata,
        });

        if (showToast) {
          toast.success(toastMessage || `Mastery updated for ${topic_id}!`, {
            icon: '⚡',
            duration: 2500,
          });
        }

        return { success: true, data: response.data };
      } catch (err) {
        console.error(`[useTrackLearningEvent] Failed to emit ${event_type}:`, err);
        return { success: false, error: err.message };
      }
    },
    [getActiveStudentId]
  );

  // ---------------------------------------------------------------------------
  // Specialized helper dispatchers for all 8 canonical event types
  // ---------------------------------------------------------------------------

  const trackQuestionAttempt = useCallback(
    ({ question_id, topic_id, difficulty = 0.5, correct = true, response_time_seconds = 30, attempt_number = 1, showToast = false }) => {
      return emitEvent({
        event_type: 'QUESTION_ATTEMPT',
        topic_id,
        metadata: {
          question_id: String(question_id),
          topic_id,
          difficulty: Number(difficulty),
          correct: Boolean(correct),
          response_time_seconds: Math.max(0, parseInt(response_time_seconds, 10)),
          attempt_number: Math.max(1, parseInt(attempt_number, 10)),
        },
        showToast,
        toastMessage: correct ? 'Great answer! Mastery increased.' : 'Mastery adjusted. Review recommended.',
      });
    },
    [emitEvent]
  );

  const trackNoteRead = useCallback(
    ({ note_id, topic_id, dwell_time_seconds = 60, completion_percentage = 100, showToast = false }) => {
      return emitEvent({
        event_type: 'NOTE_READ',
        topic_id,
        metadata: {
          note_id: String(note_id),
          topic_id,
          dwell_time_seconds: Math.max(0, parseInt(dwell_time_seconds, 10)),
          completion_percentage: Math.min(100, Math.max(0, parseFloat(completion_percentage))),
        },
        showToast,
        toastMessage: 'Notes reading logged to knowledge tracker!',
      });
    },
    [emitEvent]
  );

  const trackQuizComplete = useCallback(
    ({ quiz_id, topic_ids = [], total_questions = 10, score_percentage = 80, showToast = true }) => {
      const primaryTopic = topic_ids.length > 0 ? topic_ids[0] : 'general_quiz';
      return emitEvent({
        event_type: 'QUIZ_COMPLETE',
        topic_id: primaryTopic,
        metadata: {
          quiz_id: String(quiz_id),
          topic_ids: Array.isArray(topic_ids) && topic_ids.length > 0 ? topic_ids : [primaryTopic],
          total_questions: Math.max(1, parseInt(total_questions, 10)),
          score_percentage: Math.min(100, Math.max(0, parseFloat(score_percentage))),
        },
        showToast,
        toastMessage: `Quiz complete: ${score_percentage}% score recorded!`,
      });
    },
    [emitEvent]
  );

  const trackVideoComplete = useCallback(
    ({ video_id, topic_id, duration_watched_seconds = 300, completion_rate = 1.0, showToast = false }) => {
      return emitEvent({
        event_type: 'VIDEO_COMPLETE',
        topic_id,
        metadata: {
          video_id: String(video_id),
          topic_id,
          duration_watched_seconds: Math.max(0, parseInt(duration_watched_seconds, 10)),
          completion_rate: Math.min(1.0, Math.max(0.0, parseFloat(completion_rate))),
        },
        showToast,
        toastMessage: 'Lecture progress recorded!',
      });
    },
    [emitEvent]
  );

  const trackFlashcardReview = useCallback(
    ({ card_id, topic_id, recalled_correctly = true, confidence_rating = 4, showToast = false }) => {
      return emitEvent({
        event_type: 'FLASHCARD_REVIEW',
        topic_id,
        metadata: {
          card_id: String(card_id),
          topic_id,
          recalled_correctly: Boolean(recalled_correctly),
          confidence_rating: Math.min(5, Math.max(1, parseInt(confidence_rating, 10))),
        },
        showToast,
      });
    },
    [emitEvent]
  );

  const trackDoubtAsked = useCallback(
    ({ doubt_id, topic_id, question_text, showToast = false }) => {
      return emitEvent({
        event_type: 'DOUBT_ASKED',
        topic_id,
        metadata: {
          doubt_id: String(doubt_id),
          topic_id,
          question_text: String(question_text),
        },
        showToast,
      });
    },
    [emitEvent]
  );

  const trackPlanCompleted = useCallback(
    ({ activity_id, topic_id, reason = 'completed_on_schedule', showToast = true }) => {
      return emitEvent({
        event_type: 'PLAN_COMPLETED',
        topic_id,
        metadata: {
          activity_id: String(activity_id),
          topic_id,
          reason,
        },
        showToast,
        toastMessage: 'Activity marked complete! Plan progress updated.',
      });
    },
    [emitEvent]
  );

  const trackPlanSkipped = useCallback(
    ({ activity_id, topic_id, reason = 'skipped_by_user', showToast = false }) => {
      return emitEvent({
        event_type: 'PLAN_SKIPPED',
        topic_id,
        metadata: {
          activity_id: String(activity_id),
          topic_id,
          reason,
        },
        showToast,
      });
    },
    [emitEvent]
  );

  return {
    emitEvent,
    trackQuestionAttempt,
    trackNoteRead,
    trackQuizComplete,
    trackVideoComplete,
    trackFlashcardReview,
    trackDoubtAsked,
    trackPlanCompleted,
    trackPlanSkipped,
    studentId: getActiveStudentId(),
  };
}

export default useTrackLearningEvent;
