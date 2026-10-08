
/**
 * Animated voice waveform indicator during recording
 */
export const VoiceWaveform = () => {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full select-none">
      <div className="npx-wave-line bg-cyan-400" />
      <div className="npx-wave-line bg-cyan-400" />
      <div className="npx-wave-line bg-cyan-400" />
      <div className="npx-wave-line bg-cyan-400" />
      <span className="text-[11px] font-semibold text-cyan-300 ml-1 animate-pulse">
        Listening...
      </span>
    </div>
  );
};
