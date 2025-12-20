
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMobileScrollLock } from '../hooks/useMobileScrollLock';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // FORCE SCROLL LOCK
  useMobileScrollLock(isOpen);

  const selectedOption = options.find(o => o.value === value);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6, // 6px gap, relative to viewport (fixed)
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (isOpen) {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const toggleOpen = () => {
      if (!isOpen) updatePosition();
      setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all duration-200 group ${
          isOpen 
            ? 'bg-white dark:bg-slate-800 ring-2 ring-sage/20 border-sage dark:border-sage' 
            : 'bg-gray-50 dark:bg-slate-800 border-black/5 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-black/10 dark:hover:border-slate-600'
        }`}
      >
        <span className={`font-medium truncate ${selectedOption ? 'text-ink dark:text-slate-100' : 'text-ink-muted dark:text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span 
          className={`material-symbols-outlined transition-transform duration-200 text-[24px] ${
            isOpen 
              ? 'text-sage rotate-180' 
              : 'text-ink-muted dark:text-slate-500 group-hover:text-ink dark:group-hover:text-slate-300'
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Portal Dropdown */}
      {isOpen && (
        <Portal>
            {/* Backdrop for extra click safety */}
            <div className="fixed inset-0 z-[9998] bg-transparent" onClick={() => setIsOpen(false)} />
            
            <div 
                ref={dropdownRef}
                style={{
                    position: 'fixed',
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 9999
                }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-black/5 dark:border-slate-700 max-h-60 overflow-y-auto animate-fade-in origin-top thin-gray-scrollbar"
            >
                <style>{`
                  .thin-gray-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  .thin-gray-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .thin-gray-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #D1D5DB;
                    border-radius: 9999px;
                  }
                  .dark .thin-gray-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569;
                  }
                  .thin-gray-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #9CA3AF;
                  }
                `}</style>
                <div className="p-1.5 space-y-0.5">
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        return (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                            isSelected 
                                ? 'bg-sage/10 dark:bg-teal-900/50 text-sage-dark dark:text-sage' 
                                : 'text-ink dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <span className="truncate mr-2 text-left">{option.label}</span>
                            {isSelected && (
                            <span className="material-symbols-outlined text-[18px] text-sage">check</span>
                            )}
                        </button>
                        );
                    })}
                </div>
            </div>
        </Portal>
      )}
    </>
  );
};
