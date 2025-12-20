
import React, { useEffect, useState } from 'react';
import { useQibla } from '../hooks/useQibla';
import { Skeleton } from './Skeleton';

export const QiblaCompass: React.FC = () => {
  const { qiblaAngle, distance, isLoading, error } = useQibla();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCardinalDirection = (angle: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  if (isLoading) {
    return (
       <div className="flex flex-col items-center justify-center animate-pulse gap-8 py-12">
          <div className="w-64 h-64 rounded-full border-4 border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50"></div>
          <div className="flex flex-col items-center gap-2">
             <Skeleton className="w-24 h-8 rounded-lg" />
             <Skeleton className="w-40 h-4 rounded-md" />
          </div>
       </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
           <span className="material-symbols-outlined text-red-500 text-3xl">location_off</span>
        </div>
        <h3 className="text-lg font-bold text-ink dark:text-slate-100 mb-2">Location Required</h3>
        <p className="text-ink-muted dark:text-slate-400 text-sm mb-6 max-w-xs">
           Please enable location access to calculate the Qibla direction.
        </p>
        <button 
           onClick={() => window.location.reload()}
           className="px-6 py-3 bg-sage text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform"
        >
           Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Compass Circle */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-12 select-none">
         {/* Background Ring */}
         <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-soft transition-colors duration-300"></div>
         
         {/* Inner Decor */}
         <div className="absolute inset-4 rounded-full border border-gray-100 dark:border-slate-700/50 border-dashed transition-colors duration-300"></div>

         {/* Cardinal Points */}
         <span className="absolute top-6 font-bold text-xs text-ink-muted/50 dark:text-slate-500 tracking-widest pointer-events-none transition-colors">N</span>
         <span className="absolute bottom-6 font-bold text-xs text-ink-muted/50 dark:text-slate-500 tracking-widest pointer-events-none transition-colors">S</span>
         <span className="absolute left-6 font-bold text-xs text-ink-muted/50 dark:text-slate-500 tracking-widest pointer-events-none transition-colors">W</span>
         <span className="absolute right-6 font-bold text-xs text-ink-muted/50 dark:text-slate-500 tracking-widest pointer-events-none transition-colors">E</span>

         {/* The Needle */}
         <div 
           className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out will-change-transform"
           style={{ transform: `rotate(${qiblaAngle}deg)` }}
         >
            {/* SVG Arrow pointing UP (North) by default */}
            <svg width="80" height="200" viewBox="0 0 100 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
                {/* Needle Body */}
                <path d="M50 0L85 140H15L50 0Z" fill="#6B8E88"/>
                <path d="M50 0L85 140H50V0Z" fill="#4A6A64"/> {/* Shading for depth */}
                
                {/* Counterweight (South side) */}
                <path 
                  d="M50 240L15 140H85L50 240Z" 
                  className="fill-cream dark:fill-slate-700 stroke-gray-200 dark:stroke-slate-600 transition-colors duration-300"
                  strokeWidth="2"
                />
                
                {/* Center Pin */}
                <circle cx="50" cy="140" r="8" className="fill-white dark:fill-slate-200 transition-colors" stroke="#6B8E88" strokeWidth="4"/>
            </svg>
         </div>
      </div>

      {/* Info Display */}
      <div className="flex flex-col items-center text-center cursor-default">
         <h2 className="text-5xl md:text-6xl font-extrabold text-ink dark:text-slate-100 tracking-tight mb-3 tabular-nums leading-none transition-colors">
            {Math.round(qiblaAngle)}° <span className="text-3xl text-ink-muted dark:text-slate-400 align-top transition-colors">{getCardinalDirection(qiblaAngle)}</span>
         </h2>
         <div className="flex items-center gap-2 text-ink-muted dark:text-slate-300 bg-black/5 dark:bg-slate-800 px-4 py-2 rounded-full mt-2 transition-colors">
            <span className="material-symbols-outlined text-lg">mosque</span>
            <span className="text-sm font-bold tracking-wide">{distance.toLocaleString()} km to Makkah</span>
         </div>
      </div>

    </div>
  );
};
