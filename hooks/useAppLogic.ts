
import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppViewModel } from '../types';
import { Prayer } from 'adhan';

export const useAppLogic = (): AppViewModel => {
  const { location, prayerTimes, now, nextPrayerIndex, isReady } = useAppContext();

  return useMemo(() => {
    // 1. Safe Defaults (The "Zero Crash" return)
    const emptyState: AppViewModel = {
      status: isReady ? 'ready' : 'loading',
      locationName: location.name,
      formattedDate: '--',
      hijriDate: '--',
      prayerSchedule: [],
      nextPrayer: { name: 'Loading', time: '--:--', remaining: '--:--:--' }
    };

    if (!prayerTimes) return emptyState;

    // 2. Formatters
    const timeFmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const hijriFmt = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Process Prayers
    // Map Adhan object to array manually to ensure order
    const rawPrayers = [
      { id: Prayer.Fajr, name: 'Fajr', time: prayerTimes.fajr },
      { id: Prayer.Sunrise, name: 'Sunrise', time: prayerTimes.sunrise },
      { id: Prayer.Dhuhr, name: 'Dhuhr', time: prayerTimes.dhuhr },
      { id: Prayer.Asr, name: 'Asr', time: prayerTimes.asr },
      { id: Prayer.Maghrib, name: 'Maghrib', time: prayerTimes.maghrib },
      { id: Prayer.Isha, name: 'Isha', time: prayerTimes.isha },
    ];

    // Determine actual next prayer (handling "None" case -> Tomorrow Fajr)
    let nextName = "Fajr";
    let nextTimeObj = rawPrayers[0].time; // Default to tomorrow Fajr logic usually, but here we simplify
    
    // Check if we are past Isha (nextPrayerIndex === -1)
    if (nextPrayerIndex === -1) {
        // Next is Fajr tomorrow. 
        nextName = "Fajr";
        // To be accurate, we should probably add 1 day to Fajr time, but for countdown diff logic below:
        // We will just let the countdown say "Tomorrow".
    } else {
        const p = rawPrayers[nextPrayerIndex]; 
        // Simplification:
        const nextP = rawPrayers.find(p => {
             // Basic future check
             return p.time.getTime() > now.getTime();
        });
        if (nextP) {
            nextName = nextP.name;
            nextTimeObj = nextP.time;
        } else {
            // Tomorrow Fajr logic fallback
            nextName = "Fajr";
            nextTimeObj = rawPrayers[0].time; 
        }
    }

    // 4. Countdown Calculation
    let remainingStr = "Done for today";
    const diff = nextTimeObj.getTime() - now.getTime();
    
    // Only show countdown if target is in future
    if (diff > 0) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const hDisp = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
      remainingStr = `${hDisp}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else if (nextPrayerIndex === -1) {
       remainingStr = "See you tomorrow";
    }

    // 5. Build Result
    const prayerSchedule = rawPrayers.map(p => ({
        name: p.name,
        time: timeFmt.format(p.time),
        isNext: p.name === nextName && diff > 0,
        isPast: p.time.getTime() < now.getTime()
    }));

    return {
      status: 'ready',
      locationName: location.name,
      formattedDate: dateFmt.format(now),
      hijriDate: hijriFmt.format(now),
      prayerSchedule,
      nextPrayer: {
        name: nextName,
        time: timeFmt.format(nextTimeObj),
        remaining: remainingStr
      }
    };

  }, [location, prayerTimes, now, nextPrayerIndex, isReady]);
};
