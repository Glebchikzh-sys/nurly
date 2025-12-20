
import React from 'react';
import { ViewState } from '../types';
import { useAppLogic } from '../hooks/useAppLogic';
import { Skeleton } from './Skeleton';

interface HomeViewProps {
  onChangeView: (view: ViewState['currentView']) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onChangeView }) => {
  const { 
    status,
    locationName, 
    formattedDate, 
    hijriDate, 
    nextPrayer, 
    prayerSchedule 
  } = useAppLogic();

  // Loading State
  if (status === 'loading') {
    return (
      <div className="flex flex-col px-6 pt-12 gap-8 w-full max-w-7xl mx-auto">
         <div className="flex flex-col gap-2">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-32 h-4 rounded-md" />
         </div>
         <div className="w-full h-[300px] bg-black/5 rounded-[2.5rem] animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 pt-12 pb-28 md:px-12 md:pt-16 md:pb-12 animate-fade-in max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 md:mb-12">
        <div className="group cursor-default">
          <h1 className="text-2xl md:text-4xl font-extrabold text-ink dark:text-slate-100 tracking-tight transition-colors group-hover:text-sage-dark dark:group-hover:text-sage">Assalamu Alaikum</h1>
          <p className="text-ink-muted dark:text-slate-400 text-sm md:text-base font-medium mt-1 transition-colors">{formattedDate}</p>
        </div>
        <div className="text-right cursor-default">
          <span className="text-[10px] md:text-xs font-bold uppercase text-ink-muted dark:text-slate-400 tracking-widest block mb-0.5 transition-colors">Hijri</span>
          <span className="text-sm md:text-lg font-bold text-ink dark:text-slate-100 transition-colors">{hijriDate}</span>
          <div className="text-[10px] text-sage font-bold uppercase mt-1 flex items-center justify-end gap-1">
             <span className="material-symbols-outlined text-[12px]">location_on</span>
             {locationName}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* Timer Card */}
        <div className="md:col-span-2 relative w-full bg-sage dark:bg-gradient-to-br dark:from-teal-900 dark:via-slate-900 dark:to-black rounded-[2.5rem] shadow-soft dark:shadow-black/20 border-transparent overflow-hidden text-center py-12 px-6 flex flex-col justify-center min-h-[300px] group cursor-default transition-all duration-500 hover:shadow-xl">
          <div className="relative z-10">
            <h2 className="text-white/90 text-xs font-bold tracking-[0.25em] uppercase mb-4">
              Upcoming Prayer
            </h2>
            <div className="flex items-baseline justify-center text-white leading-none mb-4">
              <span className="text-[4rem] md:text-[6rem] font-bold tracking-tighter tabular-nums drop-shadow-sm">
                {nextPrayer.remaining}
              </span>
            </div>
            <p className="text-white text-lg md:text-2xl font-medium">
              {nextPrayer.name} at {nextPrayer.time}
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-colors duration-700 group-hover:bg-white/15"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 dark:bg-black/20 rounded-full blur-2xl transition-colors duration-700 group-hover:bg-black/10"></div>
        </div>

        {/* Schedule List */}
        <div className="md:col-span-1 md:row-span-2">
           <h3 className="md:hidden text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest mb-4 pl-2 opacity-70 transition-colors">Today's Prayers</h3>
          <div className="md:bg-white md:dark:bg-black/20 md:dark:backdrop-blur-sm md:p-6 md:rounded-[2.5rem] md:shadow-soft md:border md:border-black/5 md:dark:border-white/5 h-full flex flex-col gap-2 transition-all duration-300 md:hover:shadow-lg">
             <h3 className="hidden md:block text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest mb-6 opacity-70 px-2 transition-colors">Prayer Schedule</h3>
            {prayerSchedule.map((prayer, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-4 rounded-2xl transition-colors duration-200 cursor-default ${
                  prayer.isNext 
                    ? 'bg-sage/10 dark:bg-teal-900/30 text-sage-dark dark:text-teal-400 shadow-sm' 
                    : prayer.isPast 
                      ? 'text-ink-muted/60 dark:text-slate-500' 
                      : 'text-ink dark:text-slate-200 hover:bg-sage/5 dark:hover:bg-white/5 hover:shadow-sm'
                }`}
              >
                <span className="text-lg font-bold">{prayer.name}</span>
                <span className="text-lg font-bold tabular-nums opacity-90">{prayer.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div className="md:col-span-2">
          <h3 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest mb-4 pl-2 opacity-70 transition-colors">Utilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <button 
              onClick={() => onChangeView('qibla')}
              className="bg-white dark:bg-black/20 dark:backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-start gap-3 transition-all duration-300 hover:shadow-lg hover:border-sage/30 dark:hover:border-sage/30 group cursor-pointer"
            >
              <div className="text-sage group-hover:text-sage-dark dark:text-teal-400 dark:group-hover:text-teal-300 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">explore</span>
              </div>
              <span className="font-bold text-ink dark:text-slate-100 text-lg transition-colors">Qibla</span>
            </button>
            <button 
              onClick={() => onChangeView('tasbih')}
              className="bg-white dark:bg-black/20 dark:backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-start gap-3 transition-all duration-300 hover:shadow-lg hover:border-sage/30 dark:hover:border-sage/30 group cursor-pointer"
            >
              <div className="text-sage group-hover:text-sage-dark dark:text-teal-400 dark:group-hover:text-teal-300 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">scatter_plot</span>
              </div>
              <span className="font-bold text-ink dark:text-slate-100 text-lg transition-colors">Tasbih</span>
            </button>
            <button 
              onClick={() => onChangeView('saved')}
              className="bg-white dark:bg-black/20 dark:backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-start gap-3 transition-all duration-300 hover:shadow-lg hover:border-sage/30 dark:hover:border-sage/30 group cursor-pointer col-span-2 md:col-span-1"
            >
              <div className="text-sage group-hover:text-sage-dark dark:text-teal-400 dark:group-hover:text-teal-300 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">bookmarks</span>
              </div>
              <span className="font-bold text-ink dark:text-slate-100 text-lg transition-colors">Saved Verses</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
