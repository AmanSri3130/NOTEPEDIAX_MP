import { DEFAULT_SYSTEM_PROMPT } from '../utils/constants';

/**
 * Service to execute streaming & standard completions using Groq API
 */
export const groqService = {
  /**
   * Stream completion chunks from Groq API
   * @param {Object} options
   * @param {string} options.apiKey Groq API key
   * @param {string} options.model Groq model ID
   * @param {Array} options.messages Conversation message list
   * @param {string} options.systemPrompt System instructions
   * @param {string} options.learnerContext Learner context from FastAPI engine
   * @param {Function} options.onChunk Callback on receiving string text delta
   * @param {Function} options.onComplete Callback when streaming finishes
   * @param {Function} options.onError Callback on error
   * @param {AbortSignal} options.signal Abort signal to cancel stream
   */
  async streamChatCompletion({
    apiKey,
    model = 'qwen/qwen3.8-27b',
    messages = [],
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    learnerContext = '',
    onChunk,
    onComplete,
    onError,
    signal,
  }) {
    const key = apiKey || import.meta.env.VITE_GROQ_API_KEY || '';

    if (!key) {
      onError?.(new Error('Missing Groq API Key. Please configure your key in settings.'));
      return;
    }

    // Prepare system prompt with learner context appended
    const fullSystemPrompt = learnerContext
      ? `${systemPrompt}\n\n${learnerContext}`
      : systemPrompt;

    const formattedMessages = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          stream: true,
          temperature: 0.6,
          max_tokens: 2048,
        }),
        signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const message = errorJson.error?.message || `Groq API HTTP Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete trailing line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                onChunk?.(delta, fullText);
              }
            } catch (err) {
              console.warn('[Groq Stream] Failed to parse line:', trimmed, err);
            }
          }
        }
      }

      onComplete?.(fullText);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('[Groq Stream] Stream cancelled by user');
      } else {
        console.error('[Groq Service] Error during streaming:', error);
        onError?.(error);
      }
    }
  },

  /**
   * Validate if a Groq API key works by sending a test ping
   */
  async validateApiKey(apiKey) {
    if (!apiKey) return false;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },
};
