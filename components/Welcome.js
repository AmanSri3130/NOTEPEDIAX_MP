'use client';
import { Sparkles } from 'lucide-react';

/**
 * Clean, minimal ChatGPT/Claude-style Welcome Screen.
 */
export default function Welcome() {
  return (
    <div className="relative mx-auto flex h-full min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center select-none">
      {/* Subtle soft ambient glow */}
      <div className="hero-radial-glow" aria-hidden="true" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center max-w-lg animate-fadeIn">
        {/* Sparkle Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-400 backdrop-blur-md shadow-sm">
          <Sparkles size={14} className="text-violet-400" />
          <span>AI Study Companion</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          How can I help you learn today?
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md">
          Ask a question, upload a problem, or start learning.
        </p>
      </div>
    </div>
  );
}
