
import React, { useState, useRef, useEffect } from 'react';

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

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-black/5 dark:border-slate-700 overflow-hidden transition-all duration-200 origin-top transform ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
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
          .dark .thin-gray-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #64748B;
          }
        `}</style>
        <div className="max-h-64 overflow-y-auto thin-gray-scrollbar p-1.5 space-y-0.5">
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
                <span className="truncate mr-2">{option.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[18px] text-sage">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
