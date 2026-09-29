import React, { useState, useEffect } from 'react';
import { 
  Clock, Check, ChevronRight, BarChart2, ShieldCheck, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, HelpCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';

export default function MockTest() {
  const [testActive, setTestActive] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Track answers state: key is question index, value is selected option index
  const [answers, setAnswers] = useState({});
  // Track visited questions to style the palette
  const [visited, setVisited] = useState({ 0: true });
  
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds timer

  const questions = [
    { 
      q: 'Which orbital possesses a spherical node configuration without orientation constraints?', 
      options: ['1s Orbital', '2p Orbital', '3d Orbital', '4f Orbital'], 
      correct: 0,
      subject: 'Inorganic Chemistry'
    },
    { 
      q: 'What represents the rate law expression for first-order reaction kinetics?', 
      options: ['Rate = k[A]^2', 'Rate = k[A]', 'Rate = k', 'Rate = k[A][B]'], 
      correct: 1,
      subject: 'Physical Chemistry'
    },
    { 
      q: 'Which of the following compounds exhibits strong intermolecular hydrogen bonding features?', 
      options: ['Water (H2O)', 'Methane (CH4)', 'Hydrochloric Acid (HCl)', 'Hydrogen Sulfide (H2S)'], 
      correct: 0,
      subject: 'Inorganic Chemistry'
    },
    {
      q: 'What is the limit of (sin x) / x as x approaches 0?',
      options: ['0', '1', 'Infinity', 'Undefined'],
      correct: 1,
      subject: 'Calculus'
    },
    {
      q: 'A block of mass 4 kg is pushed with a force of 20 N. Find its acceleration neglecting friction.',
      options: ['2 m/s²', '4 m/s²', '5 m/s²', '10 m/s²'],
      correct: 2,
      subject: 'Physics Mechanics'
    }
  ];

  // Timer simulation hook
  useEffect(() => {
    if (!testActive || testComplete) return;
    
    if (timeLeft <= 0) {
      handleCompleteTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testActive, testComplete]);

  const handleStartTest = () => {
    setTestActive(true);
    setTestComplete(false);
    setTimeLeft(45);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setAnswers({});
    setVisited({ 0: true });
  };

  const handleOptionSelect = (optionIdx) => {
    setSelectedOption(optionIdx);
    // Auto-update answers dictionary
    setAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handleNavigateQuestion = (idx) => {
    setCurrentQuestionIdx(idx);
    setVisited((prev) => ({ ...prev, [idx]: true }));
    setSelectedOption(answers[idx] !== undefined ? answers[idx] : null);
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setVisited((prev) => ({ ...prev, [nextIdx]: true }));
      setSelectedOption(answers[nextIdx] !== undefined ? answers[nextIdx] : null);
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = () => {
    setTestComplete(true);
    setTestActive(false);
  };

  // Score statistics
  const getCorrectCount = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });
    return score;
  };

  const getUnattemptedCount = () => {
    let count = 0;
    questions.forEach((_, idx) => {
      if (answers[idx] === undefined) count++;
    });
    return count;
  };

  const getIncorrectCount = () => {
    return questions.length - getCorrectCount() - getUnattemptedCount();
  };

  const timerColor = () => {
    if (timeLeft <= 10) return 'stroke-brand-orange';
    return 'stroke-brand-primary';
  };

  // Get status class for the sidebar palette dots
  const getPaletteStatusClass = (idx) => {
    if (currentQuestionIdx === idx) return 'border-2 border-brand-primary bg-brand-primary-light dark:bg-brand-primary/25 text-brand-primary font-bold';
    if (answers[idx] !== undefined) return 'bg-brand-green text-white border-transparent';
    if (visited[idx]) return 'bg-brand-orange/10 border border-brand-orange text-brand-orange';
    return 'bg-brand-base border border-brand-border text-brand-dim';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Header Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          LIVE TESTING CENTER
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-text mt-3">
          Mock Practice{' '}
          <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-brand-primary bg-clip-text text-transparent">
            Examination
          </span>
        </h1>
        <p className="text-brand-muted text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          Evaluate your preparation with speed mock tests, featuring real-time visual palettes and instant subject reports.
        </p>
      </div>

      {!testActive && !testComplete && (
        /* Pre-test details banner & Rules alerts */
        <div className="max-w-xl mx-auto space-y-6">
          <GlassCard className="p-8 text-center space-y-6 bg-brand-card shadow-sm border border-brand-border">
            
            <ShieldCheck className="h-14 w-14 text-brand-primary mx-auto animate-pulse" />
            
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-brand-text">JEE Main Chemistry & Physics Simulator</h2>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                5 Multiple choice questions &bull; 45 Seconds strict timer limits &bull; Instant graphical reports.
              </p>
            </div>

            {/* Rules alert block */}
            <div className="text-left rounded-2xl bg-brand-orange/10 border border-brand-orange/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-orange">
                <AlertTriangle className="h-4 w-4" />
                <span>EXAMINATION RULES & PROTOCOLS</span>
              </div>
              <ul className="text-[10px] sm:text-xs text-brand-muted space-y-1 list-disc pl-4 leading-relaxed">
                <li>Attempting questions saves your answer instantly in the tracking palette.</li>
                <li>Leaving options blank marks the question as "Skipped/Unanswered".</li>
                <li>Upon countdown expiry, answers are automatically compiled for charts.</li>
                <li>Do not reload or navigate away from this browser workspace.</li>
              </ul>
            </div>

            <GlowButton variant="primary" className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-orange border-transparent" onClick={handleStartTest}>
              Start Practice Examination
            </GlowButton>

          </GlassCard>
        </div>
      )}

      {testActive && (
        /* Examination Workspace Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Question view pane (Col: 8) */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="p-6 sm:p-8 space-y-6 bg-brand-card shadow-sm border border-brand-border relative">
              
              {/* Question header details */}
              <div className="flex justify-between items-center border-b border-brand-border pb-3 text-[10px] font-mono text-brand-dim font-bold">
                <span className="text-brand-primary">QUESTION {currentQuestionIdx + 1} OF {questions.length}</span>
                <span>SECTION: {questions[currentQuestionIdx].subject.toUpperCase()}</span>
              </div>

              {/* Text context */}
              <div className="space-y-4">
                <h3 className="font-display text-sm sm:text-base font-bold text-brand-text leading-snug">
                  {questions[currentQuestionIdx].q}
                </h3>

                {/* Option selections */}
                <div className="flex flex-col gap-3">
                  {questions[currentQuestionIdx].options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      className={`w-full rounded-2xl border p-4 text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedOption === oIdx 
                          ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary' 
                          : 'border-brand-border bg-brand-base hover:bg-brand-card text-brand-muted hover:text-brand-text'
                      }`}
                    >
                      <span>{option}</span>
                      {selectedOption === oIdx && <Check className="h-4 w-4 text-brand-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lower Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                <button
                  onClick={() => handleNavigateQuestion(Math.max(0, currentQuestionIdx - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="text-xs font-semibold text-brand-muted hover:text-brand-text disabled:opacity-30"
                >
                  &larr; Previous
                </button>

                <GlowButton variant="primary" className="text-xs py-2 px-5 bg-brand-primary border-transparent flex items-center gap-1 font-bold" onClick={handleNext}>
                  {currentQuestionIdx === questions.length - 1 ? 'Submit Exam' : 'Next Question'}
                  <ChevronRight className="h-4.5 w-4.5" />
                </GlowButton>
              </div>

            </GlassCard>
          </div>

          {/* Right sidebar: Timer ring & Question Palette (Col: 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Clock ring */}
            <GlassCard className="p-6 text-center space-y-4 flex flex-col items-center bg-brand-card border border-brand-border">
              <h3 className="font-display text-xs font-bold text-brand-text uppercase tracking-wider">Time Remaining</h3>
              
              <div className="relative flex items-center justify-center h-28 w-28">
                <svg className="absolute transform -rotate-90 w-28 h-28">
                  <circle cx="56" cy="56" r="46" className="stroke-brand-border" strokeWidth="5" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="46" 
                    className={`transition-all duration-1000 ${timerColor()}`} 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={Math.PI * 2 * 46} 
                    strokeDashoffset={Math.PI * 2 * 46 * (1 - timeLeft / 45)} 
                  />
                </svg>
                <span className="font-mono text-xl font-bold text-brand-text">{timeLeft}s</span>
              </div>
            </GlassCard>

            {/* Questions Palette */}
            <GlassCard className="p-5 bg-brand-card border border-brand-border space-y-4">
              <div className="border-b border-brand-border pb-2">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text">
                  Question Navigation Palette
                </h3>
              </div>

              {/* Numbers grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((_, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleNavigateQuestion(qIdx)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${getPaletteStatusClass(qIdx)}`}
                  >
                    {qIdx + 1}
                  </button>
                ))}
              </div>

              {/* Palette Legend */}
              <div className="border-t border-brand-border/40 pt-3 text-[10px] font-mono text-brand-dim space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-brand-green block" />
                  <span>Answered & Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded border border-brand-orange bg-brand-orange/10 block" />
                  <span>Visited / Skipped</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded border border-brand-border bg-brand-base block" />
                  <span>Unvisited</span>
                </div>
              </div>

            </GlassCard>

          </div>

        </div>
      )}

      {testComplete && (
        /* Post-test results and custom SVG charts */
        <div className="max-w-xl mx-auto space-y-6">
          <GlassCard className="p-8 text-center space-y-6 border border-brand-primary/20 bg-brand-card shadow-lg">
            
            <BarChart2 className="h-12 w-12 text-brand-primary mx-auto animate-bounce" />

            <div>
              <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-2.5 py-1 rounded font-bold">
                COMPILATION COMPLETE
              </span>
              <h2 className="font-display text-2xl font-extrabold text-brand-text mt-3">
                Score Report: {getCorrectCount()} / {questions.length} Correct
              </h2>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                Calculated exam accuracy: <span className="font-bold text-brand-primary">{Math.floor((getCorrectCount() / questions.length) * 100)}%</span>
              </p>
            </div>

            {/* Score accuracy breakdown stats bars */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold py-3 border-y border-brand-border">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-brand-green">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Correct</span>
                </div>
                <span className="font-mono text-sm text-brand-text font-bold">{getCorrectCount()}</span>
              </div>
              <div className="space-y-1 border-x border-brand-border">
                <div className="flex items-center justify-center gap-1 text-brand-orange">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Incorrect</span>
                </div>
                <span className="font-mono text-sm text-brand-text font-bold">{getIncorrectCount()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-brand-dim">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Skipped</span>
                </div>
                <span className="font-mono text-sm text-brand-text font-bold">{getUnattemptedCount()}</span>
              </div>
            </div>

            {/* Custom SVG Bar Chart (Lightweight, zero packages) */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-mono text-brand-dim uppercase font-bold tracking-wider">
                Subject Accuracy Report
              </span>
              
              <div className="bg-brand-base p-4 border border-brand-border rounded-2xl space-y-3.5 shadow-inner">
                
                {/* Physics bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-muted">
                    <span>Physics Mechanics</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Inorganic chem bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-muted">
                    <span>Inorganic Chemistry</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange" style={{ width: '50%' }} />
                  </div>
                </div>

                {/* Calculus bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-muted">
                    <span>Calculus Math</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange" style={{ width: '0%' }} />
                  </div>
                </div>

              </div>
            </div>

            <GlowButton variant="secondary" className="w-full text-xs font-bold py-2.5 uppercase tracking-wider" onClick={handleStartTest}>
              <RefreshCw className="h-4 w-4" />
              Retake Examination
            </GlowButton>

          </GlassCard>
        </div>
      )}

    </div>
  );
}
