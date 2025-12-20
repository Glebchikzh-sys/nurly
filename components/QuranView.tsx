
import React, { useState, useEffect } from 'react';
import { Surah, Bookmark } from '../types';
import { ReadingView } from './ReadingView';
import { Skeleton } from './Skeleton';
import { useAppContext } from '../contexts/AppContext';

interface QuranViewProps {
  activeSurah?: Surah;
  onSelectSurah: (surah: Surah) => void;
  onBackToList: () => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (bookmark: Bookmark) => void;
  initialAyahIndex?: number;
}

export const QuranView: React.FC<QuranViewProps> = ({ activeSurah, onSelectSurah, onBackToList, isBookmarked, toggleBookmark, initialAyahIndex }) => {
  const { t, settings } = useAppContext();
  const [search, setSearch] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Surah List on Mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        if (!response.ok) throw new Error('Failed to fetch Quran data');
        const data = await response.json();
        setSurahs(data.data);
        setIsLoading(false);
      } catch (err) {
        setError('Could not load Surahs. Please check your connection.');
        setIsLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter(s => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    
    return (
      s.englishName.toLowerCase().includes(query) || 
      s.englishNameTranslation.toLowerCase().includes(query) ||
      s.number.toString() === query ||
      s.number.toString().startsWith(query)
    );
  });

  // Only show the English subtitle ("The Cow", "The Opener") if the app language is English
  const showSubtitle = settings.language === 'en';

  return (
    <div className="flex h-full w-full bg-cream dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {/* LEFT COLUMN: Surah List */}
      <div className={`flex-col h-full bg-cream dark:bg-slate-900 md:w-[30%] md:flex md:border-r md:border-black/5 dark:md:border-white/5 w-full transition-colors duration-300 rtl:border-r-0 rtl:border-l ${activeSurah ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-black/5 dark:border-white/5 px-6 pt-14 md:pt-8 pb-4 shrink-0 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-extrabold text-ink dark:text-slate-100 tracking-tight">{t('quran_reader')}</h2>
          </div>
          
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pr-3 rtl:pl-0">
              <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors">search</span>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 rounded-xl bg-black/5 dark:bg-slate-800 border-none placeholder-ink-muted/70 dark:placeholder-slate-500 text-ink dark:text-slate-100 focus:ring-2 focus:ring-sage transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-inner-soft focus:bg-white dark:focus:bg-slate-700 rtl:pl-3 rtl:pr-10"
              placeholder={t('search_quran')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 px-6 pb-32 md:pb-0 overflow-y-auto custom-scrollbar">
          {isLoading ? (
             <div className="flex flex-col mt-1">
               {/* High fidelity skeleton list */}
               {[...Array(10)].map((_, i) => (
                 <div key={i} className="flex items-center justify-between py-5 px-4 -mx-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-5">
                       {/* Number Box */}
                       <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                       <div className="flex flex-col gap-2">
                          {/* English Name */}
                          <Skeleton className="w-32 h-5 rounded-md" />
                          {/* Translation */}
                          <Skeleton className="w-24 h-3 rounded-sm" />
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       {/* Arabic Name */}
                       <Skeleton className="w-16 h-7 rounded-md" />
                       {/* Verse Count */}
                       <Skeleton className="w-10 h-2 rounded-sm" />
                    </div>
                 </div>
               ))}
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-500 font-bold mb-2">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sage text-white rounded-lg">Retry</button>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredSurahs.map((surah) => {
                const isActive = activeSurah?.number === surah.number;
                return (
                  <button 
                    key={surah.number}
                    onClick={() => onSelectSurah(surah)}
                    className={`flex items-center justify-between py-5 border-b md:border -mx-6 px-6 md:mx-0 md:px-4 md:rounded-xl md:my-1 group transition-colors duration-200 ease-in-out text-start cursor-pointer ${
                      isActive 
                        ? 'bg-[#E6F2F1] dark:bg-teal-900/50 border-sage dark:border-sage/50' 
                        : 'border-black/5 dark:border-white/5 md:border-transparent hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className={`w-8 text-center text-sm font-bold rounded-lg py-1 transition-colors ${isActive ? 'bg-sage text-white' : 'text-ink-muted dark:text-slate-400 bg-black/5 dark:bg-white/5'}`}>
                        {surah.number}
                      </span>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`text-lg font-bold group-hover:text-sage-dark dark:group-hover:text-sage transition-colors ${isActive ? 'text-ink dark:text-slate-100' : 'text-ink dark:text-slate-200'}`}>{surah.englishName}</span>
                        {showSubtitle && (
                          <span className="text-xs text-ink-muted dark:text-slate-400 font-medium">{surah.englishNameTranslation}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold font-serif text-sage transition-colors">{surah.arabicName}</span>
                      <span className="text-[10px] text-ink-muted dark:text-slate-500 mt-1">{surah.numberOfAyahs} Ayahs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Reading View */}
      <div className={`flex-col h-full bg-cream dark:bg-slate-900 md:w-[70%] md:flex w-full transition-colors duration-300 ${activeSurah ? 'flex' : 'hidden'}`}>
        {activeSurah ? (
          <ReadingView 
            surah={activeSurah} 
            onBack={onBackToList}
            isBookmarked={isBookmarked}
            toggleBookmark={toggleBookmark}
            initialAyahIndex={initialAyahIndex}
          />
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 opacity-40 select-none">
            <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="material-symbols-outlined text-sage text-5xl">menu_book</span>
            </div>
            <h3 className="text-2xl font-bold text-ink dark:text-slate-200 mb-2">{t('select_surah')}</h3>
            <p className="text-ink-muted dark:text-slate-400">{t('select_surah_desc')}</p>
          </div>
        )}
      </div>

    </div>
  );
};
