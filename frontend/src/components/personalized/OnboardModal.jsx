import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, Clock, BookOpen, Globe, Award, CheckCircle } from 'lucide-react';
import { engineApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function OnboardModal({ isOpen, onClose, onOnboardSuccess, currentProfile = null }) {
  const [academicLevel, setAcademicLevel] = useState(currentProfile?.academic_level || 'class_12');
  const [examTarget, setExamTarget] = useState(currentProfile?.exam_target || 'JEE_MAIN');
  const [dailyMinutes, setDailyMinutes] = useState(currentProfile?.daily_available_minutes || 60);
  const [targetScore, setTargetScore] = useState(currentProfile?.target_score || 95);
  const [preferredLang, setPreferredLang] = useState(currentProfile?.preferred_language || 'en');
  const [submitting, setSubmitting] = useState(false);

  const academicOptions = [
    { value: 'class_10', label: 'Class 10 (Secondary)' },
    { value: 'class_11', label: 'Class 11 (Senior Secondary)' },
    { value: 'class_12', label: 'Class 12 (Board & Pre-College)' },
    { value: 'dropper_repeater', label: 'Dropper / Full-time Prep' },
    { value: 'college_ug', label: 'Undergraduate' },
  ];

  const examOptions = [
    { value: 'JEE_MAIN', label: 'JEE Main (Engineering)', badge: 'IIT-JEE' },
    { value: 'JEE_ADVANCED', label: 'JEE Advanced', badge: 'IIT' },
    { value: 'NEET_UG', label: 'NEET Undergrad (Medical)', badge: 'AIIMS' },
    { value: 'CBSE_12', label: 'CBSE Class 12 Boards', badge: 'Board' },
    { value: 'ICSE_12', label: 'ISC / State Boards', badge: 'Board' },
    { value: 'FOUNDATION', label: 'STEM Foundation Olympiad', badge: 'Olympiad' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await engineApi.onboardStudent({
        academic_level: academicLevel,
        exam_target: examTarget,
        daily_available_minutes: parseInt(dailyMinutes, 10),
        target_score: parseInt(targetScore, 10),
        preferred_language: preferredLang,
      });

      if (response.success) {
        const student = response.data;
        localStorage.setItem('notepediax_student_id', student.id);
        toast.success('Study profile and goals configured successfully!', { icon: '🎯' });
        if (onOnboardSuccess) onOnboardSuccess(student);
        onClose();
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to save goals. Please check your connection.');
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
          className="relative w-full max-w-lg rounded-3xl border border-brand-border bg-white dark:bg-brand-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-orange flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text font-jakarta">
                  {currentProfile ? 'Edit Personalized Learning Goals' : 'Personalized Learning Onboarding'}
                </h3>
                <p className="text-xs text-brand-muted">
                  Calibrate the adaptive AI engine to your exact pace and target.
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Exam Target */}
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-brand-orange" />
                Target Exam
              </label>
              <div className="grid grid-cols-2 gap-2">
                {examOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExamTarget(opt.value)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      examTarget === opt.value
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30'
                        : 'border-brand-border bg-brand-base/40 text-brand-text hover:border-brand-primary/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {examTarget === opt.value && <CheckCircle className="h-3.5 w-3.5 text-brand-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand-primary" />
                Current Academic Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-base px-3 py-2 text-xs font-semibold text-brand-text outline-none focus:border-brand-primary"
              >
                {academicOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Available Minutes Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-orange" />
                  Daily Available Study Time
                </label>
                <span className="text-xs font-bold text-brand-primary px-2 py-0.5 rounded-lg bg-brand-primary-light">
                  {dailyMinutes} minutes ({Math.round((dailyMinutes / 60) * 10) / 10} hrs)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(e.target.value)}
                className="w-full accent-brand-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-muted mt-1 font-semibold">
                <span>15 mins (Express)</span>
                <span>60 mins (Balanced)</span>
                <span>120 mins (Intensive)</span>
                <span>240 mins (Deep Dive)</span>
              </div>
            </div>

            {/* Target Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  Target Score / Percentile
                </label>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {targetScore}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-brand-primary" />
                Preferred Language
              </label>
              <div className="flex gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'Hindi (हिंदी)' },
                  { code: 'hinglish', label: 'Hinglish' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setPreferredLang(lang.code)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      preferredLang === lang.code
                        ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                        : 'border-brand-border bg-brand-base text-brand-text hover:border-brand-primary/50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-orange text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save Goals & Initialize Adaptive Engine
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
