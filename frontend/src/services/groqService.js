// Groq streaming service for the main NotepediaX app
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function streamGroqChat(messages, model, onChunk, signal) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, model, stream: true, temperature: 0.7 }),
    signal,
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error('No reader');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content || '';
        if (text) onChunk(text);
      } catch { /* skip */ }
    }
  }
}
