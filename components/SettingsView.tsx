
import React from 'react';
import { CustomSelect } from './CustomSelect';
import { useAppContext } from '../contexts/AppContext';
import { ViewState } from '../types';
import { RECITERS } from '../constants';

interface SettingsViewProps {
  onChangeView: (view: ViewState['currentView']) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onChangeView }) => {
  const { settings, updateSettings } = useAppContext();

  const calculationOptions = [
    { value: "MuslimWorldLeague", label: "Muslim World League" },
    { value: "Egyptian", label: "Egyptian General Authority" },
    { value: "Karachi", label: "University of Islamic Sciences, Karachi" },
    { value: "UmmAlQura", label: "Umm al-Qura University, Makkah" },
    { value: "Dubai", label: "Dubai" },
    { value: "MoonsightingCommittee", label: "Moonsighting Committee" },
    { value: "NorthAmerica", label: "ISNA (North America)" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Qatar", label: "Qatar" },
    { value: "Singapore", label: "Singapore" },
    { value: "Turkey", label: "Turkey" },
    { value: "Tehran", label: "Tehran" }
  ];

  const madhabOptions = [
    { value: "Shafi", label: "Standard (Shafi, Maliki, Hanbali)" },
    { value: "Hanafi", label: "Hanafi" }
  ];

  // Map reciters to select options
  const reciterOptions = RECITERS.map(r => ({ value: r.id, label: r.name }));

  const handleReciterChange = (id: string) => {
    const selectedReciter = RECITERS.find(r => r.id === id);
    if (selectedReciter) {
      updateSettings('activeReciter', selectedReciter);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 animate-fade-in max-w-4xl mx-auto w-full transition-colors duration-300">
       <div className="px-6 pt-14 pb-8 md:pt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink dark:text-slate-100">Settings</h1>
      </div>

      <div className="px-6 flex flex-col gap-8 pb-24">
        
        {/* Privacy Assurance Block */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-black/5 dark:border-white/5 text-center transition-colors">
            <p className="text-sm font-medium text-ink-muted dark:text-slate-400">
                Nurly is anonymous. No accounts. No tracking. All data stays on your device.
            </p>
        </div>
        
        {/* PRAYER SETTINGS */}
        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-60">Prayer Calculation</h2>
             <div className="bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5 transition-colors">
                
                {/* Calculation Method */}
                <div className="flex flex-col p-5 border-b border-gray-100 dark:border-white/5 first:rounded-t-[24px]">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">Calculation Method</label>
                    <CustomSelect 
                        value={settings.calculationMethod} 
                        onChange={(v) => updateSettings('calculationMethod', v)} 
                        options={calculationOptions} 
                    />
                </div>

                {/* Madhab */}
                <div className="flex flex-col p-5 last:rounded-b-[24px]">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">Asr Method (Madhab)</label>
                    <CustomSelect 
                        value={settings.madhab} 
                        onChange={(v) => updateSettings('madhab', v)} 
                        options={madhabOptions} 
                    />
                </div>
             </div>
        </div>

        {/* GENERAL SETTINGS */}
        <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-60">General</h2>
            <div className="bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                
                {/* Reciter Select */}
                <div className="flex flex-col p-5 border-b border-gray-100 dark:border-white/5">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">Quran Recitation</label>
                    <CustomSelect 
                        value={settings.activeReciter.id} 
                        onChange={handleReciterChange} 
                        options={reciterOptions} 
                    />
                </div>

                {/* Toggle Item: Sound */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => updateSettings('soundEnabled', !settings.soundEnabled)}>
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Notification Sounds</span>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.soundEnabled ? 'bg-sage' : 'bg-gray-200 dark:bg-slate-600'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>

                {/* Toggle Item: Location */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => updateSettings('locationEnabled', !settings.locationEnabled)}>
                    <div className="flex flex-col">
                        <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Location Access</span>
                        <span className="text-xs text-ink-muted dark:text-slate-400 font-medium">For precise prayer times</span>
                    </div>
                     <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.locationEnabled ? 'bg-sage' : 'bg-gray-200 dark:bg-slate-600'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.locationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>

                 {/* Toggle Item: Dark Mode */}
                 <div className="flex items-center justify-between p-5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => updateSettings('darkMode', !settings.darkMode)}>
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Dark Mode</span>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.darkMode ? 'bg-sage' : 'bg-gray-200 dark:bg-slate-600'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-60">About</h2>
             <div className="bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                <button 
                  onClick={() => onChangeView('privacy')}
                  className="w-full flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors text-left cursor-pointer group"
                >
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Privacy Policy</span>
                    <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors">chevron_right</span>
                </button>
                <button 
                  onClick={() => onChangeView('terms')}
                  className="w-full flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors text-left cursor-pointer group"
                >
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Terms of Service</span>
                    <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors">chevron_right</span>
                </button>
                <button 
                  onClick={() => onChangeView('donation')}
                  className="w-full flex items-center justify-between p-5 active:bg-gray-50 dark:active:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors text-left cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-ink-muted/70 dark:text-slate-400 text-2xl group-hover:text-sage transition-colors">volunteer_activism</span>
                        <div className="flex flex-col">
                            <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">Support Nurly (Optional)</span>
                            <span className="text-xs text-ink-muted dark:text-slate-400 font-medium">Anonymous crypto donation</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors">chevron_right</span>
                </button>
             </div>
        </div>

        <div className="text-center py-4">
            <p className="text-ink-muted dark:text-slate-500 text-sm font-medium opacity-50">nurly v1.1.0</p>
        </div>
      </div>
    </div>
  );
};
