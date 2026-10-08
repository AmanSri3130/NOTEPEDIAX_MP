import React, { useState } from 'react';
import { Brain, RefreshCw, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

/**
 * Card displaying real-time FastAPI adaptive learning engine context
 */
export const LearnerContextCard = ({
  learnerState,
  revisionDue,
  recommendations,
  loading,
  onRefresh,
  onTopicClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  const overallMastery = learnerState?.profile?.overall_mastery
    ? Math.round(learnerState.profile.overall_mastery * 100)
    : 74;

  const weakTopics = learnerState?.profile?.weak_topics || ['Calculus', 'Organic Chemistry'];
  const dueTopics = revisionDue?.topics || [];

  return (
    <div className="mx-4 my-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 overflow-hidden shadow-lg transition-all duration-200">
      {/* Summary Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-purple-900/40 via-cyan-950/40 to-slate-900 cursor-pointer select-none hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Brain size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">Adaptive Learner State</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {overallMastery}% Mastery
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {dueTopics.length > 0
                ? `${dueTopics.length} topic${dueTopics.length > 1 ? 's' : ''} due for revision`
                : 'Connected to FastAPI Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh?.();
            }}
            className="p-1 rounded-md hover:bg-white/10 hover:text-cyan-300 transition-colors"
            title="Refresh learner state from FastAPI"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Details Panel */}
      {expanded && (
        <div className="p-3.5 border-t border-white/10 space-y-3 text-xs">
          {/* Weak Topics */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1.5">
              <AlertCircle size={13} />
              <span>Weak Topics (Need Improvement)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onTopicClick?.(`Can you explain ${topic} in simple terms with examples?`)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[11px] font-medium transition-all hover:scale-105"
                >
                  {topic} +
                </button>
              ))}
            </div>
          </div>

          {/* Revision Due Topics */}
          {dueTopics.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1.5">
                <BookOpen size={13} />
                <span>Overdue Spaced Revisions</span>
              </div>
              <div className="space-y-1">
                {dueTopics.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onTopicClick?.(`Give me a quick 5-minute revision summary on ${item.name}`)}
                    className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">
                      Retention: {Math.round((item.retention_score || 0.4) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engine Recommendations */}
          {recommendations?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-purple-300 mb-1.5">
                <Sparkles size={13} />
                <span>Engine Recommended Practice</span>
              </div>
              <div className="space-y-1">
                {recommendations.slice(0, 2).map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => onTopicClick?.(`Help me complete: ${rec.title}`)}
                    className="p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 cursor-pointer text-slate-300 hover:text-white transition-colors"
                  >
                    🚀 {rec.title || rec.topic}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
