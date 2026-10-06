/**
 * Single source of truth for models, limits and tunables.
 * Update model names here when Groq deprecates/adds models
 * (https://console.groq.com/docs/models).
 */
// NOTE: llama-3.3-70b-versatile / llama-3.1-8b-instant returned 404 model_not_found
// for this Groq account, so we use the models its /models endpoint lists.
// If you get access to the Llama models again, just change these three strings.
export const MODELS = {
  default: 'openai/gpt-oss-120b',
  fast: 'openai/gpt-oss-20b',
  // Vision-capable model (accepts image_url input)
  vision: 'qwen/qwen3.8-27b',
};

export const GENERATION = {
  temperature: 0.3,
  top_p: 0.9,
  max_tokens: 2048,
  stream: true,
};

/** Extra per-model request params (gpt-oss are reasoning models; keep thinking short so
 *  the 2048-token budget goes to the visible answer). */
export const MODEL_EXTRA_PARAMS = {
  'openai/gpt-oss-120b': { reasoning_effort: 'low' },
  'openai/gpt-oss-20b': { reasoning_effort: 'low' },
};

export const LIMITS = {
  maxMessageChars: 4000,
  maxHistoryMessages: 10, // last N messages sent to the model
  maxNotesChars: 6000,
  maxImageBytes: 5 * 1024 * 1024, // 5 MB (decoded)
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 20,
  rateLimitWindowMs: 60_000,
  requestTimeoutMs: 45_000,
};

export const SUBJECTS = [
  'Auto-detect',
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'Coding',
  'Commerce',
  'Humanities',
  'Languages',
  'Exam Prep',
];

/** Subjects that benefit from the larger model. */
export const HARD_SUBJECTS = ['Math', 'Physics', 'Coding'];

export const LEVELS = ['Simple', 'Normal', 'Advanced'];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
