
import React from 'react';
import { Bookmark } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface SavedVersesViewProps {
  bookmarks: Bookmark[];
  onRemove: (id: string) => void;
  onNavigate: (bookmark: Bookmark) => void;
  onBack: () => void;
}

export const SavedVersesView: React.FC<SavedVersesViewProps> = ({ bookmarks, onRemove, onNavigate, onBack }) => {
  const { t } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 animate-fade-in relative transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 w-full z-40 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-6 pt-12 md:pt-8 md:px-12 pb-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-slate-200 transition-colors p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rtl:rotate-180"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink dark:text-slate-100">{t('saved_verses')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4 text-ink-muted dark:text-slate-600">bookmark_border</span>
            <p className="text-ink dark:text-slate-200 font-bold text-lg">{t('no_saved')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id}
                onClick={() => onNavigate(bookmark)}
                className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-soft border border-black/5 dark:border-white/5 group cursor-pointer hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-sage uppercase tracking-widest mb-1">
                      Surah {bookmark.surahNumber}
                    </span>
                    <h3 className="text-xl font-bold text-ink dark:text-slate-100 group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">
                      {bookmark.surahName} <span className="text-ink-muted dark:text-slate-400 font-medium ml-1">:{bookmark.ayahNumber}</span>
                    </h3>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(bookmark.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-ink-muted/50 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
                    title={t('delete')}
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>

                <p className="text-ink-muted dark:text-slate-300 text-sm leading-relaxed line-clamp-2 font-medium transition-colors">
                  {bookmark.textPreview}
                </p>

                <div className="flex items-center gap-1 mt-4 text-sage text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>{t('go_to_verse')}</span>
                  <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
