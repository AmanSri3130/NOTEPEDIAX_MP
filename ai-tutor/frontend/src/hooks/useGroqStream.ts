import { useState, useRef, useCallback } from 'react';
import { streamGroqChat } from '../services/groqService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

export const useGroqStream = (model: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (userContent: string, systemPrompt: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userContent };
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userContent }
    ];

    try {
      await streamGroqChat(chatMessages, model, (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: m.content + chunk }
            : m
        ));
      }, controller.signal);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Sorry, an error occurred. Please try again.', streaming: false }
            : m
        ));
      }
    } finally {
      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, streaming: false } : m
      ));
      setIsStreaming(false);
    }
  }, [messages, model]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, send, cancel, clear };
};
