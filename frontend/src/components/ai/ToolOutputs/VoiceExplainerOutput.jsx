import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  RotateCcw, 
  Mic, 
  Radio, 
  Layers,
  FastForward
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceExplainerOutput({ prompt }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  const duration = 48; // 48 seconds lecture

  const transcript = [
    { start: 0, end: 12, text: 'Hello students! Let\'s quickly break down Huygens\' Principle in simple terms.' },
    { start: 12, end: 28, text: 'Imagine a pebble dropped in calm water. The ripple crest you see is a wavefront.' },
    { start: 28, end: 40, text: 'Every particle on this crest becomes a tiny new source creating secondary wavelets in the forward direction.' },
    { start: 40, end: 48, text: 'Remember for your exams: central fringe is always bright with zero path difference.' }
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <span className="h-6 px-2.5 rounded-md bg-emerald-500/10 text-emerald-500 font-mono text-[11px] font-bold flex items-center gap-1 border border-emerald-500/20">
            <Radio className="h-3 w-3" /> AI Voice Explainer
          </span>
          <span className="text-[11px] text-brand-muted font-mono">Whisper TTS Synth</span>
        </div>

        <button
          onClick={handleSpeedToggle}
          className="px-2.5 py-1 text-xs rounded-lg border border-brand-border bg-brand-base hover:bg-brand-subtle text-brand-text font-mono font-bold transition-colors"
        >
          {playbackSpeed}x Speed
        </button>
      </div>

      {/* Audio Waveform Player Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 space-y-4">
        
        {/* Animated Sound Wave Bars */}
        <div className="h-12 flex items-center justify-center gap-1">
          {Array.from({ length: 32 }).map((_, i) => {
            const isActive = (currentTime / duration) * 32 >= i;
            const barHeight = isPlaying 
              ? Math.sin(i * 0.4 + currentTime) * 20 + 24
              : (i % 4 + 1) * 8;

            return (
              <div
                key={i}
                style={{ height: `${barHeight}px` }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isActive 
                    ? 'bg-emerald-500 shadow-sm' 
                    : 'bg-brand-border/80'
                }`}
              />
            );
          })}
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-brand-text font-display block">
                {isPlaying ? 'Playing Audio Lecture...' : 'Audio Masterclass Ready'}
              </span>
              <span className="text-[10px] font-mono text-brand-muted">
                00:{currentTime.toString().padStart(2, '0')} / 00:{duration}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
            className="p-2 rounded-xl text-brand-muted hover:text-brand-text border border-brand-border bg-brand-base transition-colors"
            title="Restart Audio"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Transcript */}
      <div className="p-4 rounded-2xl border border-brand-border bg-brand-card space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-brand-muted tracking-wider block">
          Synchronized Audio Transcript
        </span>
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
          {transcript.map((chunk, idx) => {
            const isCurrent = currentTime >= chunk.start && currentTime <= chunk.end;
            return (
              <p 
                key={idx}
                className={`text-xs p-2 rounded-lg transition-colors ${
                  isCurrent 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium' 
                    : 'text-brand-muted'
                }`}
              >
                {chunk.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
