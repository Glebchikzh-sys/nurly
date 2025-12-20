
import { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppViewModel } from '../types';
import { Prayer } from 'adhan';

export const useAppLogic = (): AppViewModel => {
  const { location, prayerTimes, now, nextPrayerIndex, isReady, settings, t } = useAppContext();

  return useMemo(() => {
    // 1. Safe Defaults (The "Zero Crash" return)
    const emptyState: AppViewModel = {
      status: isReady ? 'ready' : 'loading',
      locationName: location.name,
      formattedDate: '--',
      hijriDate: '--',
      prayerSchedule: [],
      nextPrayer: { name: t('loading'), time: '--:--', remaining: '--:--:--' }
    };

    if (!prayerTimes) return emptyState;

    // 2. Formatters with Localization
    // Map internal language codes to standard locales if needed (e.g. 'ar' -> 'ar-SA' usually auto-handled)
    const locale = settings.language;
    
    // 24-hour format for: ru, tr, de, fr, es
    // 12-hour format for: en, ar (Arabic usually preferred with suffix)
    const use24Hour = ['ru', 'tr', 'de', 'fr', 'es'].includes(locale);

    const timeFmt = new Intl.DateTimeFormat(locale, { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: !use24Hour 
    });
    
    const dateFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' });
    const hijriFmt = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Process Prayers
    const rawPrayers = [
      { id: Prayer.Fajr, name: 'Fajr', time: prayerTimes.fajr },
      { id: Prayer.Sunrise, name: 'Sunrise', time: prayerTimes.sunrise },
      { id: Prayer.Dhuhr, name: 'Dhuhr', time: prayerTimes.dhuhr },
      { id: Prayer.Asr, name: 'Asr', time: prayerTimes.asr },
      { id: Prayer.Maghrib, name: 'Maghrib', time: prayerTimes.maghrib },
      { id: Prayer.Isha, name: 'Isha', time: prayerTimes.isha },
    ];

    // --- NEXT PRAYER LOGIC ---
    let nextName = "Fajr";
    let nextTimeObj = rawPrayers[0].time; 
    
    if (nextPrayerIndex === -1) {
        // Next is Fajr tomorrow
        nextName = t('fajr_tomorrow');
        const tomorrowFajr = new Date(rawPrayers[0].time);
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
        nextTimeObj = tomorrowFajr;
    } else {
        const nextP = rawPrayers.find(p => p.time.getTime() > now.getTime());
        if (nextP) {
            // Translate the raw English name
            nextName = t(nextP.name.toLowerCase());
            nextTimeObj = nextP.time;
        } else {
            nextName = t('fajr_tomorrow');
            const tomorrowFajr = new Date(rawPrayers[0].time);
            tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
            nextTimeObj = tomorrowFajr;
        }
    }

    // --- ACTIVE PRAYER LOGIC ---
    let activePrayerName = 'Isha';
    if (now >= prayerTimes.isha) activePrayerName = 'Isha';
    else if (now >= prayerTimes.maghrib) activePrayerName = 'Maghrib';
    else if (now >= prayerTimes.asr) activePrayerName = 'Asr';
    else if (now >= prayerTimes.dhuhr) activePrayerName = 'Dhuhr';
    else if (now >= prayerTimes.sunrise) activePrayerName = 'Sunrise';
    else if (now >= prayerTimes.fajr) activePrayerName = 'Fajr';

    // 4. Countdown Calculation
    let remainingStr = "00:00:00";
    const diff = nextTimeObj.getTime() - now.getTime();
    
    if (diff > 0) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      const hDisp = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
      remainingStr = `${hDisp}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // 5. Build Result
    const prayerSchedule = rawPrayers.map(p => ({
        name: t(p.name.toLowerCase()), // Translate here using the new keys in constants
        time: timeFmt.format(p.time),
        isNext: p.time.getTime() === nextTimeObj.getTime(),
        isActive: p.name === activePrayerName,
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

  }, [location, prayerTimes, now, nextPrayerIndex, isReady, settings.language]);
};
