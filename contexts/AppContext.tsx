
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, Prayer } from 'adhan';
import { AppContextType, AppSettings, LocationState, Reciter } from '../types';
import { LocationPermissionRequest } from '../components/LocationPermissionRequest';

// --- Safe Constants ---
const DEFAULT_COORDS = { lat: 21.4225, lng: 39.8262 }; // Makkah
const DEFAULT_LOCATION_NAME = "Makkah (Default)";

const DEFAULT_RECITER: Reciter = { 
  id: 'ar.alafasy', 
  name: 'Mishary Rashid Alafasy', 
  subfolder: 'Alafasy_64kbps' 
};

const DEFAULT_SETTINGS: AppSettings = {
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'Shafi',
  soundEnabled: true,
  locationEnabled: true,
  darkMode: false,
  activeReciter: DEFAULT_RECITER,
};

// --- Storage Helper (The "Shield" against Private Browsing crashes) ---
const getStorageItem = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    // Handle booleans/strings simply, or JSON if needed. 
    // For this app's simple settings, we'll parse basic types.
    if (typeof fallback === 'boolean') return (item === 'true') as unknown as T;
    // Attempt to parse object (for reciter)
    if (typeof fallback === 'object') {
       try {
         return JSON.parse(item) as T;
       } catch (e) {
         return fallback;
       }
    }
    return item as unknown as T;
  } catch (e) {
    console.warn(`Storage access blocked for ${key}`, e);
    return fallback;
  }
};

const setStorageItem = (key: string, value: any) => {
  try {
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
    localStorage.setItem(key, val);
  } catch (e) {
    // Ignore write errors in restricted modes
  }
};

