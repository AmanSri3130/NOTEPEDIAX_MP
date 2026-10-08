import { useState } from 'react';
import { FormattedMarkdown } from '../utils/markdownParser';
import { Copy, Check, Volume2, VolumeX, Bookmark, RefreshCw, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Single Chat Message Item with Markdown & Action Toolbar
 */
export const ChatMessage = ({ message, onRegenerate, isLastAssistant }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [liked, setLiked] = useState(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content.replace(/[*#`]/g, ''));
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotes = () => {
    try {
      const existingNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_NOTES) || '[]');
      const newNote = {
        id: `note_${Date.now()}`,
        content: message.content,
        savedAt: new Date().toLocaleString(),
      };
      localStorage.setItem(STORAGE_KEYS.SAVED_NOTES, JSON.stringify([newNote, ...existingNotes]));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.warn('[ChatMessage] Failed to save note:', e);
    }
  };

  return (
    <div
      className={`group flex items-start gap-2.5 my-3 px-1 transition-all ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Role Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
            : 'bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={18} />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 text-[11px] npx-text-muted px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="font-semibold">{isUser ? 'You' : 'NotepediaX Companion'}</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Bubble */}
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'npx-msg-user-bubble rounded-tr-none'
              : 'npx-msg-ai-bubble rounded-tl-none'
          }`}
        >
          {message.content ? (
            <FormattedMarkdown content={message.content} />
          ) : (
            <div className="flex items-center gap-2 text-cyan-500 font-medium py-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Thinking & streaming answer...</span>
              <span className="npx-cursor" />
            </div>
          )}

          {message.isStreaming && message.content && <span className="npx-cursor" />}
        </div>

        {/* Message Action Toolbar (Only for AI Messages) */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 pt-1 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-slate-500/10 npx-text-muted hover:text-cyan-500 transition-colors text-xs flex items-center gap-1"
              title="Copy message text"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>

            <button
              type="button"
              onClick={handleSpeech}
              className={`p-1.5 rounded-md hover:bg-slate-500/10 transition-colors text-xs ${
                isSpeaking ? 'text-cyan-500 animate-pulse bg-cyan-500/20' : 'npx-text-muted hover:text-cyan-500'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            <button
              type="button"
              onClick={handleSaveToNotes}
              className={`p-1.5 rounded-md hover:bg-slate-500/10 transition-colors text-xs flex items-center gap-1 ${
                isSaved ? 'text-amber-500' : 'npx-text-muted hover:text-amber-500'
              }`}
              title="Save response to notes"
            >
              <Bookmark size={13} className={isSaved ? 'fill-amber-500' : ''} />
              {isSaved && <span className="text-[10px] text-amber-500 font-semibold">Saved!</span>}
            </button>

            {isLastAssistant && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1.5 rounded-md hover:bg-slate-500/10 npx-text-muted hover:text-purple-500 transition-colors text-xs"
                title="Regenerate AI response"
              >
                <RefreshCw size={13} />
              </button>
            )}

            <div className="h-3 w-[1px] bg-slate-400/20 mx-1" />

            <button
              type="button"
              onClick={() => setLiked(liked === 'up' ? null : 'up')}
              className={`p-1.5 rounded-md hover:bg-slate-500/10 transition-colors ${
                liked === 'up' ? 'text-emerald-500' : 'npx-text-muted hover:text-emerald-500'
              }`}
              title="Helpful response"
            >
              <ThumbsUp size={13} />
            </button>

            <button
              type="button"
              onClick={() => setLiked(liked === 'down' ? null : 'down')}
              className={`p-1.5 rounded-md hover:bg-slate-500/10 transition-colors ${
                liked === 'down' ? 'text-rose-500' : 'npx-text-muted hover:text-rose-500'
              }`}
              title="Not helpful"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
