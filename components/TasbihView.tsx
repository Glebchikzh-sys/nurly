
import React, { useState } from 'react';

interface TasbihViewProps {
  onBack: () => void;
}

type TasbihTarget = 33 | 99 | 'infinity';

export const TasbihView: React.FC<TasbihViewProps> = ({ onBack }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<TasbihTarget>(33);
  const [showModal, setShowModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [shakeTargetId, setShakeTargetId] = useState<TasbihTarget | null>(null);

  // Circle calculations
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const triggerHaptic = (ms: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleIncrement = () => {
    if (showModal) return;

    const nextCount = count + 1;
    setCount(nextCount);
    triggerHaptic(15); // Light tap feedback

    const numericTarget = target === 'infinity' ? Infinity : target;
    if (nextCount === numericTarget) {
      triggerHaptic(50); // Completion feedback
      setShowModal(true);
    }
  };

  const handleReset = () => {
    setCount(0);
    setShowModal(false);
  };

  const handleTargetChange = (newTarget: TasbihTarget) => {
    // 1. Check validity: Cannot switch to a target lower than current count
    const numericNewTarget = newTarget === 'infinity' ? Infinity : newTarget;
    
    if (count > numericNewTarget) {
        // INVALID: Block action and visual feedback
        triggerHaptic(50); // Error buzz
        setShakeTargetId(newTarget);
        setTimeout(() => setShakeTargetId(null), 500);
        return;
    }

    // 2. VALID: Change target, PRESERVE COUNT
    setTarget(newTarget);
    // Do not reset count
    triggerHaptic(10);
  };

  // Calculate stroke dash offset
  const progress = target === 'infinity' ? 1 : Math.min(count / target, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden animate-fade-in select-none">
      {/* Custom Styles for Keyframes */}
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* Header (Back Button) */}
      <div className="absolute top-0 w-full z-40 flex items-center justify-between px-6 pt-12 md:pt-8 md:px-12 pointer-events-none">
        <button 
          onClick={onBack}
          className="text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-slate-200 transition-colors p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer pointer-events-auto"
        >
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
      </div>

      {/* Target Selector (Pills) */}
      <div className="absolute top-24 md:top-20 w-full z-30 flex justify-center pointer-events-none">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-sm border border-black/5 dark:border-white/5 pointer-events-auto transition-colors">
           {(['33', '99', 'infinity'] as const).map((t) => {
             const val = t === 'infinity' ? 'infinity' : parseInt(t) as TasbihTarget;
             const isActive = target === val;
             const isShake = shakeTargetId === val;
             return (
               <button
                 key={t}
                 onClick={() => handleTargetChange(val)}
                 className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 min-w-[3rem] flex items-center justify-center ${
                   isActive 
                    ? 'bg-sage text-white shadow-md' 
                    : 'text-ink-muted dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'
                 } ${isShake ? 'animate-shake bg-red-50 text-red-500' : ''}`}
               >
                 {t === 'infinity' ? (
                   <svg 
                     width="20" 
                     height="20" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     strokeWidth="2.5" 
                     strokeLinecap="round" 
                     strokeLinejoin="round"
                   >
                     <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
                   </svg>
                 ) : t}
               </button>
             );
           })}
        </div>
      </div>

      {/* Main Interaction Area (Full Screen Clickable) */}
      <button 
        className="flex-1 w-full h-full flex flex-col items-center justify-center outline-none touch-manipulation cursor-default active:outline-none"
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onClick={handleIncrement} // Logic handles click (release)
      >
        <div 
            className={`relative transition-transform duration-150 ease-out will-change-transform ${isPressed ? 'scale-95' : 'scale-100'}`}
        >
          {/* SVG Ring */}
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background Track */}
            <circle
              className="stroke-gray-200 dark:stroke-slate-800 transition-colors"
              strokeWidth={stroke}
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Indicator */}
            <circle
              className={`stroke-sage transition-colors ${target === 'infinity' ? 'hidden' : 'block'}`}
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease-out' }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Infinity State Indicator (Full subtle ring) */}
            {target === 'infinity' && (
               <circle
               className="stroke-sage opacity-20 transition-colors"
               strokeWidth={stroke}
               fill="transparent"
               r={normalizedRadius}
               cx={radius}
               cy={radius}
             />
            )}
          </svg>
          
          {/* Central Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-7xl font-bold text-ink dark:text-slate-100 tabular-nums tracking-tighter drop-shadow-sm transition-colors">
              {count}
            </span>
          </div>
        </div>
        
        {/* Helper Text */}
        <p className="absolute bottom-32 text-ink-muted/40 dark:text-slate-500/40 text-sm font-medium animate-pulse hidden md:block pointer-events-none transition-colors">
            Tap anywhere to count
        </p>
      </button>

      {/* Footer Reset Button */}
      <div className="absolute bottom-10 w-full z-30 flex justify-center pointer-events-none">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="pointer-events-auto text-ink-muted/70 dark:text-slate-500/70 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Reset Counter
        </button>
      </div>

      {/* Completion Modal - Fixed Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-black/5 dark:border-white/5 p-8 max-w-sm w-full text-center animate-pop-in relative transition-colors">
                <div className="w-20 h-20 bg-sage/10 dark:bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-sage text-5xl filled">check</span>
                </div>
                <h2 className="text-3xl font-extrabold text-ink dark:text-slate-100 mb-2 tracking-tight transition-colors">Alhamdulillah</h2>
                <p className="text-ink-muted dark:text-slate-400 font-medium mb-8 transition-colors">May Allah accept your Dhikr.</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                    }}
                    className="w-full bg-sage text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-sage/30 hover:bg-sage-dark transition-all active:scale-95"
                >
                    Restart
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
