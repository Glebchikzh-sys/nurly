
import React from 'react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
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
          <h1 className="text-xl font-bold tracking-tight text-ink dark:text-slate-100">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8">
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
          
          <section>
            <p className="text-gray-800 dark:text-slate-300 text-lg leading-relaxed font-medium transition-colors">
              Nurly is designed to be fully anonymous and privacy-respecting by default.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Data Collection</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              <li>We do not require user accounts.</li>
              <li>We do not collect personal information.</li>
              <li>We do not store names, emails, phone numbers, or identifiers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Local Storage</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              All personal preferences and data (such as Quran bookmarks, tasbih counts, selected city, or theme settings) are stored locally on your device using browser storage. This data never leaves your device.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Location Access</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              Location access is used only to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              <li>Calculate prayer times</li>
              <li>Determine Qibla direction</li>
              <li>Show nearby mosques</li>
            </ul>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed italic opacity-80 transition-colors">
              Location data is processed locally or used temporarily and is never stored, logged, or shared.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Tracking & Analytics</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              <li>Nurly does not use tracking cookies.</li>
              <li>Nurly does not use analytics services.</li>
              <li>Nurly does not use advertising or third-party trackers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Permissions</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              Audio playback, notifications, and device sensors are accessed only with explicit user permission and only for their intended purpose.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-ink dark:text-slate-100 font-bold text-xl transition-colors">Data Control</h2>
            <p className="text-gray-800 dark:text-slate-300 leading-relaxed transition-colors">
              You can clear all locally stored data at any time through the app settings or by clearing your browser cache.
            </p>
          </section>

          <div className="pt-8 border-t border-black/5 dark:border-white/5 transition-colors">
            <p className="text-ink dark:text-slate-100 font-bold text-lg text-center transition-colors">
              Nurly is built to function without identifying you in any way.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
