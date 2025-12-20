
import React from 'react';
import { ViewState } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface BottomNavProps {
  currentView: ViewState['currentView'];
  onChangeView: (view: ViewState['currentView']) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const { t } = useAppContext();

  const navItems = [
    { id: 'home', label: t('home'), icon: 'home' },
    { id: 'quran', label: t('quran'), icon: 'menu_book' },
    { id: 'qibla', label: t('qibla'), icon: 'explore' },
    { id: 'settings', label: t('settings'), icon: 'settings' },
  ];

  if (currentView === 'tasbih' || currentView === 'reading') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-black/5 dark:border-white/5 pb-safe z-50 md:hidden transition-colors duration-300">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.id === currentView;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState['currentView'])}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 group ${
                isActive 
                  ? 'text-sage dark:text-teal-400' 
                  : 'text-ink-muted dark:text-slate-500 hover:text-ink dark:hover:text-slate-300'
              }`}
            >
              <span className={`material-symbols-outlined text-[28px] ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
