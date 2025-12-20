
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, Prayer } from 'adhan';
import { AppContextType, AppSettings, LocationState, Reciter, Language } from '../types';
import { LocationPermissionRequest } from '../components/LocationPermissionRequest';
import { TRANSLATIONS } from '../constants';

// --- Safe Constants ---
const DEFAULT_COORDS = { lat: 21.4225, lng: 39.8262 }; // Makkah
const DEFAULT_LOCATION_NAME = "Makkah (Default)";

const DEFAULT_RECITER: Reciter = { 
  id: 'ar.alafasy', 
  name: 'Mishary Rashid Alafasy', 
  subfolder: 'Alafasy_64kbps' 
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'Shafi',
  soundEnabled: true,
  locationEnabled: true,
  darkMode: false,
  activeReciter: DEFAULT_RECITER,
  realCompassEnabled: false,
};

// --- Storage Helper ---
const getStorageItem = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    if (typeof fallback === 'boolean') return (item === 'true') as unknown as T;
    if (typeof fallback === 'object') {
       try {
         return JSON.parse(item) as T;
       } catch (e) {
         return fallback;
       }
    }
    return item as unknown as T;
  } catch (e) {
    return fallback;
  }
};

const setStorageItem = (key: string, value: any) => {
  try {
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, val);
  } catch (e) {}
};

