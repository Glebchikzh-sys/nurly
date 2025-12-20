
import React from 'react';
import { ViewState } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  currentView: ViewState['currentView'];
  onChangeView: (view: ViewState['currentView']) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { t } = useAppContext();
  
  const navItems = [
    { id: 'home', label: t('home'), icon: 'home' },
    { id: 'quran', label: t('quran'), icon: 'menu_book' },
    { id: 'qibla', label: t('qibla'), icon: 'explore' },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col justify-between bg-cream dark:bg-slate-900 border-r border-black/5 dark:border-slate-800 py-8 px-6 h-full z-50 shrink-0 select-none transition-colors duration-300 rtl:border-r-0 rtl:border-l">
      <div>
        {/* Logo */}
        <div className="mb-12 px-4 cursor-default group">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink dark:text-slate-100 group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Nurly</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = item.id === currentView || (item.id === 'quran' && currentView === 'reading');
            
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState['currentView'])}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group text-start relative overflow-hidden ${
                  isActive 
                    ? 'bg-sage/10 dark:bg-teal-900/30 text-sage-dark dark:text-sage shadow-none' 
                    : 'text-ink-muted dark:text-slate-400 hover:bg-sage/10 dark:hover:bg-slate-800 hover:text-sage-dark dark:hover:text-sage'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] transition-colors ${isActive ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div>
        <button
          onClick={() => onChangeView('settings')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group text-start ${
            currentView === 'settings'
              ? 'bg-sage/10 dark:bg-teal-900/30 text-sage-dark dark:text-sage shadow-none' 
              : 'text-ink-muted dark:text-slate-400 hover:bg-sage/10 dark:hover:bg-slate-800 hover:text-sage-dark dark:hover:text-sage'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] transition-colors ${currentView === 'settings' ? 'filled' : ''}`}>
            settings
          </span>
          <span className="font-bold text-sm tracking-wide">
            {t('settings')}
          </span>
        </button>
      </div>
    </div>
  );
};
