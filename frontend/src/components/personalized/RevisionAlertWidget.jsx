import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, RotateCcw, Sparkles,
  CheckCircle2, ArrowRight, BookOpen, Brain, Zap
} from 'lucide-react';
import useTrackLearningEvent from '../../hooks/useTrackLearningEvent';
import toast from 'react-hot-toast';

export default function RevisionAlertWidget({
  revisionDueData,
  onRevisionActionComplete,
  loading = false,
}) {
  const [revisingTopicId, setRevisingTopicId] = useState(null);
  const { trackFlashcardReview } = useTrackLearningEvent();

  const topicsDue = revisionDueData?.topics_due || [];
  const threshold = revisionDueData?.threshold !== undefined ? revisionDueData.threshold : 0.5;

  const topicTitles = {
    physics_vectors_basics: 'Vectors & Coordinate Algebra',
    physics_kinematics_1d: 'Kinematics: 1D Rectilinear Motion',
    physics_electrostatics_ef: 'Electrostatics: Electric Fields & Flux',
    physics_electrostatics_pot: 'Electrostatic Potential & Capacitance',
    chemistry_mole_concept: 'Mole Concept & Stoichiometry',
    maths_calculus_limits: 'Calculus: Limits & Continuity',
  };

  const handleReviseNow = async (topic) => {
    setRevisingTopicId(topic.topic_id);
    try {
      // Emit flashcard review event with high confidence to restore retention
      await trackFlashcardReview({
        card_id: `flashcard_rev_${Date.now()}`,
        topic_id: topic.topic_id,
        recalled_correctly: true,
        confidence_rating: 5,
        showToast: false,
      });

      toast.success(
        `Spaced revision completed for ${topicTitles[topic.topic_id] || topic.topic_id}! Retention refreshed.`,
        { icon: '🧠', duration: 3000 }
      );

      if (onRevisionActionComplete) {
        onRevisionActionComplete();
      }
    } catch (err) {
      toast.error('Failed to log revision event.');
    } finally {
      setRevisingTopicId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
            topicsDue.length > 0
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {topicsDue.length > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-brand-text font-jakarta">
                Spaced Revision & Retention Alerts
              </h2>
              {topicsDue.length > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {topicsDue.length} Due
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  All Up-to-date
                </span>
              )}
            </div>
            <p className="text-xs text-brand-muted">
              Ebbinghaus forgetting curve monitor flagging topics below the {Math.round(threshold * 100)}% retention threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Due List */}
      <div className="mt-5 space-y-3">
        {topicsDue.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-brand-base/40 border border-dashed border-brand-border p-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-brand-text font-jakarta">
              Excellent Retention Health!
            </h4>
            <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
              All studied topics are currently above your forgetting cutoff. Continue following your daily plan to maintain mastery.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {topicsDue.map((topic, index) => {
              const retentionPct = Math.round(topic.retention_score * 100);
              const priorityPct = Math.round(topic.revision_priority * 100);
              const title = topicTitles[topic.topic_id] || topic.topic_id.replace(/_/g, ' ');

              return (
                <motion.div
                  key={topic.topic_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Priority #{index + 1}
                        </span>
                        <span className="text-[10px] text-brand-muted">•</span>
                        <span className="text-[10px] text-brand-muted font-mono">{topic.topic_id}</span>
                      </div>
                      <h4 className="text-xs font-bold text-brand-text font-jakarta mt-0.5">
                        {title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-brand-muted">
                        <span>
                          Current Retention: <strong className="text-red-500 font-bold">{retentionPct}%</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Urgency Priority: <strong className="text-amber-600 dark:text-amber-400 font-bold">{priorityPct}%</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Elapsed: <strong>{topic.days_since_last_seen > 0 ? `${topic.days_since_last_seen.toFixed(1)} days` : 'recent'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revise Button */}
                  <button
                    onClick={() => handleReviseNow(topic)}
                    disabled={revisingTopicId === topic.topic_id}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {revisingTopicId === topic.topic_id ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Revise Now
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
