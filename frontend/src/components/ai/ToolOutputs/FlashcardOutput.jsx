import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ThumbsUp, 
  AlertCircle,
  Brain
} from 'lucide-react';

export default function FlashcardOutput({ prompt }) {
  const cards = [
    {
      id: 1,
      tag: 'Core Definition',
      front: 'What is Huygens\' Principle and what is its secondary wavelet postulate?',
      back: 'Every point on a primary wavefront acts as a source of secondary spherical wavelets. The forward envelope tangent to all wavelets constitutes the new wavefront at time t + Δt.'
    },
    {
      id: 2,
      tag: 'Key Formula',
      front: 'What is the mathematical condition for constructive vs destructive interference in terms of path difference (Δx)?',
      back: 'Constructive (Bright Fringe): Δx = n · λ (where n = 0, 1, 2, ...)\nDestructive (Dark Fringe): Δx = (2n - 1) · (λ / 2) (where n = 1, 2, ...)'
    },
    {
      id: 3,
      tag: 'Exam Trick',
      front: 'How does angular fringe width (θ) change when slit separation (d) is doubled and light wavelength (λ) is halved?',
      back: 'Angular width θ = λ / d.\nIf λ\' = λ / 2 and d\' = 2d, then θ\' = (λ / 2) / (2d) = θ / 4 (reduces to 1/4th of initial value).'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastery, setMastery] = useState({});

  const activeCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMark = (status) => {
    setMastery((prev) => ({ ...prev, [currentIndex]: status }));
    handleNext();
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-amber-500/10 text-amber-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-amber-500/20">
            <Brain className="h-3 w-3" /> Active Recall Flashcards
          </span>
          <span className="text-[11px] text-brand-muted font-mono">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-brand-dim">
          <span>Click card to flip</span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer min-h-[220px] rounded-3xl p-6 border border-brand-border bg-gradient-to-br from-brand-card to-brand-base flex flex-col justify-between relative shadow-md hover:border-amber-500/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {activeCard.tag}
          </span>
          <span className="text-xs font-mono text-brand-dim flex items-center gap-1 group-hover:text-amber-500 transition-colors">
            <RotateCw className="h-3.5 w-3.5" />
            {isFlipped ? 'Show Question' : 'Reveal Answer'}
          </span>
        </div>

        {/* Card Body */}
        <div className="py-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim block mb-2">
            {isFlipped ? 'ANSWER / KEY TAKEAWAY' : 'QUESTION / CONCEPT'}
          </span>
          <p className="text-sm sm:text-base font-bold text-brand-text font-display leading-relaxed whitespace-pre-line max-w-lg mx-auto">
            {isFlipped ? activeCard.back : activeCard.front}
          </p>
        </div>

        {/* Bottom card footer indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === i 
                  ? 'w-6 bg-amber-500' 
                  : mastery[i] 
                    ? 'w-2 bg-emerald-500' 
                    : 'w-2 bg-brand-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls & Mastery Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl border border-brand-border bg-brand-base text-brand-muted hover:text-brand-text hover:bg-brand-subtle transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMark('hard')}
            className="px-3 py-1.5 text-xs rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 font-bold hover:bg-rose-500/20 transition-colors"
          >
            Hard
          </button>
          <button
            onClick={() => handleMark('good')}
            className="px-3 py-1.5 text-xs rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold hover:bg-amber-500/20 transition-colors"
          >
            Good
          </button>
          <button
            onClick={() => handleMark('easy')}
            className="px-3 py-1.5 text-xs rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-bold hover:bg-emerald-500/20 transition-colors"
          >
            Easy (Mastered)
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl border border-brand-border bg-brand-base text-brand-muted hover:text-brand-text hover:bg-brand-subtle transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
