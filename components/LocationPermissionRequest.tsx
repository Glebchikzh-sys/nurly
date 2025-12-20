
import React, { useState, useEffect } from 'react';
import { Skeleton } from './Skeleton';
import { useMobileScrollLock } from '../hooks/useMobileScrollLock';

interface LocationPermissionRequestProps {
  onAllow: () => void;
  onManual: (lat: number, lng: number, name: string) => void;
}

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

export const LocationPermissionRequest: React.FC<LocationPermissionRequestProps> = ({ onAllow, onManual }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lock scroll when this component is mounted (it's always a full screen modal)
  useMobileScrollLock(true);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=10&accept-language=en`);
        const data: CityResult[] = await response.json();
        
        // Deduplicate
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
        console.error("Search failed", e);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    const name = city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0];
    const state = city.address.state ? `, ${city.address.state}` : '';
    const fullName = `${name}${state}, ${city.address.country}`;
    onManual(parseFloat(city.lat), parseFloat(city.lon), fullName);
  };

  const animationStyles = (
    <style>{`
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-pop-in {
        animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `}</style>
  );

  if (isSearching) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cream px-6 animate-fade-in">
        {animationStyles}
        <div className="max-w-sm w-full bg-white rounded-[32px] p-8 shadow-xl border border-black/5 flex flex-col h-[500px] animate-pop-in">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setIsSearching(false)}
              className="text-ink-muted hover:text-ink transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-lg font-bold text-ink">Search City</h2>
            <div className="w-6"></div>
          </div>

          <div className="relative mb-6">
            <input 
              type="text"
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-sage text-sm font-medium"
              placeholder="Type your city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <div className="w-5 h-5 border-2 border-sage/30 border-t-sage rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {isLoading && results.length === 0 && (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
            )}
            
            {!isLoading && query.length >= 3 && results.length === 0 && (
               <p className="text-center text-ink-muted text-sm py-8">No cities found.</p>
            )}

            {results.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(city)}
                className="w-full text-left p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-black/5 group"
              >
                <p className="text-sm font-bold text-ink truncate group-hover:text-sage transition-colors">
                  {city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0]}
                </p>
                <p className="text-[11px] text-ink-muted font-medium mt-1 truncate">
                  {city.address.state ? `${city.address.state}, ` : ''}{city.address.country}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cream px-6 animate-fade-in">
       {animationStyles}
       <div className="max-w-sm w-full bg-white rounded-[32px] p-8 shadow-xl border border-black/5 flex flex-col items-center text-center animate-pop-in">
          
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-6 text-sage shrink-0">
             <span className="material-symbols-outlined text-3xl filled">near_me</span>
          </div>
          
          <h2 className="text-xl font-bold text-ink mb-3 tracking-tight">
            Enable Location for Prayer Times
          </h2>
          
          <p className="text-ink-muted text-sm leading-relaxed mb-8 font-medium">
            Location is used only to calculate prayer times and Qibla. It is processed locally and never stored.
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onAllow}
              className="w-full py-4 bg-sage text-white font-bold rounded-2xl hover:bg-sage-dark transition-colors shadow-lg shadow-sage/20 active:scale-95 duration-200"
            >
              Allow Access
            </button>
            
            <button 
              onClick={() => setIsSearching(true)}
              className="w-full py-3 text-ink-muted font-bold text-sm hover:text-ink transition-colors"
            >
              Enter Manually
            </button>
          </div>
       </div>
    </div>
  );
};
