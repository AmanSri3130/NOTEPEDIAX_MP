import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Compass, BookOpen, Video, HelpCircle,
  RotateCcw, Zap, ArrowRight, CheckCircle2, Clock,
  TrendingUp, Award, Layers
} from 'lucide-react';
import useTrackLearningEvent from '../../hooks/useTrackLearningEvent';
import toast from 'react-hot-toast';

export default function RecommendationFeedWidget({
  recommendations = [],
  onActivityComplete,
  loading = false,
}) {
  const [activeActivityId, setActiveActivityId] = useState(null);
  const { trackNoteRead, trackQuizComplete, trackVideoComplete, trackFlashcardReview } = useTrackLearningEvent();

  const getActivityTypeDetails = (type) => {
    switch (type) {
      case 'NOTE_READ':
        return { label: 'Reading Note', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'VIDEO_LESSON':
        return { label: 'Video Lesson', icon: Video, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'QUIZ_ATTEMPT':
        return { label: 'Practice Quiz', icon: HelpCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'FLASHCARD_REVIEW':
        return { label: 'Flashcard Drill', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'SPACED_REVISION':
        return { label: 'Spaced Revision', icon: RotateCcw, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
      case 'MISTAKE_REVIEW':
        return { label: 'Mistake Analysis', icon: TrendingUp, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: 'Learning Task', icon: Compass, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' };
    }
  };

  const handleStartActivity = async (rec) => {
    setActiveActivityId(rec.activity_id);
    try {
      // Simulate real-time event ingestion based on activity type
      if (rec.activity_type === 'NOTE_READ') {
        await trackNoteRead({
          note_id: `note_${rec.activity_id}`,
          topic_id: rec.topic_id,
          dwell_time_seconds: rec.estimated_duration_minutes * 60,
          completion_percentage: 100,
          showToast: false,
        });
      } else if (rec.activity_type === 'QUIZ_ATTEMPT') {
        await trackQuizComplete({
          quiz_id: `quiz_${rec.activity_id}`,
          topic_ids: [rec.topic_id],
          total_questions: 10,
          score_percentage: 85,
          showToast: false,
        });
      } else if (rec.activity_type === 'VIDEO_LESSON') {
        await trackVideoComplete({
          video_id: `vid_${rec.activity_id}`,
          topic_id: rec.topic_id,
          duration_watched_seconds: rec.estimated_duration_minutes * 60,
          completion_rate: 1.0,
          showToast: false,
        });
      } else {
        await trackFlashcardReview({
          card_id: `card_${rec.activity_id}`,
          topic_id: rec.topic_id,
          recalled_correctly: true,
          confidence_rating: 4,
          showToast: false,
        });
      }

      toast.success(`Completed "${rec.title || rec.topic_id}"! Knowledge state updated.`, {
        icon: '🚀',
        duration: 3500,
      });

      if (onActivityComplete) {
        onActivityComplete();
      }
    } catch (err) {
      toast.error('Failed to log activity completion.');
    } finally {
      setActiveActivityId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-brand-text font-jakarta">
                "Next Best Action" Recommendation Feed
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                Multi-Factor Ranked
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              AI ranked candidate activities prioritizing highest knowledge gap reduction, syllabus weight, and retention preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Feed Cards */}
      <div className="mt-5 space-y-3.5">
        {recommendations.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-brand-base/40 border border-dashed border-brand-border p-6">
            <Compass className="h-8 w-8 text-brand-muted mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-brand-text">Generating Recommendations...</h4>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mt-1">
              Initialize your profile goals and diagnostic assessment to unlock ranked learning candidate activities.
            </p>
          </div>
        ) : (
          recommendations.map((rec, index) => {
            const typeInfo = getActivityTypeDetails(rec.activity_type);
            const IconComponent = typeInfo.icon;
            const scorePct = Math.round((rec.final_score || 0.8) * 100);

            return (
              <motion.div
                key={rec.activity_id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl border border-brand-border bg-brand-base/40 p-4.5 hover:border-brand-primary/40 hover:bg-brand-base/80 transition-all shadow-2xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Left: Rank + Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center justify-center h-11 w-11 rounded-2xl bg-brand-card border border-brand-border text-brand-text shrink-0 shadow-2xs">
                      <span className="text-[10px] font-bold text-brand-muted uppercase">Rank</span>
                      <span className="text-sm font-extrabold text-brand-primary font-jakarta">#{index + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeInfo.color}`}>
                          <IconComponent className="h-3 w-3" />
                          {typeInfo.label}
                        </span>
                        <span className="text-[10px] font-bold text-brand-muted font-mono">
                          {rec.topic_id}
                        </span>
                        <span className="text-[10px] text-brand-muted">•</span>
                        <span className="text-[10px] font-semibold text-brand-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~{rec.estimated_duration_minutes || 25} mins
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-jakarta">
                        {rec.title || rec.topic_id.replace(/_/g, ' ')}
                      </h4>

                      {/* Explainable Reasoning Badge */}
                      <p className="text-xs text-brand-muted italic flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-brand-orange shrink-0 not-italic" />
                        "{rec.recommendation_reason || 'Targeted to close prerequisite knowledge gap.'}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Score Breakdown + Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/40">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">Fit Score</span>
                      <span className="text-sm font-black text-brand-primary font-jakarta">{scorePct}%</span>
                    </div>

                    <button
                      onClick={() => handleStartActivity(rec)}
                      disabled={activeActivityId === rec.activity_id}
                      className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {activeActivityId === rec.activity_id ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Start Task</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
