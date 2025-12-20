
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, Bookmark } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { Skeleton } from './Skeleton';
import { useAppContext } from '../contexts/AppContext';

interface ReadingViewProps {
  surah: Surah;
  onBack: () => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (bookmark: Bookmark) => void;
  initialAyahIndex?: number; // For deep linking
}

// Sub-component for optimistic UI updates on bookmarks
const BookmarkButton: React.FC<{
  isBookmarked: boolean;
  onToggle: () => void;
}> = ({ isBookmarked: initialIsBookmarked, onToggle }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Immediate optimistic update
    setIsBookmarked(!isBookmarked);
    onToggle();
  };

  return (
    <button 
      onClick={handleClick}
      className="p-3 -mr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none group"
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      title={isBookmarked ? "Remove Bookmark" : "Bookmark Ayah"}
    >
      <span 
          className={`material-symbols-outlined text-[28px] transition-all duration-200 ${
              isBookmarked 
              ? 'filled text-sage drop-shadow-sm' 
              : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
          }`}
      >
          bookmark
      </span>
    </button>
  );
};

export const ReadingView: React.FC<ReadingViewProps> = ({ surah, onBack, isBookmarked, toggleBookmark, initialAyahIndex = -1 }) => {
  const { settings } = useAppContext();
  
  // Data State
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio & UI State
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(initialAyahIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Audio Engine Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  // Use the activeReciter object
  const activeReciter = settings.activeReciter;

  // 1. Initialize Audio Engine (Headless)
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // 2. Fetch Surah Details
  useEffect(() => {
    const fetchSurahDetails = async () => {
      setIsLoading(true);
      setError(null);
      setAyahs([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      try {
        // Only fetch text data (Quran & Translation)
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,en.asad`
        );
        
        if (!response.ok) throw new Error('Failed to load Surah');
        
        const data = await response.json();
        const arabicData = data.data[0].ayahs;
        const englishData = data.data[1].ayahs;

        // Helper to format ID for EveryAyah (e.g., 001001)
        const formatId = (num: number) => String(num).padStart(3, '0');
        const surahId = formatId(surah.number);

        const combinedAyahs: Ayah[] = arabicData.map((ayah: any, index: number) => {
            const ayahId = formatId(ayah.numberInSurah);
            // Construct dynamic URL based on selected reciter subfolder
            const audioUrl = `https://everyayah.com/data/${activeReciter.subfolder}/${surahId}${ayahId}.mp3`;

            return {
                ...ayah,
                translation: englishData[index].text,
                audio: audioUrl,
            };
        });

        setAyahs(combinedAyahs);
        setIsLoading(false);
        
        // If coming from a bookmark, set the index after loading
        if (initialAyahIndex !== -1) {
            setActiveAyahIndex(initialAyahIndex);
        } else {
            setActiveAyahIndex(-1);
        }

      } catch (err) {
        setError("Unable to load chapter.");
        setIsLoading(false);
      }
    };

    fetchSurahDetails();
  }, [surah, activeReciter.subfolder]); // Re-run if reciter subfolder changes

  // 3. Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setActiveAyahIndex((current) => {
        if (current < ayahs.length - 1) {
          return current + 1; // Advance to next, triggering orchestration
        } else {
          setIsPlaying(false);
          return -1; // Reset
        }
      });
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audio.duration);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [ayahs.length]);

  // 4. Playback Orchestration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Handle "Start from beginning"
    if (isPlaying && activeAyahIndex === -1 && ayahs.length > 0) {
      setActiveAyahIndex(0);
      return; 
    }

    // Helper: Safe Play
    const safePlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === 'AbortError' || error.message.includes('interrupted')) {
            // Safe to ignore
          } else {
            console.error('Playback error:', error);
            setIsPlaying(false);
          }
        });
      }
    };

    if (activeAyahIndex >= 0 && activeAyahIndex < ayahs.length) {
      const targetUrl = ayahs[activeAyahIndex].audio;

      // If source changes (e.g. reciter change or next ayah), load new source
      if (audio.src !== targetUrl) {
        audio.pause();
        audio.src = targetUrl;
        audio.load();
        audio.playbackRate = playbackRate; // Maintain rate
      }

      if (isPlaying) {
        safePlay();
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [activeAyahIndex, isPlaying, ayahs, playbackRate]);

  // 5. Auto Scroll
  useEffect(() => {
    if (!isLoading && activeAyahRef.current) {
        const timer = setTimeout(() => {
            activeAyahRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [activeAyahIndex, isLoading]);

  // Actions
  const handleBookmarkClick = (ayah: Ayah) => {
      const id = `${surah.number}:${ayah.numberInSurah}`;
      
      const bookmark: Bookmark = {
          id: id,
          surahNumber: surah.number,
          surahName: surah.englishName,
          ayahNumber: ayah.numberInSurah,
          textPreview: ayah.translation,
          timestamp: Date.now()
      };
      
      toggleBookmark(bookmark);
  };

  const skipNext = () => {
    if (activeAyahIndex < ayahs.length - 1) setActiveAyahIndex(prev => prev + 1);
  };

  const skipPrev = () => {
    if (activeAyahIndex > 0) setActiveAyahIndex(prev => prev - 1);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
        audioRef.current.currentTime = time;
    }
  };

  const handleClosePlayer = () => {
      setIsPlaying(false);
      setActiveAyahIndex(-1);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  const togglePlaybackRate = () => {
      const rates = [1, 1.25, 1.5, 2];
      const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
      setPlaybackRate(next);
      if (audioRef.current) audioRef.current.playbackRate = next;
  };

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden w-full">
      {/* Header */}
      <div className="sticky top-0 w-full z-40 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-4 h-16 flex items-center justify-between shrink-0 transition-colors">
        <button 
          onClick={onBack}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="hidden md:block w-10"></div>

        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-tight text-ink dark:text-slate-100">{surah.englishName}</h1>
          <span className="text-[10px] text-sage font-bold uppercase tracking-widest">{surah.englishNameTranslation}</span>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-40 px-4 md:px-8 pt-8">
        
        {isLoading ? (
            <div className="max-w-[800px] mx-auto flex flex-col gap-8">
                {/* Bismillah Skeleton */}
                <div className="flex justify-center mb-12 mt-4">
                     <Skeleton className="h-12 w-64 rounded-xl" />
                </div>
                
                {/* Ayah Card Skeletons */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col gap-6 py-10 px-4 md:px-8 rounded-3xl border border-transparent">
                        <div className="flex justify-between items-center">
                             <Skeleton className="h-6 w-10 rounded-md" /> {/* Number */}
                             <Skeleton className="h-8 w-8 rounded-full" /> {/* Bookmark */}
                        </div>

                        {/* Arabic Blocks */}
                        <div className="flex flex-col items-end gap-3">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-10 w-3/4 rounded-lg" />
                        </div>
                        
                        {/* English Blocks */}
                        <div className="flex flex-col gap-2 mt-4">
                            <Skeleton className="h-5 w-[90%] rounded-md" />
                            <Skeleton className="h-5 w-[80%] rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        ) : error ? (
            <div className="text-center mt-20 text-red-500 font-medium">{error}</div>
        ) : (
            // Spacing fix: gap-8
            <div className="max-w-[800px] mx-auto flex flex-col gap-8">
                <div className="flex justify-center mb-12 mt-4">
                    <p className="font-serif text-3xl text-sage select-none">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                </div>

                {ayahs.map((ayah, index) => {
                    const isActive = index === activeAyahIndex;
                    const id = `${surah.number}:${ayah.numberInSurah}`;
                    const bookmarked = isBookmarked(id);
                    
                    return (
                        <div 
                            key={ayah.number}
                            ref={isActive ? activeAyahRef : null}
                            onClick={() => {
                                setActiveAyahIndex(index);
                                setIsPlaying(true);
                            }}
                            className={`flex flex-col gap-6 py-10 px-4 md:px-8 rounded-3xl transition-colors duration-500 cursor-pointer group border border-transparent ${
                                isActive 
                                  ? 'bg-sage/10 dark:bg-teal-900/50 border-sage/20 dark:border-sage/30' 
                                  : 'bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex justify-between items-center transition-opacity">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                    isActive
                                    ? 'bg-sage text-white'
                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                                }`}>
                                    {ayah.numberInSurah}
                                </span>
                                
                                {/* Optimistic Bookmark Button */}
                                <BookmarkButton 
                                  isBookmarked={bookmarked}
                                  onToggle={() => handleBookmarkClick(ayah)}
                                />
                            </div>

                            <div className="relative w-full text-center md:text-right">
                                <p className={`font-serif text-[2rem] leading-[2.4] transition-colors ${isActive ? 'text-black dark:text-slate-100' : 'text-black dark:text-slate-100'}`} dir="rtl" lang="ar">
                                    {ayah.text}
                                </p>
                            </div>

                            <div className="w-full text-center md:text-left">
                                <p className={`text-lg leading-relaxed font-medium transition-colors ${isActive ? 'text-gray-800 dark:text-slate-200' : 'text-gray-600 dark:text-slate-300'}`}>
                                    {ayah.translation}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* New Audio Player Dock */}
      {activeAyahIndex !== -1 && (
        <AudioPlayer 
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={skipNext}
          onPrev={skipPrev}
          onClose={handleClosePlayer}
          onSeek={handleSeek}
          currentTime={currentTime}
          duration={duration}
          surahName={surah.englishName}
          ayahNumber={ayahs[activeAyahIndex]?.numberInSurah || 0}
          reciterName={activeReciter.name}
          playbackRate={playbackRate}
          onPlaybackRateChange={togglePlaybackRate}
        />
      )}
      
      {/* Gradients */}
      <div className="absolute top-16 left-0 w-full h-12 bg-gradient-to-b from-cream dark:from-slate-900 to-transparent pointer-events-none z-30 transition-colors duration-300"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cream dark:from-slate-900 via-cream/80 dark:via-slate-900/80 to-transparent pointer-events-none z-30 transition-colors duration-300"></div>
    </div>
  );
};
