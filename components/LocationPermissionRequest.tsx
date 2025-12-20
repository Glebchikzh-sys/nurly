
import React from 'react';

interface LocationPermissionRequestProps {
  onAllow: () => void;
  onManual: () => void;
}

export const LocationPermissionRequest: React.FC<LocationPermissionRequestProps> = ({ onAllow, onManual }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cream px-6 animate-fade-in">
       <div className="max-w-sm w-full bg-white rounded-[32px] p-8 shadow-xl border border-black/5 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-6 text-sage">
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
              onClick={onManual}
              className="w-full py-3 text-ink-muted font-bold text-sm hover:text-ink transition-colors"
            >
              Enter Manually
            </button>
          </div>
          
       </div>
    </div>
  );
};
