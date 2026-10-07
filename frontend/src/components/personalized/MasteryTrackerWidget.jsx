import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, CheckCircle, AlertCircle, HelpCircle, 
  Flame, Zap, BookOpen, Clock, ArrowUpRight, Play, Check 
} from 'lucide-react';
import useTrackLearningEvent from '../../hooks/useTrackLearningEvent';

export default function MasteryTrackerWidget({
  learnerState,
  onTopicEventEmitted,
  loading = false,
}) {
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [simulatingTopic, setSimulatingTopic] = useState(null);
  const { trackQuestionAttempt } = useTrackLearningEvent();

  const topicMastery = learnerState?.topic_mastery || {};
  const retentionScores = learnerState?.retention_scores || {};

  // Human-readable titles mapping for taxonomy topics
  const topicMeta = {
    physics_vectors_basics: { title: 'Vectors & Coordinate Algebra', subject: 'Physics', icon: '📐' },
    physics_kinematics_1d: { title: 'Kinematics: 1D Rectilinear Motion', subject: 'Physics', icon: '🏎️' },
    physics_electrostatics_ef: { title: 'Electrostatics: Electric Fields & Flux', subject: 'Physics', icon: '⚡' },
    physics_electrostatics_pot: { title: 'Electrostatic Potential & Capacitance', subject: 'Physics', icon: '🔋' },
    chemistry_mole_concept: { title: 'Mole Concept & Stoichiometry', subject: 'Chemistry', icon: '🧪' },
    maths_calculus_limits: { title: 'Calculus: Limits & Continuity', subject: 'Maths', icon: '♾️' },
  };

  const topicKeys = Object.keys(topicMastery);

  // Group or enrich topic data
  const topicsList = (topicKeys.length > 0
    ? topicKeys
    : Object.keys(topicMeta)
  ).map((tKey) => {
    const rawVal = topicMastery[tKey];
    const mastery = typeof rawVal === 'number' ? rawVal : (rawVal?.mastery || 0.5);
    const retentionData = retentionScores[tKey] || {};
    const retention = typeof retentionData.score === 'number' ? retentionData.score : mastery;
    const daysSince = retentionData.days_since_last_seen || 0.0;
    const meta = topicMeta[tKey] || {
      title: tKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      subject: tKey.split('_')[0].toUpperCase(),
      icon: '📚',
    };

    return {
      id: tKey,
      title: meta.title,
      subject: meta.subject,
      icon: meta.icon,
      mastery: Math.min(1, Math.max(0, mastery)),
      retention: Math.min(1, Math.max(0, retention)),
      daysSinceLastSeen: daysSince,
    };
  });

  const filteredTopics = topicsList.filter((t) => {
    if (subjectFilter === 'ALL') return true;
    return t.subject.toLowerCase() === subjectFilter.toLowerCase();
  });

  // Handle instant test question attempt simulation
  const handleQuickAttempt = async (topicId, isCorrect) => {
    setSimulatingTopic(topicId);
    try {
      await trackQuestionAttempt({
        question_id: `demo_q_${Date.now()}`,
        topic_id: topicId,
        difficulty: 0.6,
        correct: isCorrect,
        response_time_seconds: 25,
        showToast: true,
      });
      if (onTopicEventEmitted) {
        onTopicEventEmitted();
      }
    } finally {
      setTimeout(() => setSimulatingTopic(null), 600);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-text font-jakarta flex items-center gap-2">
              Knowledge State & Topic Mastery
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                {topicsList.length} Nodes
              </span>
            </h2>
            <p className="text-xs text-brand-muted">
              Dynamically calibrated mastery levels and Ebbinghaus memory retention status.
            </p>
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-brand-base/80 border border-brand-border">
          {['ALL', 'Physics', 'Chemistry', 'Maths'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                subjectFilter === sub
                  ? 'bg-white dark:bg-brand-card text-brand-primary shadow-xs'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <AnimatePresence>
          {filteredTopics.map((topic) => {
            const masteryPct = Math.round(topic.mastery * 100);
            const retentionPct = Math.round(topic.retention * 100);

            // Color-coded badge calculation based on requirements:
            // High (>70% Green), Medium (40-70% Yellow), Weak (<40% Red)
            let badgeStyle = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            let barStyle = 'bg-red-500';
            let levelLabel = 'Weak (<40%)';

            if (masteryPct >= 70) {
              badgeStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
              barStyle = 'bg-emerald-500';
              levelLabel = 'High (>70%)';
            } else if (masteryPct >= 40) {
              badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
              barStyle = 'bg-amber-500';
              levelLabel = 'Medium (40-70%)';
            }

            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-2xl border border-brand-border bg-brand-base/40 p-4 hover:border-brand-primary/40 hover:bg-brand-base/80 transition-all shadow-2xs"
              >
                {/* Top: Topic info & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0 p-1 rounded-xl bg-brand-card border border-brand-border/60">
                      {topic.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                          {topic.subject}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors font-jakarta leading-snug">
                        {topic.title}
                      </h4>
                      <p className="text-[10px] text-brand-muted font-mono">{topic.id}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border shrink-0 ${badgeStyle}`}>
                    {levelLabel}
                  </span>
                </div>

                {/* Progress Bar: Topic Mastery */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-muted">Mastery Score</span>
                    <span className="font-bold text-brand-text font-jakarta">{masteryPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-brand-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barStyle}`}
                    />
                  </div>
                </div>

                {/* Sub-Metrics: Retention Decay & Days Since */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-brand-border/60 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-brand-orange" />
                    <span className="text-brand-muted">Retention:</span>
                    <strong className={`font-bold ${retentionPct < 50 ? 'text-red-500' : 'text-brand-text'}`}>
                      {retentionPct}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-right">
                    <span className="text-brand-muted">Last studied:</span>
                    <strong className="font-semibold text-brand-text">
                      {topic.daysSinceLastSeen > 0 ? `${topic.daysSinceLastSeen.toFixed(1)}d ago` : 'Today'}
                    </strong>
                  </div>
                </div>

                {/* Interactive Event Emitting Action Buttons */}
                <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-brand-border/40">
                  <span className="text-[10px] font-semibold text-brand-muted flex items-center gap-1">
                    <Zap className="h-3 w-3 text-brand-orange" />
                    Live Telemetry:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickAttempt(topic.id, true)}
                      disabled={simulatingTopic === topic.id}
                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Simulate correct question answer event"
                    >
                      <Check className="h-3 w-3" />
                      + Correct
                    </button>
                    <button
                      onClick={() => handleQuickAttempt(topic.id, false)}
                      disabled={simulatingTopic === topic.id}
                      className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Simulate incorrect attempt event"
                    >
                      <AlertCircle className="h-3 w-3" />
                      - Missed
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
