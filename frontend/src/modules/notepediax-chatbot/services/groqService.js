import api from '../../../utils/api';

export const groqService = {
  async streamChatCompletion({
    messages = [],
    historyId,
    onChunk,
    onComplete,
    onError,
    signal,
  }) {
    try {
      const question = [...messages].reverse().find((message) => message.role === 'user')?.content;
      if (!question?.trim()) throw new Error('Enter a question to start chatting.');

      const response = await api.post(
        '/chatbot/ask',
        { question: question.trim(), historyId },
        { signal }
      );
      const answer = response.data?.data?.answer;
      if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error('The AI service returned an empty response.');
      }

      onChunk?.(answer, answer);
      onComplete?.(answer, response.data.data.historyId || null);
    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        onError?.(error);
      }
    }
  },
};
