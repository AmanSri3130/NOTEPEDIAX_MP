/**
 * NotepediaX AI Companion Module - Primary Entry Point
 *
 * Completely self-contained, isolated React AI Chatbot module.
 *
 * Usage in any React project:
 *   import NotepediaXChatbot from './modules/notepediax-chatbot';
 *   // or
 *   import { NotepediaXAICompanion } from './modules/notepediax-chatbot';
 *
 * Mount inside App layout:
 *   <NotepediaXChatbot studentId="1" />
 */

import { NotepediaXChatbot } from './NotepediaXChatbot';
import { fastapiService } from './services/fastapiService';
import { groqService } from './services/groqService';
import { useGroqStream } from './hooks/useGroqStream';
import { useLearnerState } from './hooks/useLearnerState';

// Named exports
export {
  NotepediaXChatbot,
  NotepediaXChatbot as NotepediaXAICompanion,
  fastapiService,
  groqService,
  useGroqStream,
  useLearnerState,
};

// Default export
export default NotepediaXChatbot;
