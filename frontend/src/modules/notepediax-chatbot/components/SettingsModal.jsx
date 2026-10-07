import React, { useState } from 'react';
import { X, Key, Check, AlertTriangle, Cpu, Globe, Download, Volume2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_GROQ_MODELS, STORAGE_KEYS } from '../utils/constants';
import { groqService } from '../services/groqService';

/**
 * Settings & Groq API Key Config Modal
 */
export const SettingsModal = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  messages,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyValid, setKeyValid] = useState(null);
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('npx_engine_api_url') || 'http://localhost:8000'
  );

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!keyInput.trim()) return;
    setTestingKey(true);
    setKeyValid(null);
    const valid = await groqService.validateApiKey(keyInput.trim());
    setKeyValid(valid);
    setTestingKey(false);
  };

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    localStorage.setItem('npx_engine_api_url', apiUrl);
    onClose();
  };

  const handleExportChat = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NotepediaX_Chat_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl p-6 space-y-5 relative text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Companion Settings</h3>
              <p className="text-xs text-slate-400">Configure Groq LLM API Key & Adaptive Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          {/* Groq API Key Input */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-cyan-400" />
                Groq API Key
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Get Free Groq Key ↗
              </a>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    setKeyValid(null);
                  }}
                  placeholder="gsk_..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={testingKey || !keyInput.trim()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
              >
                {testingKey ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {/* Validation Feedback */}
            {keyValid === true && (
              <p className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck size={13} />
                Groq API Key verified successfully!
              </p>
            )}
            {keyValid === false && (
              <p className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                <AlertTriangle size={13} />
                Invalid API Key. Please double check console.groq.com.
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 block">Default Groq LLM Model</label>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500"
            >
              {DEFAULT_GROQ_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.badge} ({model.speed})
                </option>
              ))}
            </select>
          </div>

          {/* FastAPI Engine URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Globe size={14} className="text-purple-400" />
              FastAPI Adaptive Engine URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Export Chat */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block">Export Conversation</span>
              <span className="text-[11px] text-slate-400">Download current session as JSON</span>
            </div>
            <button
              onClick={handleExportChat}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              Export JSON
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
