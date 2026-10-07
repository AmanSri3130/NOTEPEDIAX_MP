import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { QuickPrompts } from './QuickPrompts';
import { LearnerContextCard } from './LearnerContextCard';
import { ArrowDown } from 'lucide-react';

/**
 * Scrollable Messages Area
 */
export const ChatMessageList = ({
  messages,
  isStreaming,
  onSelectPrompt,
  onRegenerate,
  learnerState,
  revisionDue,
  recommendations,
  loadingLearnerState,
  onRefreshLearnerState,
}) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto scroll to bottom when new streaming messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Find index of last assistant message for regenerate action
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 npx-scrollbar relative"
    >
      {/* Real-time Adaptive Engine Learner Context Card */}
      <LearnerContextCard
        learnerState={learnerState}
        revisionDue={revisionDue}
        recommendations={recommendations}
        loading={loadingLearnerState}
        onRefresh={onRefreshLearnerState}
        onTopicClick={onSelectPrompt}
      />

      {/* Render Messages */}
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id || index}
          message={msg}
          isLastAssistant={index === lastAssistantIndex}
          onRegenerate={onRegenerate}
        />
      ))}

      {/* Show Starter Actions if message count <= 1 */}
      {messages.length <= 1 && <QuickPrompts onSelectPrompt={onSelectPrompt} />}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};
