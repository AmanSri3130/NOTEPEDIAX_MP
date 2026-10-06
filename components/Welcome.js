'use client';
import { SparkIcon } from './Icons';

export const EXAMPLES = [
  { emoji: '➗', text: 'Solve 2x² − 5x + 3 = 0 step by step', subject: 'Math' },
  { emoji: '🚀', text: 'A ball is thrown up at 20 m/s. How high does it go? (g = 10 m/s²)', subject: 'Physics' },
  { emoji: '💻', text: 'Explain recursion in Python with a simple factorial example', subject: 'Coding' },
  { emoji: '🧬', text: 'Explain the difference between mitosis and meiosis in a table', subject: 'Biology' },
  { emoji: '🗣️', text: 'Bhai, Newton ka third law simple Hinglish mein samjhao', subject: 'Physics' },
  { emoji: '📊', text: 'What is the difference between a debit and a credit in accounting?', subject: 'Commerce' },
];

/** Empty-state welcome screen with tap-to-try examples. */
export default function Welcome({ onPick }) {
  return (
    <div className="mx-auto flex max-w-3xl animate-slideUp flex-col items-center px-4 pb-6 pt-8 text-center sm:pt-14">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-400 via-brand-600 to-fuchsia-500 text-white shadow-xl shadow-brand-500/30">
        <SparkIcon size={30} />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
        Stuck on a doubt? <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">Ask away.</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: 'rgb(var(--muted))' }}>
        Type, speak, or snap a photo of any question. Get a clear, step-by-step explanation in seconds.
      </p>

      <ul className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
        {EXAMPLES.map((ex) => (
          <li key={ex.text}>
            <button
              type="button"
              onClick={() => onPick(ex)}
              className="card group flex h-full w-full items-start gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg"
            >
              <span className="text-2xl" aria-hidden>{ex.emoji}</span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-500">{ex.subject}</span>
                <span className="mt-0.5 block text-sm font-medium leading-snug">{ex.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
