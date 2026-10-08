import { Cpu, Download, X } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, messages }) => {
  if (!isOpen) return null;

  const handleExportChat = () => {
    const data = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(data);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = `NotepediaX_Chat_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl p-6 space-y-5 relative text-slate-100 font-sans">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Companion Settings</h3>
              <p className="text-xs text-slate-400">Secure NotepediaX AI connection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          AI requests are securely processed by NotepediaX. Provider credentials are never stored in your browser.
        </p>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-200 block">Export Conversation</span>
            <span className="text-[11px] text-slate-400">Download this session as JSON</span>
          </div>
          <button
            type="button"
            onClick={handleExportChat}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            Export JSON
          </button>
        </div>

        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
