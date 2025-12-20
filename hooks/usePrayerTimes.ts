
import { useMemo } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
}

interface FormattedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  raw: PrayerTimes;
}

export const usePrayerTimes = (
  coords: { latitude: number; longitude: number } | null,
  date: Date,
  settings: PrayerSettings
): FormattedPrayerTimes | null => {
  
  return useMemo(() => {
    if (!coords) return null;

    try {
      // 1. Map Settings to Adhan Parameters
      const coordinates = new Coordinates(coords.latitude, coords.longitude);
      let params;

      // Map Calculation Method
      switch (settings.calculationMethod) {
        case 'MuslimWorldLeague':
          params = CalculationMethod.MuslimWorldLeague();
          break;
        case 'Egyptian':
          params = CalculationMethod.Egyptian();
          break;
        case 'Karachi':
          params = CalculationMethod.Karachi();
          break;
        case 'UmmAlQura':
          params = CalculationMethod.UmmAlQura();
          break;
        case 'Dubai':
          params = CalculationMethod.Dubai();
          break;
        case 'MoonsightingCommittee':
          params = CalculationMethod.MoonsightingCommittee();
          break;
        case 'NorthAmerica': // ISNA
          params = CalculationMethod.NorthAmerica();
          break;
        case 'Kuwait':
          params = CalculationMethod.Kuwait();
          break;
        case 'Qatar':
          params = CalculationMethod.Qatar();
          break;
        case 'Singapore':
          params = CalculationMethod.Singapore();
          break;
        case 'Turkey':
          params = CalculationMethod.Turkey();
          break;
        case 'Tehran':
          params = CalculationMethod.Tehran();
          break;
        default:
          params = CalculationMethod.MuslimWorldLeague();
      }

      // Map Madhab
      if (settings.madhab === 'Hanafi') {
        params.madhab = Madhab.Hanafi;
      } else {
        // Default to Shafi (Standard for Maliki, Hanbali)
        params.madhab = Madhab.Shafi;
      }

      // 2. Calculate Prayer Times
      const prayerTimes = new PrayerTimes(coordinates, date, params);

      // 3. Format Times
      const formatTime = (d: Date) => {
        return new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(d);
      };

      return {
        fajr: formatTime(prayerTimes.fajr),
        sunrise: formatTime(prayerTimes.sunrise),
        dhuhr: formatTime(prayerTimes.dhuhr),
        asr: formatTime(prayerTimes.asr),
        maghrib: formatTime(prayerTimes.maghrib),
        isha: formatTime(prayerTimes.isha),
        raw: prayerTimes,
      };

    } catch (error) {
      console.error("Error calculating prayer times", error);
      return null;
    }
  }, [
    coords?.latitude, 
    coords?.longitude, 
    date.getTime(), // Use timestamp to ensure deep comparison for Date
    settings.calculationMethod, 
    settings.madhab
  ]);
};
