import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Tutor from './Tutor';
import CoverageDashboard from './CoverageDashboard';
import './index.css';

function App() {
  const [view, setView] = useState<'tutor' | 'admin'>('tutor');

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 h-10 bg-slate-950/90 border-b border-slate-800 flex items-center px-4 gap-4 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-600" />
          <span className="text-xs font-bold text-white">NotepediaX AI Tutor</span>
        </div>
        <button
          onClick={() => setView('tutor')}
          className={`text-xs px-3 py-1 rounded transition-all ${view === 'tutor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Tutor Chat
        </button>
        <button
          onClick={() => setView('admin')}
          className={`text-xs px-3 py-1 rounded transition-all ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Admin Dashboard
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Groq · LLaMA-3</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 h-screen">
        {view === 'tutor' ? <Tutor /> : <CoverageDashboard />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
