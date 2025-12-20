
import React, { useState, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import { useAppContext } from '../contexts/AppContext';
import { ViewState } from '../types';
import { RECITERS } from '../constants';

interface CityResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country: string;
    state?: string;
  }
}

interface SettingsViewProps {
  onChangeView: (view: ViewState['currentView']) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onChangeView }) => {
  const { settings, updateSettings, location, setManualLocation, setLocationAuto, t } = useAppContext();
  const [isChangingCity, setIsChangingCity] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

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

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'ru', label: 'Русский (Russian)' },
    { value: 'tr', label: 'Türkçe (Turkish)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'de', label: 'Deutsch (German)' },
    { value: 'es', label: 'Español (Spanish)' },
  ];

  const reciterOptions = RECITERS.map(r => ({ value: r.id, label: r.name }));

  const handleReciterChange = (id: string) => {
    const selectedReciter = RECITERS.find(r => r.id === id);
    if (selectedReciter) {
      updateSettings('activeReciter', selectedReciter);
    }
  };

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoadingResults(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=10&accept-language=${settings.language}`);
        const data: CityResult[] = await response.json();
        
        // Deduplicate results
        const seen = new Set<string>();
        const uniqueData = data.filter(item => {
            const city = item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0];
            const state = item.address.state || '';
            const country = item.address.country || '';
            const key = `${city}|${state}|${country}`.toLowerCase();
            
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        setResults(uniqueData.slice(0, 5));
      } catch (e) {
        // Silent fail
      } finally {
        setIsLoadingResults(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [query, settings.language]);

  const handleSelectCity = (city: CityResult) => {
    const name = city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0];
    const state = city.address.state ? `, ${city.address.state}` : '';
    const fullName = `${name}${state}, ${city.address.country}`;
    setManualLocation(parseFloat(city.lat), parseFloat(city.lon), fullName);
    setIsChangingCity(false);
    setQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 animate-fade-in max-w-4xl mx-auto w-full transition-colors duration-300">
       <div className="px-6 pt-14 pb-8 md:pt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink dark:text-slate-100">{t('settings')}</h1>
      </div>

      <div className="px-6 flex flex-col gap-8 pb-32">
        
        <div className="bg-sage/10 dark:bg-teal-900/20 rounded-2xl p-5 border border-sage/10 dark:border-white/5 text-center transition-colors">
            <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-sage text-2xl">shield_lock</span>
                <p className="text-sm font-medium text-sage-dark dark:text-sage">
                    {t('privacy_assurance')}
                </p>
            </div>
        </div>

        {/* GENERAL SETTINGS */}
        <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('general')}</h2>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                
                {/* Language Selector */}
                <div className="flex flex-col p-6 border-b border-black/5 dark:border-white/5">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">{t('language')}</label>
                    <CustomSelect 
                        value={settings.language} 
                        onChange={(v) => updateSettings('language', v)} 
                        options={languageOptions} 
                    />
                </div>

                <div className="flex flex-col p-6 border-b border-black/5 dark:border-white/5">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">{t('recitation')}</label>
                    <CustomSelect 
                        value={settings.activeReciter.id} 
                        onChange={handleReciterChange} 
                        options={reciterOptions} 
                    />
                </div>

                <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => updateSettings('soundEnabled', !settings.soundEnabled)}>
                    <div className="flex flex-col gap-1">
                        <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">{t('notifications')}</span>
                    </div>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.soundEnabled ? 'bg-sage' : 'bg-black/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>

                 <div className="flex items-center justify-between p-6 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => updateSettings('darkMode', !settings.darkMode)}>
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">{t('dark_mode')}</span>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.darkMode ? 'bg-sage' : 'bg-black/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>
            </div>
        </div>

        {/* LOCATION SETTINGS */}
        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('location')}</h2>
             <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 transition-colors overflow-hidden">
                
                <div 
                    className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => location.isManual ? setLocationAuto() : updateSettings('locationEnabled', !settings.locationEnabled)}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-ink dark:text-slate-200 font-bold text-lg">{t('auto_detect')}</span>
                    </div>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${!location.isManual && settings.locationEnabled ? 'bg-sage' : 'bg-black/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${!location.isManual && settings.locationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                </div>

                <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-ink dark:text-slate-200 font-bold text-lg">{t('current_city')}</span>
                        <button 
                            onClick={() => setIsChangingCity(!isChangingCity)}
                            className="text-sage font-bold text-sm hover:text-sage-dark transition-colors"
                        >
                            {isChangingCity ? t('cancel') : t('change_city')}
                        </button>
                    </div>
                    
                    {!isChangingCity ? (
                        <div className="flex items-center gap-3 text-ink dark:text-slate-200 font-medium bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-transparent">
                            <span className="material-symbols-outlined text-ink-muted dark:text-slate-400">{location.isManual ? 'edit_location' : 'location_on'}</span>
                            <span className="text-sm truncate">{location.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            <div className="relative">
                                <input 
                                    type="text"
                                    autoFocus
                                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/10 rounded-xl border-none focus:ring-2 focus:ring-sage text-sm font-medium text-ink dark:text-white placeholder-ink-muted/50 transition-all"
                                    placeholder={t('search_city')}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {isLoadingResults && (
                                    <div className="absolute right-3 top-3 rtl:left-3 rtl:right-auto">
                                        <div className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                                {results.map((city, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectCity(city)}
                                        className="w-full text-start p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors group"
                                    >
                                        <p className="text-sm font-bold text-ink dark:text-slate-100 truncate group-hover:text-sage transition-colors">
                                            {city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0]}
                                        </p>
                                        <p className="text-[11px] text-ink-muted dark:text-slate-400 font-medium mt-0.5 truncate">
                                            {city.address.state ? `${city.address.state}, ` : ''}{city.address.country}
                                        </p>
                                    </button>
                                ))}
                                {query.length >= 3 && results.length === 0 && !isLoadingResults && (
                                    <p className="text-center text-xs text-ink-muted py-4">{t('no_results')}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
        
        {/* PRAYER SETTINGS */}
        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('calculation_header')}</h2>
             <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                
                <div className="flex flex-col p-6 border-b border-black/5 dark:border-white/5">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">{t('calc_method')}</label>
                    <CustomSelect 
                        value={settings.calculationMethod} 
                        onChange={(v) => updateSettings('calculationMethod', v)} 
                        options={calculationOptions} 
                    />
                </div>

                <div className="flex flex-col p-6">
                    <label className="text-ink dark:text-slate-200 font-bold text-lg mb-3">{t('asr_method')}</label>
                    <CustomSelect 
                        value={settings.madhab} 
                        onChange={(v) => updateSettings('madhab', v)} 
                        options={madhabOptions} 
                    />
                </div>
             </div>
        </div>

        {/* EXPERIMENTAL SETTINGS */}
        <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('experimental')}</h2>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                <div 
                    className="flex items-center justify-between p-6 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group" 
                    onClick={() => updateSettings('realCompassEnabled', !settings.realCompassEnabled)}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-ink dark:text-slate-200 font-bold text-lg">{t('real_compass')}</span>
                    </div>
                    <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ease-in-out ${settings.realCompassEnabled ? 'bg-sage' : 'bg-black/10 dark:bg-white/10'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${settings.realCompassEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`} />
                    </div>
                </div>
            </div>
        </div>

        {/* SUPPORT DEVELOPMENT */}
        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('support_dev')}</h2>
             <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors p-6 flex flex-col gap-4">
                 <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-sage/10 dark:bg-sage/20 flex items-center justify-center text-sage shrink-0">
                         <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                     </div>
                     <p className="text-sm font-medium text-ink-muted dark:text-slate-300 leading-relaxed pt-1">
                        {t('support_desc')}
                     </p>
                 </div>
                 <button 
                    onClick={() => onChangeView('donation')}
                    className="w-full py-3 border border-sage text-sage dark:text-sage-light font-bold rounded-xl hover:bg-sage hover:text-white dark:hover:text-white transition-all active:scale-95 text-sm uppercase tracking-wide"
                 >
                    {t('support_btn')}
                 </button>
             </div>
        </div>

        <div className="flex flex-col gap-3">
             <h2 className="text-xs font-bold text-ink-muted dark:text-slate-400 uppercase tracking-widest pl-2 opacity-70">{t('about')}</h2>
             <div className="bg-white dark:bg-white/5 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
                <button 
                  onClick={() => onChangeView('privacy')}
                  className="w-full flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-start cursor-pointer group"
                >
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">{t('privacy')}</span>
                    <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors rtl:rotate-180">chevron_right</span>
                </button>
                <button 
                  onClick={() => onChangeView('terms')}
                  className="w-full flex items-center justify-between p-6 active:bg-black/5 dark:active:bg-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-start cursor-pointer group"
                >
                    <span className="text-ink dark:text-slate-200 font-bold text-lg group-hover:text-sage-dark dark:group-hover:text-sage transition-colors">{t('terms')}</span>
                    <span className="material-symbols-outlined text-ink-muted dark:text-slate-400 group-hover:text-sage transition-colors rtl:rotate-180">chevron_right</span>
                </button>
             </div>
        </div>

        <div className="text-center py-4">
            <p className="text-ink-muted dark:text-slate-500 text-sm font-medium opacity-50">nurly v1.1.0</p>
            
            <div className="mt-8 mb-4 text-center">
              <p className="text-xs text-gray-400 opacity-60">Have ideas or found a bug?</p>
              <a 
                href="mailto:islamprchannel@gmail.com" 
                className="text-xs font-medium text-sage hover:underline mt-1 block"
              >
                islamprchannel@gmail.com
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};
