import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, CheckCircle, Award, Sparkles, BarChart2, ShieldAlert } from 'lucide-react';
import { engineApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function DiagnosticModal({ isOpen, onClose, studentId, onDiagnosticComplete }) {
  const initialTopics = [
    { id: 'physics_vectors_basics', title: 'Vectors & Coordinate Systems', subject: 'Physics', defaultScore: 0.70 },
    { id: 'physics_kinematics_1d', title: 'Kinematics: 1D Rectilinear Motion', subject: 'Physics', defaultScore: 0.55 },
    { id: 'physics_electrostatics_ef', title: 'Electrostatics: Electric Fields & Flux', subject: 'Physics', defaultScore: 0.40 },
    { id: 'physics_electrostatics_pot', title: 'Electrostatic Potential & Energy', subject: 'Physics', defaultScore: 0.30 },
    { id: 'chemistry_mole_concept', title: 'Mole Concept & Stoichiometry', subject: 'Chemistry', defaultScore: 0.65 },
    { id: 'maths_calculus_limits', title: 'Calculus: Limits & Continuity', subject: 'Mathematics', defaultScore: 0.50 },
  ];

  const [scores, setScores] = useState(() => {
    const map = {};
    initialTopics.forEach((t) => {
      map[t.id] = t.defaultScore;
    });
    return map;
  });

  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (topicId, val) => {
    setScores((prev) => ({
      ...prev,
      [topicId]: parseFloat(val),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Please configure your student profile first.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await engineApi.submitDiagnostic(studentId, scores);
      if (response.success) {
        toast.success('Diagnostic scores processed! Knowledge graph initialized.', { icon: '🧠' });
        if (onDiagnosticComplete) onDiagnosticComplete(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Diagnostic submission failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit diagnostic assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-3xl border border-brand-border bg-white dark:bg-brand-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text font-jakarta">
                  Diagnostic Knowledge Assessment
                </h3>
                <p className="text-xs text-brand-muted">
                  Calibrate your initial baseline mastery so our recommendation engine can target your weak spots.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-primary-light transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <p className="text-xs font-medium text-brand-muted">
              Adjust your self-assessed or test score for each core syllabus module (0% to 100%):
            </p>

            <div className="space-y-3">
              {initialTopics.map((topic) => {
                const currentVal = scores[topic.id] !== undefined ? scores[topic.id] : 0.5;
                const percentage = Math.round(currentVal * 100);

                let badgeColor = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
                if (percentage >= 70) {
                  badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                } else if (percentage >= 40) {
                  badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                }

                return (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-2xl border border-brand-border bg-brand-base/40 hover:bg-brand-base transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-jakarta">
                            {topic.subject}
                          </span>
                          <h5 className="text-xs font-bold text-brand-text">{topic.title}</h5>
                        </div>
                        <span className="text-[10px] text-brand-muted font-mono">{topic.id}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${badgeColor}`}>
                        {percentage}% Mastery
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(topic.id, e.target.value)}
                        className="w-full accent-brand-primary cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Compute Baseline & Seed Knowledge Graph
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
