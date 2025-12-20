
import { useState, useEffect } from 'react';
import { Coordinates, Qibla } from 'adhan';

interface QiblaResult {
  qiblaAngle: number;
  distance: number;
  isLoading: boolean;
  error: string | null;
}

export const useQibla = (): QiblaResult => {
  const [data, setData] = useState<QiblaResult>({
    qiblaAngle: 0,
    distance: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setData(prev => ({ ...prev, isLoading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // 1. Calculate Qibla Angle using Adhan
          const coords = new Coordinates(latitude, longitude);
          // Qibla is a function returning the direction in degrees
          const qiblaAngle = Qibla(coords);

          // 2. Calculate Distance to Makkah using Haversine
          // Makkah Coordinates
          const makkahLat = 21.422487;
          const makkahLng = 39.826206;

          const R = 6371; // Radius of the earth in km
          const dLat = (makkahLat - latitude) * (Math.PI / 180);
          const dLon = (makkahLng - longitude) * (Math.PI / 180);
          
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude * (Math.PI / 180)) * Math.cos(makkahLat * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = Math.round(R * c);

          setData({
            qiblaAngle,
            distance,
            isLoading: false,
            error: null,
          });

        } catch (err) {
          setData(prev => ({ ...prev, isLoading: false, error: 'Calculation failed' }));
        }
      },
      (err) => {
        setData(prev => ({ ...prev, isLoading: false, error: err.message || 'Location access denied' }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  return data;
};
