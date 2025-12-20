
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  duration: number;
  surahName: string;
  ayahNumber: number;
  reciterName?: string;
  playbackRate: number;
  onPlaybackRateChange: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onClose,
  onSeek,
  currentTime,
  duration,
  surahName,
  ayahNumber,
  reciterName = "Mishary Alafasy",
  playbackRate,
  onPlaybackRateChange
}) => {
  const { t } = useAppContext();

  // Format seconds to MM:SS
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for background gradient
  // Ensure we don't divide by zero
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[700px] z-50 animate-slide-up origin-bottom">
      <style>{`
        :root {
          --player-track-color: #E5E7EB;
        }
        .dark {
          --player-track-color: #475569;
        }
        html.dark {
          --player-track-color: #475569;
        }
      `}</style>
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl rounded-2xl h-24 px-6 flex items-center justify-between transition-colors duration-300">
        
        {/* ZONE A: LEFT (Track Info) - Width 25% */}
        <div className="hidden sm:flex w-1/4 flex-col justify-center overflow-hidden">
          <div className="flex items-baseline gap-2 truncate w-full">
            <span className="font-bold text-ink dark:text-slate-100 truncate text-sm leading-tight transition-colors">{surahName}</span>
            <span className="text-xs font-bold text-sage whitespace-nowrap shrink-0">{t('ayah')} {ayahNumber}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:text-slate-400 truncate w-full mt-0.5 transition-colors">
            {reciterName}
          </span>
        </div>

        {/* ZONE B: CENTER (Controls & Scrubber) - Width 50% (Desktop) / Flex-1 (Mobile) */}
        <div className="flex-1 sm:w-2/4 flex flex-col items-center justify-center gap-2 min-w-0">
          
          {/* Controls Row */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={onPrev} 
              className="text-ink-muted dark:text-slate-400 hover:text-sage dark:hover:text-sage transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0 flex items-center justify-center"
              aria-label="Previous Ayah"
            >
              <span className="material-symbols-outlined text-3xl leading-none">skip_previous</span>
            </button>
            
            <button 
              onClick={onPlayPause}
              className="w-12 h-12 flex items-center justify-center bg-sage hover:bg-sage-dark rounded-full text-white shadow-md transition-colors shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="material-symbols-outlined filled text-2xl leading-none">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button 
              onClick={onNext}
              className="text-ink-muted dark:text-slate-400 hover:text-sage dark:hover:text-sage transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0 flex items-center justify-center"
              aria-label="Next Ayah"
            >
              <span className="material-symbols-outlined text-3xl leading-none">skip_next</span>
            </button>
          </div>

          {/* Scrubber Row */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-medium text-ink-muted dark:text-slate-400 tabular-nums w-8 text-right shrink-0 transition-colors">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              step="0.01" 
              onChange={onSeek}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer focus:outline-none bg-gray-200 dark:bg-slate-600"
              style={{
                background: `linear-gradient(to right, #6B8E88 0%, #6B8E88 ${progressPercent}%, var(--player-track-color) ${progressPercent}%, var(--player-track-color) 100%)`
              }}
            />

            <span className="text-[10px] font-medium text-ink-muted dark:text-slate-400 tabular-nums w-8 text-left shrink-0 transition-colors">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ZONE C: RIGHT (Actions & Close) - Width 25% */}
        <div className="w-auto sm:w-1/4 flex items-center justify-end gap-3 shrink-0 pl-4">
          <button 
            onClick={onPlaybackRateChange}
            className="w-16 h-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-sage/20 dark:hover:bg-sage/20 hover:text-sage-dark dark:hover:text-sage text-xs font-bold text-ink dark:text-slate-200 transition-colors shrink-0 whitespace-nowrap"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-muted dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
            aria-label="Close Player"
          >
            <span className="material-symbols-outlined text-xl leading-none">close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
