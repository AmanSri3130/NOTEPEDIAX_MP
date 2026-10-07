import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Hook to manage persistent chat history in localStorage
 */
export function useChatHistory(initialWelcomeMessage) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[useChatHistory] Error parsing history:', e);
    }
    return [
      {
        id: 'welcome_1',
        role: 'assistant',
        content: initialWelcomeMessage || 'Hello! I am your **NotepediaX AI Companion** 🧠✨\n\nI can analyze your learning progress, explain complex topics, solve problems, or recommend personalized revision activities. How can I assist your study session today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (e) {
      console.warn('[useChatHistory] Failed to save chat history:', e);
    }
  }, [messages]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const updateLastAssistantMessage = useCallback((contentDelta, isComplete = false) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const lastIndex = prev.length - 1;
      const lastMsg = prev[lastIndex];

      if (lastMsg.role !== 'assistant') return prev;

      const updated = [...prev];
      updated[lastIndex] = {
        ...lastMsg,
        content: contentDelta,
        isStreaming: !isComplete,
      };
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    const defaultWelcome = [
      {
        id: 'welcome_new',
        role: 'assistant',
        content: 'Chat session reset! What would you like to explore or revise next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(defaultWelcome);
    try {
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    } catch (e) {}
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    updateLastAssistantMessage,
    clearHistory,
  };
}
