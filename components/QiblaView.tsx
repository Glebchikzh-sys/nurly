
import React from 'react';
import { QiblaCompass } from './QiblaCompass';

interface QiblaViewProps {
  onBack?: () => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 relative transition-colors duration-300">
      {/* Header */}
      {onBack && (
        <div className="absolute top-0 w-full z-40 px-6 pt-12 md:pt-8 md:px-12">
            <button 
            onClick={onBack}
            className="text-ink dark:text-slate-100 hover:text-sage dark:hover:text-sage transition-colors p-2 -ml-2 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
            >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
         <div className="w-full max-w-md">
             <QiblaCompass />
         </div>
      </div>
    </div>
  );
};
