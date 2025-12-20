
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  // Prayer Calculation Settings
  calculationMethod: string;
  setCalculationMethod: (method: string) => void;
  madhab: string;
  setMadhab: (madhab: string) => void;

  // General App Settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  locationEnabled: boolean;
  setLocationEnabled: (enabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or use defaults
  
  // Prayer Settings
  const [calculationMethod, setCalculationMethodState] = useState<string>(() => {
    return localStorage.getItem('nurly_calculationMethod') || 'MuslimWorldLeague';
  });

  const [madhab, setMadhabState] = useState<string>(() => {
    return localStorage.getItem('nurly_madhab') || 'Shafi';
  });

  // General Settings
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('nurly_sound') !== 'false';
  });

  const [locationEnabled, setLocationEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('nurly_location') !== 'false';
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem('nurly_darkMode') === 'true';
  });

  // Setters with Persistence
  const setCalculationMethod = (value: string) => {
    setCalculationMethodState(value);
    localStorage.setItem('nurly_calculationMethod', value);
    // Dispatch storage event to keep other tabs or legacy listeners in sync if needed
    window.dispatchEvent(new Event('storage'));
  };

  const setMadhab = (value: string) => {
    setMadhabState(value);
    localStorage.setItem('nurly_madhab', value);
    window.dispatchEvent(new Event('storage'));
  };

  const setSoundEnabled = (value: boolean) => {
    setSoundEnabledState(value);
    localStorage.setItem('nurly_sound', String(value));
  };

  const setLocationEnabled = (value: boolean) => {
    setLocationEnabledState(value);
    localStorage.setItem('nurly_location', String(value));
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    localStorage.setItem('nurly_darkMode', String(value));
  };

  return (
    <SettingsContext.Provider
      value={{
        calculationMethod,
        setCalculationMethod,
        madhab,
        setMadhab,
        soundEnabled,
        setSoundEnabled,
        locationEnabled,
        setLocationEnabled,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
