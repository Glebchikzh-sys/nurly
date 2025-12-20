
import { PrayerTimes } from 'adhan';

export interface Prayer {
  name: string;
  time: string;
  isNext?: boolean;
}

export interface Surah {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  arabicName: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string; // Arabic
  translation: string; // English
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface Bookmark {
  id: string; // "surahNum:ayahNum"
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textPreview: string; // Truncated translation
  timestamp: number;
}

export interface ViewState {
  currentView: 'home' | 'quran' | 'qibla' | 'settings' | 'tasbih' | 'reading' | 'saved' | 'privacy' | 'terms' | 'donation';
  data?: any;
}

// --- New Core Architecture Types ---

export interface Reciter {
  id: string;
  name: string;
  subfolder: string;
}

export interface AppSettings {
  calculationMethod: string;
  madhab: string;
  soundEnabled: boolean;
  locationEnabled: boolean;
  darkMode: boolean;
  activeReciter: Reciter;
}

export interface LocationState {
  lat: number;
  lng: number;
  name: string;
  isDefault: boolean; // True if using fallback (Makkah)
  error: string | null;
}

export interface AppContextType {
  settings: AppSettings;
  updateSettings: (key: keyof AppSettings, value: any) => void;
  
  location: LocationState;
  refreshLocation: () => void;
  
  // Raw Data (Calculated)
  prayerTimes: PrayerTimes | null; 
  nextPrayerIndex: number; // 0-5, or -1 if none/error
  now: Date;
  
  // Status
  isReady: boolean;
}

export interface AppViewModel {
  status: 'loading' | 'ready' | 'error';
  locationName: string;
  formattedDate: string;
  hijriDate: string;
  
  prayerSchedule: {
    name: string;
    time: string;
    isNext: boolean;
    isPast: boolean;
  }[];
  
  nextPrayer: {
    name: string;
    time: string;
    remaining: string;
  };
}
