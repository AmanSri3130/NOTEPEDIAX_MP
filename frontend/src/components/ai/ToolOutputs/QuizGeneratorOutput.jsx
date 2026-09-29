import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizGeneratorOutput({ prompt }) {
  const questions = [
    {
      id: 1,
      question: 'In Young\'s Double Slit Experiment, what happens to the fringe width if the entire apparatus is immersed in water (μ = 4/3)?',
      options: [
        'Increases by 4/3 times',
        'Decreases by a factor of 3/4',
        'Remains unchanged',
        'Fringes disappear completely'
      ],
      correctIndex: 1,
      explanation: 'In water, the wavelength decreases: λ\' = λ / μ = 3/4 λ. Since fringe width β = (λ D) / d, β\' = 3/4 β (decreases by a factor of 3/4).'
    },
    {
      id: 2,
      question: 'Two coherent sources have intensity ratio 9:1. What is the ratio of maximum to minimum intensity in the interference pattern?',
      options: [
        '4 : 1',
        '9 : 1',
        '16 : 1',
        '25 : 1'
      ],
      correctIndex: 0,
      explanation: 'I_max / I_min = (√I1 + √I2)² / (√I1 - √I2)² = (√9 + √1)² / (√9 - √1)² = (3 + 1)² / (3 - 1)² = 16 / 4 = 4 : 1.'
    },
    {
      id: 3,
      question: 'Which phenomenon provides direct experimental evidence that light is a transverse wave?',
      options: [
        'Interference',
        'Diffraction',
        'Polarisation',
        'Refraction'
      ],
      correctIndex: 2,
      explanation: 'Polarisation can only occur in transverse waves where vibrations are perpendicular to wave propagation; longitudinal waves cannot be polarised.'
    }
  ];

  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  const handleSelect = (qIndex, optionIndex) => {
    if (userAnswers[qIndex] !== undefined) return; // already answered
    const updated = { ...userAnswers, [qIndex]: optionIndex };
    setUserAnswers(updated);
    setShowExplanations((prev) => ({ ...prev, [qIndex]: true }));

    // Check if finished and all correct
    if (Object.keys(updated).length === questions.length) {
      const correctCount = Object.entries(updated).filter(
        ([idx, chosen]) => chosen === questions[parseInt(idx)].correctIndex
      ).length;

      if (correctCount === questions.length) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const correctScore = Object.entries(userAnswers).filter(
    ([idx, chosen]) => chosen === questions[parseInt(idx)].correctIndex
  ).length;

  const handleReset = () => {
    setUserAnswers({});
    setShowExplanations({});
  };

  return (
    <div className="space-y-4">
      {/* Quiz Header & Score Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-cyan-500/10 text-cyan-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-cyan-500/20">
            <Sparkles className="h-3 w-3" /> Live Mock Drill
          </span>
          <span className="text-[11px] text-brand-muted font-mono">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>

        <div className="flex items-center gap-3">
          {answeredCount > 0 && (
            <span className="text-xs font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              Score: {correctScore} / {questions.length}
            </span>
          )}
          <button
            onClick={handleReset}
            className="p-1 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-base transition-colors"
            title="Reset Quiz"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const selected = userAnswers[qIdx];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div 
              key={q.id}
              className="p-4 rounded-2xl border border-brand-border bg-brand-card/70 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-brand-text font-display leading-snug">
                  <span className="text-cyan-500 font-mono mr-1.5">Q{qIdx + 1}.</span>
                  {q.question}
                </span>
                {isAnswered && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                    isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
                  }`}>
                    {isCorrect ? '+4 Marks' : '-1 Negative'}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'border-brand-border bg-brand-base/80 hover:border-cyan-500/40 text-brand-body';

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (selected === optIdx) {
                      optStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400';
                    } else {
                      optStyle = 'border-brand-border/40 bg-brand-base/40 text-brand-dim opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between gap-2 ${optStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-md bg-brand-card border border-brand-border/80 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-[11px] leading-tight">{opt}</span>
                      </div>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      {isAnswered && selected === optIdx && !isCorrect && (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Collapsible */}
              {isAnswered && showExplanations[qIdx] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-brand-body space-y-1"
                >
                  <span className="font-bold text-cyan-500 text-[11px] flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Conceptual Explanation
                  </span>
                  <p className="text-[11px] text-brand-muted leading-relaxed pl-4">
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