const getSystemDarkMode = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    language: getStorageItem('nurly_lang', DEFAULT_SETTINGS.language),
    calculationMethod: getStorageItem('nurly_calc', DEFAULT_SETTINGS.calculationMethod),
    madhab: getStorageItem('nurly_madhab', DEFAULT_SETTINGS.madhab),
    soundEnabled: getStorageItem('nurly_sound', DEFAULT_SETTINGS.soundEnabled),
    locationEnabled: getStorageItem('nurly_loc', DEFAULT_SETTINGS.locationEnabled),
    darkMode: getStorageItem('nurly_dark', getSystemDarkMode()),
    activeReciter: getStorageItem('nurly_reciter_obj', DEFAULT_SETTINGS.activeReciter),
    realCompassEnabled: getStorageItem('nurly_real_compass', DEFAULT_SETTINGS.realCompassEnabled),
  });

  const [location, setLocation] = useState<LocationState>(() => {
    const savedManual = getStorageItem<{lat: number, lng: number, name: string} | null>('nurly_manual_location', null);
    if (savedManual) {
      return { ...savedManual, isDefault: false, isManual: true, error: null };
    }
    return { lat: 0, lng: 0, name: 'Initializing...', isDefault: false, isManual: false, error: null };
  });
  
  const [now, setNow] = useState<Date>(new Date());
  const [isReady, setIsReady] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean>(true);
  const [isPromptCheckDone, setIsPromptCheckDone] = useState(false);

  useEffect(() => {
    const seen = getStorageItem('nurly_has_seen_location_prompt', false);
    setHasSeenPrompt(seen);
    setIsPromptCheckDone(true);
  }, []);

  // Theme Handling
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Language & RTL Handling
  useEffect(() => {
    const lang = settings.language;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  const updateSettings = useCallback((key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    let storageKey = '';
    switch(key) {
      case 'language': storageKey = 'nurly_lang'; break;
      case 'calculationMethod': storageKey = 'nurly_calc'; break;
      case 'madhab': storageKey = 'nurly_madhab'; break;
      case 'soundEnabled': storageKey = 'nurly_sound'; break;
      case 'locationEnabled': storageKey = 'nurly_loc'; break;
      case 'darkMode': storageKey = 'nurly_dark'; break;
      case 'activeReciter': storageKey = 'nurly_reciter_obj'; break;
      case 'realCompassEnabled': storageKey = 'nurly_real_compass'; break;
    }
    if (storageKey) setStorageItem(storageKey, value);
  }, []);

  // Translation Helper
  const t = useCallback((key: string): string => {
    const lang = settings.language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  }, [settings.language]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number, name: string) => {
    const newLoc = { lat, lng, name, isDefault: false, isManual: true, error: null };
    setLocation(newLoc);
    setStorageItem('nurly_manual_location', { lat, lng, name });
    updateSettings('locationEnabled', false);
    setStorageItem('nurly_has_seen_location_prompt', true);
    setHasSeenPrompt(true);
    setIsReady(true);
  }, [updateSettings]);

  const setLocationAuto = useCallback(() => {
    localStorage.removeItem('nurly_manual_location');
    updateSettings('locationEnabled', true);
    setLocation(prev => ({ ...prev, isManual: false }));
  }, [updateSettings]);

  const refreshLocation = useCallback(() => {
    if (location.isManual) {
      setIsReady(true);
      return;
    }

    if (!settings.locationEnabled) {
      setLocation({
        ...DEFAULT_COORDS,
        name: DEFAULT_LOCATION_NAME,
        isDefault: true,
        isManual: false,
        error: "Location disabled"
      });
      setIsReady(true);
      return;
    }

    if (!navigator.geolocation) {
      setLocation({
        ...DEFAULT_COORDS,
        name: DEFAULT_LOCATION_NAME,
        isDefault: true,
        isManual: false,
        error: "Not supported"
      });
      setIsReady(true);
      return;
    }

    // HIGH ACCURACY OPTIONS FOR MOBILE
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Current Location",
          isDefault: false,
          isManual: false,
          error: null
        });
        setIsReady(true);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocation({
          ...DEFAULT_COORDS,
          name: DEFAULT_LOCATION_NAME,
          isDefault: true,
          isManual: false,
          error: "Access denied"
        });
        setIsReady(true);
      },
      geoOptions
    );
  }, [settings.locationEnabled, location.isManual]);

  useEffect(() => {
    if (isPromptCheckDone && hasSeenPrompt) {
      refreshLocation();
    }
  }, [refreshLocation, hasSeenPrompt, isPromptCheckDone]);

  const { prayerTimes, nextPrayerIndex } = useMemo(() => {
    if (location.lat === 0 && location.lng === 0) {
      return { prayerTimes: null, nextPrayerIndex: -1 };
    }

    try {
      const coords = new Coordinates(location.lat, location.lng);
      let params = CalculationMethod.MuslimWorldLeague();
      // @ts-ignore
      if (CalculationMethod[settings.calculationMethod]) {
         // @ts-ignore
         params = CalculationMethod[settings.calculationMethod]();
      }
      params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
      const times = new PrayerTimes(coords, now, params);
      const next = times.nextPrayer();
      let nextIndex = -1;
      switch(next) {
        case Prayer.Fajr: nextIndex = 0; break;
        case Prayer.Sunrise: nextIndex = 1; break;
        case Prayer.Dhuhr: nextIndex = 2; break;
        case Prayer.Asr: nextIndex = 3; break;
        case Prayer.Maghrib: nextIndex = 4; break;
        case Prayer.Isha: nextIndex = 5; break;
      }
      return { prayerTimes: times, nextPrayerIndex: nextIndex };
    } catch (e) {
      return { prayerTimes: null, nextPrayerIndex: -1 };
    }
  }, [location.lat, location.lng, settings.calculationMethod, settings.madhab, now]);

  const handleAllowLocation = () => {
    setStorageItem('nurly_has_seen_location_prompt', true);
    setHasSeenPrompt(true);
  };

  if (!isPromptCheckDone) {
     return (
      <div className="flex h-screen w-screen bg-[#FAFAF9] items-center justify-center">
         <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-[#6B8E88] rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-white text-2xl">light_mode</span>
            </div>
         </div>
      </div>
    );
  }

  if (!hasSeenPrompt) {
    return (
      <LocationPermissionRequest 
        onAllow={handleAllowLocation} 
        onManual={(lat, lng, name) => setManualLocation(lat, lng, name)} 
      />
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen bg-[#FAFAF9] items-center justify-center">
         <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-[#6B8E88] rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-white text-2xl">light_mode</span>
            </div>
            <p className="text-[#6B8E88] font-bold tracking-widest text-xs uppercase">Initializing...</p>
         </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      t,
      location,
      refreshLocation,
      setManualLocation,
      setLocationAuto,
      prayerTimes,
      nextPrayerIndex,
      now,
      isReady
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppContextProvider");
  return context;
};
