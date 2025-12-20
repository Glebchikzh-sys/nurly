
import React from 'react';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 animate-fade-in transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 w-full z-40 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-6 pt-12 md:pt-8 md:px-12 pb-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-slate-200 transition-colors p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-ink dark:text-slate-100">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8">
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
          
          <section>
            <p className="text-gray-800 dark:text-slate-300 text-lg leading-relaxed font-medium transition-colors">
              Nurly is provided as a free informational and worship assistance tool.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Purpose</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              The application offers prayer times, Quran reading tools, Qibla direction, tasbih, and related Islamic utilities for personal use only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Accuracy & Calculation</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              Prayer times, Qibla direction, and Islamic dates are calculated using widely accepted methods, but local conditions and scholarly differences may apply. Users remain responsible for their religious practice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Religious Guidance</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              The app does not provide personalized religious rulings (fatwas). Any educational or fiqh-related content is general and informational.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Disclaimer</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              Nurly is provided "as is", without warranties of accuracy or uninterrupted availability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">User Conduct</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              By using Nurly, you agree to use the app respectfully and for lawful purposes only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Data Loss</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              No account creation means no recovery of locally stored data if it is deleted or the device is changed.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
