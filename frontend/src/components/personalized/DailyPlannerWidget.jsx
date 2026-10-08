import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle2, XCircle, ThumbsUp,
  ThumbsDown, Coffee, Sparkles, RefreshCw, Zap,
  BookOpen, Video, HelpCircle, ArrowRight, Play, AlertCircle
} from 'lucide-react';
import { engineApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function DailyPlannerWidget({
  plan,
  studentId,
  onPlanUpdated,
  loading = false,
}) {
  const [optimizing, setOptimizing] = useState(false);
  const [actingActivityId, setActingActivityId] = useState(null);

  const activities = plan?.activities || [];
  const planDate = plan?.plan_date || new Date().toISOString().split('T')[0];
  const totalMinutes = plan?.total_allocated_minutes || activities.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);

  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
  const skippedCount = activities.filter((a) => a.status === 'SKIPPED').length;
  const totalStudyTasks = activities.filter((a) => !a.is_break).length;
  const progressPct = totalStudyTasks > 0 ? Math.round((completedCount / totalStudyTasks) * 100) : 0;

  // Trigger Constraint-Based Schedule Optimization
  const handleOptimizePlan = async () => {
    if (!studentId) {
      toast.error('Student profile required to optimize schedule.');
      return;
    }
    setOptimizing(true);
    try {
      const response = await engineApi.optimizePlan(studentId);
      if (response.success) {
        toast.success('Daily study schedule optimized & synchronized!', { icon: '🗓️' });
        if (onPlanUpdated) {
          onPlanUpdated(response.data);
        }
      }
    } catch (err) {
      console.error('Plan optimization failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to generate study plan.');
    } finally {
      setOptimizing(false);
    }
  };

  // Submit Feedback / Outcome & trigger Adaptive Replanning
  const handleActivityFeedback = async (activityId, feedbackPayload, feedbackName) => {
    if (!studentId) return;
    setActingActivityId(activityId);
    try {
      const response = await engineApi.submitPlanFeedback(studentId, activityId, feedbackPayload);
      if (response.success) {
        toast.success(`Activity ${feedbackName}! Adaptive schedule adjusted.`, {
          icon: feedbackPayload.status === 'COMPLETED' ? '✅' : '🔄',
          duration: 3000,
        });
        if (onPlanUpdated) {
          onPlanUpdated(response.data);
        }
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit activity feedback.');
    } finally {
      setActingActivityId(null);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-brand-text font-jakarta">
                Daily Interactive Schedule & Planner
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {planDate}
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              Time-budget bounded study slots with built-in rest breaks and real-time adaptive replanning loops.
            </p>
          </div>
        </div>

        {/* Optimize / Replan Button */}
        <button
          onClick={handleOptimizePlan}
          disabled={optimizing || loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-orange text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${optimizing ? 'animate-spin' : ''}`} />
          {optimizing ? 'Optimizing Schedule...' : 'Optimize Today\'s Plan'}
        </button>
      </div>

      {/* Progress & Stats Bar */}
      {activities.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-brand-base/40 border border-brand-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-text">Today's Schedule Progress</span>
              <span className="font-bold text-brand-primary font-jakarta">
                {completedCount}/{totalStudyTasks} Tasks ({progressPct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-brand-border overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-orange"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-brand-muted border-t sm:border-t-0 pt-3 sm:pt-0 border-brand-border">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Total: <strong className="text-brand-text">{totalMinutes} mins</strong></span>
            </div>
            {skippedCount > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <span>{skippedCount} Skipped (Replanned)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Timeline List */}
      <div className="mt-6 space-y-3.5">
        {activities.length === 0 ? (
          <div className="py-10 text-center rounded-2xl bg-brand-base/40 border border-dashed border-brand-border p-6">
            <Calendar className="h-10 w-10 text-brand-muted mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-brand-text font-jakarta">
              No Plan Generated for Today Yet
            </h4>
            <p className="text-xs text-brand-muted max-w-md mx-auto mt-1 mb-4">
              Click the button above to build an optimized daily study schedule tailored to your available minutes and syllabus goals.
            </p>
            <button
              onClick={handleOptimizePlan}
              disabled={optimizing}
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-primary-dark shadow-sm transition-all"
            >
              Generate Daily Schedule
            </button>
          </div>
        ) : (
          activities.map((item, index) => {
            const isBreak = item.is_break;
            const activity = item.activity;
            const status = item.status || 'PENDING';
            const isActing = actingActivityId === item.activity_id;

            // Rest break render
            if (isBreak) {
              return (
                <div
                  key={item.activity_id || `break_${index}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300"
                >
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Coffee className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-500">
                          {item.time_slot}
                        </span>
                        <span className="text-xs font-bold font-jakarta">Rest & Cognitive Refresh Break</span>
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        Short mental reset to consolidate working memory and maximize focus for the next session.
                      </p>
                    </div>
                    <span className="text-xs font-bold font-jakarta px-2.5 py-1 rounded-lg bg-indigo-500/10">
                      {item.duration_minutes || 10} min
                    </span>
                  </div>
                </div>
              );
            }

            // Normal Study Task Render
            let statusBadge = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
            if (status === 'COMPLETED') {
              statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            } else if (status === 'SKIPPED') {
              statusBadge = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            }

            return (
              <motion.div
                key={item.activity_id || index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`relative rounded-2xl border p-4.5 transition-all ${
                  status === 'COMPLETED'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : status === 'SKIPPED'
                    ? 'border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 opacity-70'
                    : 'border-brand-border bg-brand-base/40 hover:border-brand-primary/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                  {/* Left: Time Slot + Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Time Slot Badge */}
                    <div className="px-2.5 py-2 rounded-xl bg-brand-card border border-brand-border text-center shrink-0 min-w-[75px]">
                      <span className="text-[9px] font-bold text-brand-muted uppercase block">Time Slot</span>
                      <span className="text-xs font-bold text-brand-primary font-jakarta block mt-0.5">
                        {item.time_slot}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-jakarta">
                          {activity?.activity_type || 'STUDY_BLOCK'}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">
                          {activity?.topic_id || item.activity_id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}`}>
                          {status}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold font-jakarta ${status === 'SKIPPED' ? 'line-through text-brand-muted' : 'text-brand-text'}`}>
                        {activity?.title || activity?.topic_id?.replace(/_/g, ' ') || 'Targeted Learning Task'}
                      </h4>

                      {activity?.recommendation_reason && (
                        <p className="text-xs text-brand-muted italic flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-brand-orange shrink-0 not-italic" />
                          "{activity.recommendation_reason}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Action Buttons per Task */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-brand-border/40">
                    {status === 'PENDING' ? (
                      <>
                        {/* 1. Mark Complete */}
                        <button
                          onClick={() => handleActivityFeedback(item.activity_id, {
                            status: 'COMPLETED',
                            relevance_feedback: 'HELPFUL',
                          }, 'Marked Complete')}
                          disabled={isActing}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Complete
                        </button>

                        {/* 2. Skip */}
                        <button
                          onClick={() => handleActivityFeedback(item.activity_id, {
                            status: 'SKIPPED',
                          }, 'Skipped')}
                          disabled={isActing}
                          className="px-2.5 py-1.5 rounded-xl border border-brand-border hover:border-red-400 bg-brand-card text-brand-muted hover:text-red-500 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Skip
                        </button>

                        {/* 3. Too Easy */}
                        <button
                          onClick={() => handleActivityFeedback(item.activity_id, {
                            status: 'COMPLETED',
                            difficulty_feedback: 'TOO_EASY',
                          }, 'Marked Too Easy')}
                          disabled={isActing}
                          className="px-2.5 py-1.5 rounded-xl border border-brand-border hover:border-brand-primary bg-brand-card text-brand-muted hover:text-brand-primary text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Increase difficulty for next topics"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
                          Too Easy
                        </button>

                        {/* 4. Too Hard */}
                        <button
                          onClick={() => handleActivityFeedback(item.activity_id, {
                            status: 'PARTIALLY_COMPLETED',
                            difficulty_feedback: 'TOO_HARD',
                          }, 'Marked Too Hard (Replanning Easier Prerequisite)')}
                          disabled={isActing}
                          className="px-2.5 py-1.5 rounded-xl border border-brand-border hover:border-amber-500 bg-brand-card text-brand-muted hover:text-amber-500 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Trigger adaptive replanning with prerequisite foundation"
                        >
                          <ThumbsDown className="h-3.5 w-3.5 text-amber-500" />
                          Too Hard
                        </button>
                      </>
                    ) : status === 'COMPLETED' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-jakarta">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed & Telemetry Ingested</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold font-jakarta">
                        <XCircle className="h-4 w-4" />
                        <span>Skipped & Auto-Replanned</span>
                      </div>
                    )}
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