// --- Helper: System Preference ---
const getSystemDarkMode = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// --- Context Definition ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. STATE: Settings (Sync Init)
  const [settings, setSettings] = useState<AppSettings>({
    calculationMethod: getStorageItem('nurly_calc', DEFAULT_SETTINGS.calculationMethod),
    madhab: getStorageItem('nurly_madhab', DEFAULT_SETTINGS.madhab),
    soundEnabled: getStorageItem('nurly_sound', DEFAULT_SETTINGS.soundEnabled),
    locationEnabled: getStorageItem('nurly_loc', DEFAULT_SETTINGS.locationEnabled),
    darkMode: getStorageItem('nurly_dark', getSystemDarkMode()),
    activeReciter: getStorageItem('nurly_reciter_obj', DEFAULT_SETTINGS.activeReciter),
  });

  // 2. STATE: Core Data
  const [location, setLocation] = useState<LocationState>({
    lat: 0,
    lng: 0,
    name: 'Initializing...',
    isDefault: false,
    error: null
  });
  
  const [now, setNow] = useState<Date>(new Date());
  const [isReady, setIsReady] = useState(false);
  
  // Prompt State - Initialized via useEffect to ensure persistence check logic is robust
  const [hasSeenPrompt, setHasSeenPrompt] = useState<boolean>(true); // Default to true to block render until check is done
  const [isPromptCheckDone, setIsPromptCheckDone] = useState(false);

  // 3. EFFECT: Check Prompt Status on Mount
  useEffect(() => {
    const seen = getStorageItem('nurly_has_seen_location_prompt', false);
    setHasSeenPrompt(seen);
    setIsPromptCheckDone(true);
  }, []);

  // 4. EFFECT: Handle Dark Mode Class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // 5. ACTION: Update Settings
  const updateSettings = useCallback((key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    let storageKey = '';
    switch(key) {
      case 'calculationMethod': storageKey = 'nurly_calc'; break;
      case 'madhab': storageKey = 'nurly_madhab'; break;
      case 'soundEnabled': storageKey = 'nurly_sound'; break;
      case 'locationEnabled': storageKey = 'nurly_loc'; break;
      case 'darkMode': storageKey = 'nurly_dark'; break;
      case 'activeReciter': storageKey = 'nurly_reciter_obj'; break;
    }
    if (storageKey) setStorageItem(storageKey, value);
  }, []);

  // 6. LOGIC: Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 7. LOGIC: Geolocation (The "Safe Fallback")
  const refreshLocation = useCallback(() => {
    // If disabled in settings, go straight to default
    if (!settings.locationEnabled) {
      setLocation({
        ...DEFAULT_COORDS,
        name: DEFAULT_LOCATION_NAME,
        isDefault: true,
        error: "Location disabled in settings"
      });
      setIsReady(true);
      return;
    }

    if (!navigator.geolocation) {
      setLocation({
        ...DEFAULT_COORDS,
        name: DEFAULT_LOCATION_NAME,
        isDefault: true,
        error: "Not supported"
      });
      setIsReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Current Location", // In real app, reverse geocode here
          isDefault: false,
          error: null
        });
        setIsReady(true);
      },
      (err) => {
        console.warn("Location failed, using fallback:", err.message);
        setLocation({
          ...DEFAULT_COORDS,
          name: DEFAULT_LOCATION_NAME,
          isDefault: true,
          error: "Access denied"
        });
        setIsReady(true);
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  }, [settings.locationEnabled]);

  // Trigger location only if prompt has been handled (seen)
  useEffect(() => {
    if (isPromptCheckDone && hasSeenPrompt) {
      refreshLocation();
    }
  }, [refreshLocation, hasSeenPrompt, isPromptCheckDone]);

  // 8. LOGIC: Adhan Calculation (Memoized & Protected)
  const { prayerTimes, nextPrayerIndex } = useMemo(() => {
    // Block calculation if location isn't ready (avoid NaN errors)
    if (location.lat === 0 && location.lng === 0) {
      return { prayerTimes: null, nextPrayerIndex: -1 };
    }

    try {
      const coords = new Coordinates(location.lat, location.lng);
      
      // Dynamic Params mapping
      let params = CalculationMethod.MuslimWorldLeague(); // Default
      // @ts-ignore - Adhan types are strict, but we know the string matches the key usually
      if (CalculationMethod[settings.calculationMethod]) {
         // @ts-ignore
         params = CalculationMethod[settings.calculationMethod]();
      }

      params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

      const times = new PrayerTimes(coords, now, params);
      
      // Determine next prayer safely
      const next = times.nextPrayer();
      let nextIndex = -1;
      
      switch(next) {
        case Prayer.Fajr: nextIndex = 0; break;
        case Prayer.Sunrise: nextIndex = 1; break;
        case Prayer.Dhuhr: nextIndex = 2; break;
        case Prayer.Asr: nextIndex = 3; break;
        case Prayer.Maghrib: nextIndex = 4; break;
        case Prayer.Isha: nextIndex = 5; break;
        case Prayer.None: nextIndex = -1; break; // Past Isha
      }

      return { prayerTimes: times, nextPrayerIndex: nextIndex };
    } catch (e) {
      console.error("Adhan Calculation Crashed:", e);
      return { prayerTimes: null, nextPrayerIndex: -1 };
    }
  }, [location.lat, location.lng, settings.calculationMethod, settings.madhab, now]);

  // Handlers for the Prompt
  const handleAllowLocation = () => {
    setStorageItem('nurly_has_seen_location_prompt', true);
    setHasSeenPrompt(true);
    // locationEnabled is true by default, so refreshLocation will run and trigger prompt via effect
  };

  const handleManualLocation = () => {
    setStorageItem('nurly_has_seen_location_prompt', true);
    updateSettings('locationEnabled', false); // Disable to force default/manual logic
    setHasSeenPrompt(true);
  };

  // 9. RENDER

  // A. Check persistence status first. If checking, show splash (prevents flash)
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

  // B. If we haven't asked yet (and check is done), show the custom permission UI
  if (!hasSeenPrompt) {
    return (
      <LocationPermissionRequest 
        onAllow={handleAllowLocation} 
        onManual={handleManualLocation} 
      />
    );
  }

  // C. If initializing (fetching location), show splash
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
      location,
      refreshLocation,
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
