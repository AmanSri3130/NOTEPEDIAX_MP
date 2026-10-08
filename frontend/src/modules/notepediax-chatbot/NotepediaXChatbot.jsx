import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { useLearnerState } from './hooks/useLearnerState';
import { useChatHistory } from './hooks/useChatHistory';
import { useGroqStream } from './hooks/useGroqStream';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS } from './utils/constants';
import './styles/chatbot.css';

/**
 * NotepediaX AI Companion - Modular Plug-and-Play React Chatbot
 *
 * Props:
 *  - initialOpen: boolean (default false)
 *  - theme: 'auto' | 'dark' | 'light' (default 'auto')
 *  - onAction: function (optional callback)
 */
function ChatbotSession({
  storageKey,
  initialOpen = false,
  theme = 'auto',
  onAction,
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const getTheme = useCallback(() => {
    if (theme !== 'auto') return theme;
    const htmlEl = document.documentElement;
    const isDark =
      htmlEl.classList.contains('dark') ||
      htmlEl.getAttribute('data-theme') === 'dark' ||
      localStorage.getItem('notepediax-theme') === 'dark';
    return isDark ? 'dark' : 'light';
  }, [theme]);
  const [currentTheme, setCurrentTheme] = useState(getTheme);

  // Theme Sync Observer (Reacts to main app dark/light mode toggle)
  useEffect(() => {
    if (theme !== 'auto') return undefined;
    const checkTheme = () => setCurrentTheme(getTheme());

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, [getTheme, theme]);

  // Close handler callback
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsFullscreen(false);
    setSettingsOpen(false);
  }, []);

  // Keyboard Shortcuts: Alt+C to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Hook 1: Real-time learner state from FastAPI Engine
  const {
    learnerState,
    revisionDue,
    recommendations,
    loading: loadingLearnerState,
    error: learnerStateError,
    refresh: refreshLearnerState,
  } = useLearnerState();

  // Hook 2: Message history with localStorage persistence
  const {
    messages,
    addMessage,
    updateLastAssistantMessage,
    clearHistory,
  } = useChatHistory(undefined, storageKey);

  // Hook 3: Groq LLM streaming controller (Developer Model)
  const {
    isStreaming,
    sendMessage,
    stopStreaming,
    clearServerHistory,
  } = useGroqStream({
    onAssistantMessageAdd: (msg) => addMessage(msg),
    onAssistantMessageChunk: (fullText) => updateLastAssistantMessage(fullText, false),
    onAssistantMessageComplete: (fullText) => updateLastAssistantMessage(fullText, true),
  });

  const handleClearHistory = async () => {
    await clearServerHistory();
    clearHistory();
  };

  // Handle user submitting prompt
  const handleSendPrompt = (text) => {
    if (!text || isStreaming) return;

    addMessage({
      role: 'user',
      content: text,
    });

    sendMessage(text, messages);
    onAction?.({ type: 'USER_PROMPT', payload: text });
  };

  // Handle regenerate last response
  const handleRegenerate = () => {
    if (isStreaming || messages.length < 2) return;

    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex !== -1) {
      const lastUserMsg = messages[lastUserIndex];
      const historyUpToUser = messages.slice(0, lastUserIndex);
      sendMessage(lastUserMsg.content, historyUpToUser);
    }
  };

  return (
    <div className={`npx-chatbot-root npx-theme-${currentTheme}`}>
      {/* Floating Launcher Trigger Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 select-none"
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="npx-launcher-btn npx-launcher-pulse group flex items-center gap-3 px-4 py-3 rounded-full text-white font-bold text-sm shadow-2xl relative overflow-hidden"
            title="Open NotepediaX AI Companion (Alt+C)"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
              <Bot size={20} className="text-white" />
            </div>

            <span className="hidden sm:inline-block font-extrabold tracking-wide">
              NotepediaX AI
            </span>

            {revisionDue?.topics?.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 animate-ping" />
            )}
          </button>
        </motion.div>
      )}

      {/* Main Chatbot Window Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Backdrop overlay for mobile / fullscreen */}
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed z-50 flex flex-col npx-glass-panel overflow-hidden transition-all duration-300 ${
                isFullscreen
                  ? 'inset-3 sm:inset-6 rounded-3xl'
                  : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[650px] max-h-[85vh] rounded-3xl'
              }`}
            >
              {/* Header */}
              <ChatHeader
                onClearHistory={handleClearHistory}
                onOpenSettings={() => setSettingsOpen(true)}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                isFullscreen={isFullscreen}
                onClose={handleClose}
                isStreaming={isStreaming}
              />

              {/* Messages Area */}
              <ChatMessageList
                messages={messages}
                isStreaming={isStreaming}
                onSelectPrompt={handleSendPrompt}
                onRegenerate={handleRegenerate}
                learnerState={learnerState}
                revisionDue={revisionDue}
                recommendations={recommendations}
                loadingLearnerState={loadingLearnerState}
                learnerStateError={learnerStateError}
                onRefreshLearnerState={refreshLearnerState}
              />

              {/* Input Footer */}
              <ChatInput
                onSendMessage={handleSendPrompt}
                isStreaming={isStreaming}
                onStopStreaming={stopStreaming}
              />

              {/* Settings Modal */}
              <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                messages={messages}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const NotepediaXChatbot = (props) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || 'guest';
  const sessionKey = `${userId}_${user?.role || 'guest'}`;
  return (
    <ChatbotSession
      key={sessionKey}
      storageKey={`${STORAGE_KEYS.CHAT_HISTORY}_${userId}`}
      {...props}
    />
  );
};

export default NotepediaXChatbot;
