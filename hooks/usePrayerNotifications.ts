
import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

export const usePrayerNotifications = () => {
  const { prayerTimes, settings, updateSettings, now } = useAppContext();
  
  // Track the last notified prayer to prevent duplicate alerts within the same minute
  const lastNotifiedRef = useRef<string | null>(null);

  // 1. Permission Handling
  useEffect(() => {
    if (settings.soundEnabled && typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'denied') {
            alert('Notifications were blocked. Please enable them in your browser settings to receive prayer alerts.');
            updateSettings('soundEnabled', false);
          }
        });
      } else if (Notification.permission === 'denied') {
        // If already denied but user tried to turn it on
        alert('Notifications are blocked by your browser. Please reset permissions for this site.');
        updateSettings('soundEnabled', false);
      }
    }
  }, [settings.soundEnabled, updateSettings]);

  // 2. Sound Generator (Synthesized Soft Chime)
  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft Sine wave
      osc.type = 'sine';
      // A4 (440Hz) -> Fade out
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      // Volume Envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  // 3. The Check Loop
  useEffect(() => {
    // Only run if settings enabled and prayer times exist
    if (!settings.soundEnabled || !prayerTimes) return;

    // Check only when seconds are roughly 0 to avoid checking 60 times a minute,
    // OR check every time 'now' updates but debounce using lastNotifiedRef.
    // Since 'now' updates every second in AppContext, we can just check directly.

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha },
    ];

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Find if any prayer matches NOW
    const activePrayer = prayers.find(p => {
      return p.time.getHours() === currentHour && p.time.getMinutes() === currentMinute;
    });

    if (activePrayer) {
      // 4. Trigger Logic with Safety
      // Create a unique key for this specific prayer event (Name + Day)
      const notificationKey = `${activePrayer.name}-${now.getDate()}`;

      if (lastNotifiedRef.current !== notificationKey) {
        
        // Trigger Browser Notification
        if (Notification.permission === 'granted') {
          // Calculate formatted time based on settings
          const locale = settings.language;
          const is24Hour = ['ru', 'tr', 'de', 'fr', 'es'].includes(locale);
          const timeStr = activePrayer.time.toLocaleTimeString(locale, { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: !is24Hour 
          });

          try {
            new Notification(`Time for ${activePrayer.name}`, {
              body: `It is now ${timeStr}`,
              icon: '/logo192.png', // Fallback if no icon
              requireInteraction: false,
              silent: false
            });
          } catch (e) {
            console.error("Notification creation failed", e);
          }
        }

        // Trigger Audio
        playNotificationSound();

        // Mark as done for this specific prayer instance
        lastNotifiedRef.current = notificationKey;
      }
    } else {
        // Reset ref if we move past the minute (optional, but good for cleanup)
        // We actually don't need to nullify it immediately, 
        // as the unique key `${activePrayer.name}-${now.getDate()}` handles uniqueness.
    }

  }, [now, prayerTimes, settings.soundEnabled, playNotificationSound, settings.language]);
};
