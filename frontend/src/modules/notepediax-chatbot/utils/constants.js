/**
 * NotepediaX AI Companion - Configuration & Constants
 */

export const STORAGE_KEYS = {
  GROQ_API_KEY: 'npx_groq_api_key',
  CHAT_HISTORY: 'npx_chat_history',
  SETTINGS: 'npx_chatbot_settings',
  SAVED_NOTES: 'npx_saved_notes',
  STUDENT_ID: 'npx_student_id',
};

export const DEFAULT_GROQ_API_KEY = '';

export const DEFAULT_GROQ_MODELS = [
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    badge: 'Recommended',
    description: 'Extremely fast, intelligent & capable model for STEM, coding & academic Q&A.',
    speed: 'High',
    contextWindow: '128k',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    badge: 'Deep Reasoning',
    description: '120B open weights model for complex problem solving & detailed tutoring.',
    speed: 'Fast',
    contextWindow: '128k',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    badge: 'Ultra Fast',
    description: 'Blazing fast 20B model for quick summaries and instant responses.',
    speed: 'Instant',
    contextWindow: '32k',
  },
  {
    id: 'allam-2-7b',
    name: 'ALLaM 2 7B',
    badge: 'Lightweight',
    description: 'Compact model for simple conceptual explanations and quick chat.',
    speed: 'Instant',
    contextWindow: '16k',
  },
];

export const DEFAULT_SYSTEM_PROMPT = `You are NotepediaX AI Companion, an elite, friendly, and highly intelligent AI Study Companion & Tutor integrated into NotepediaX—the adaptive learning platform.

Your Mission:
1. Provide ultra-clear, concise, engaging, and accurate academic explanations across STEM, coding, humanities, and exam prep.
2. Adapt your tone and depth based on the student's learner state, weak topics, and due revisions provided in context.
3. Structure your responses with clean Markdown, bold highlights, code blocks with syntax, bullet points, and step-by-step breakdowns when solving math/science problems.
4. When student context (mastery level, weak topics, due revisions) is available, proactively relate your answers to help strengthen those specific weak areas.
5. Keep answers encouraging, structured, and easy to read.

Always respond in a professional yet warm tone, acting as an encouraging master mentor.`;

export const QUICK_PROMPTS = [
  {
    icon: 'Brain',
    title: 'Analyze My Weak Topics',
    prompt: 'Can you summarize my weak topics and give me a 3-step action plan to improve them today?',
    category: 'adaptive',
  },
  {
    icon: 'Sparkles',
    title: 'Quiz Me on Physics/Math',
    prompt: 'Generate a 3-question conceptual quiz based on my current learning topics with step-by-step answer key.',
    category: 'practice',
  },
  {
    icon: 'BookOpen',
    title: 'Explain Revision Due',
    prompt: 'What topics do I need to revise today according to my spaced repetition schedule, and why?',
    category: 'revision',
  },
  {
    icon: 'Code',
    title: 'Code & Problem Solver',
    prompt: 'Help me break down and solve a difficult problem step-by-step.',
    category: 'general',
  },
];

export const FASTAPI_ENGINE_BASE_URL = 'http://localhost:8000';
