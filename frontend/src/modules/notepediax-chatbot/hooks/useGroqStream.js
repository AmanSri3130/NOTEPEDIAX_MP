import { useState, useRef, useCallback } from 'react';
import { groqService } from '../services/groqService';
import api from '../../../utils/api';

/**
 * Hook to manage Groq API streaming execution
 */
export function useGroqStream({
  onAssistantMessageAdd,
  onAssistantMessageChunk,
  onAssistantMessageComplete,
}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const activeAssistantIdRef = useRef(null);
  const historyIdRef = useRef(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (activeAssistantIdRef.current) {
      onAssistantMessageComplete?.('Response stopped.', activeAssistantIdRef.current);
      activeAssistantIdRef.current = null;
    }
    setIsStreaming(false);
  }, [onAssistantMessageComplete]);

  const sendMessage = useCallback(
    async (userText, existingMessages = []) => {
      if (!userText.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      // Create abort controller for cancelling request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Prepare assistant placeholder message in history
      const tempAssistantId = `msg_ast_${Date.now()}`;
      activeAssistantIdRef.current = tempAssistantId;
      onAssistantMessageAdd?.({
        id: tempAssistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      const updatedHistoryForApi = [
        ...existingMessages,
        { role: 'user', content: userText },
      ];

      await groqService.streamChatCompletion({
        messages: updatedHistoryForApi,
        historyId: historyIdRef.current,
        signal: controller.signal,
        onChunk: (chunk, fullText) => {
          onAssistantMessageChunk?.(fullText, tempAssistantId);
        },
        onComplete: (fullText, historyId) => {
          historyIdRef.current = historyId || historyIdRef.current;
          activeAssistantIdRef.current = null;
          setIsStreaming(false);
          abortControllerRef.current = null;
          onAssistantMessageComplete?.(fullText, tempAssistantId);
        },
        onError: (err) => {
          activeAssistantIdRef.current = null;
          setIsStreaming(false);
          abortControllerRef.current = null;
          setError(err.message || 'An error occurred while streaming response.');
          onAssistantMessageChunk?.(
            `⚠️ **Error:** ${err.message || 'Could not connect to the AI service. Please try again.'}`,
            tempAssistantId
          );
        },
      });
    },
    [isStreaming, onAssistantMessageAdd, onAssistantMessageChunk, onAssistantMessageComplete]
  );

  const clearServerHistory = useCallback(async () => {
    const historyId = historyIdRef.current;
    historyIdRef.current = null;
    if (!historyId) return;
    try {
      await api.delete('/chatbot/clear', { data: { historyId } });
    } catch (clearError) {
      console.error('Could not clear saved AI chat history:', clearError);
    }
  }, []);

  return {
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearServerHistory,
  };
}
