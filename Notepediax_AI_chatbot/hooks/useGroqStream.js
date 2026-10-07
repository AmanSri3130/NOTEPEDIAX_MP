import { useState, useRef, useCallback, useEffect } from 'react';
import { groqService } from '../services/groqService';
import { STORAGE_KEYS, DEFAULT_GROQ_MODELS, DEFAULT_GROQ_API_KEY } from '../utils/constants';

/**
 * Hook to manage Groq API streaming execution
 */
export function useGroqStream({
  onAssistantMessageAdd,
  onAssistantMessageChunk,
  onAssistantMessageComplete,
  contextPrompt = '',
}) {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY) || import.meta.env.VITE_GROQ_API_KEY || DEFAULT_GROQ_API_KEY;
  });

  const [selectedModel, setSelectedModel] = useState(DEFAULT_GROQ_MODELS[0].id);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEYS.GROQ_API_KEY, apiKey);
    }
  }, [apiKey]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

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
        apiKey,
        model: selectedModel,
        messages: updatedHistoryForApi,
        learnerContext: contextPrompt,
        signal: controller.signal,
        onChunk: (chunk, fullText) => {
          onAssistantMessageChunk?.(fullText, tempAssistantId);
        },
        onComplete: (fullText) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          onAssistantMessageComplete?.(fullText, tempAssistantId);
        },
        onError: (err) => {
          setIsStreaming(false);
          abortControllerRef.current = null;
          setError(err.message || 'An error occurred while streaming response.');
          onAssistantMessageChunk?.(
            `⚠️ **Error:** ${err.message || 'Could not connect to Groq API. Please check your API Key.'}`,
            tempAssistantId
          );
        },
      });
    },
    [apiKey, selectedModel, isStreaming, contextPrompt, onAssistantMessageAdd, onAssistantMessageChunk, onAssistantMessageComplete]
  );

  return {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  };
}
