
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAppContext } from '../contexts/AppContext';

interface DonationViewProps {
  onBack: () => void;
}

interface CryptoOption {
  id: string;
  name: string;
  network: string;
  address: string;
}

const DONATION_OPTIONS: CryptoOption[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    network: 'BTC',
    address: 'bc1qyr0asmqtkpppkprhnn4vg7lgejj32xs2rkm8wr' 
  },
  {
    id: 'eth',
    name: 'Ethereum',
    network: 'ERC-20',
    address: '0x70E3Dc7E3F640C34e5Ef1a9ae0Ee710D990F49c5' 
  },
  {
    id: 'usdt',
    name: 'USDT',
    network: 'TRC-20 (TRX)',
    address: 'TVYxkXkS17iXDrt2FT53DsuksbQLrLioyq' 
  }
];

export const DonationView: React.FC<DonationViewProps> = ({ onBack }) => {
  const { t } = useAppContext();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleQr = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-slate-900 animate-fade-in transition-colors duration-300">
      {/* 1. Header */}
      <div className="sticky top-0 w-full z-40 bg-cream/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-6 pt-12 md:pt-8 md:px-12 pb-4 shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rtl:rotate-180"
          >
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-slate-100">{t('support')}</h1>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8">
        <div className="max-w-xl mx-auto space-y-10">
          
          {/* 2. Intro Text */}
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm md:text-base font-medium transition-colors">
              {t('support_desc')}
            </p>
          </div>

          {/* 3. Crypto List */}
          <div className="space-y-8">
            {DONATION_OPTIONS.map((option) => (
              <div key={option.id} className="flex flex-col gap-3">
                
                {/* Header Row: Name & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-slate-200 font-bold text-base transition-colors">{option.name}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-400 font-medium tracking-wide uppercase transition-colors">{option.network}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     {/* Show QR Toggle */}
                     <button 
                      onClick={() => toggleQr(option.id)}
                      className="text-xs font-bold text-sage hover:text-sage-dark dark:hover:text-sage-light transition-colors px-3 py-1.5 rounded-lg hover:bg-sage/10 dark:hover:bg-sage/20"
                    >
                      {expandedId === option.id ? t('hide_qr') : t('show_qr')}
                    </button>
                  </div>
                </div>

                {/* Address Box */}
                <button
                  onClick={() => handleCopy(option.address, option.id)}
                  className="w-full text-start group outline-none"
                >
                  <div className="flex items-center h-14 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-sage/30 dark:hover:border-sage/30 transition-all duration-200 overflow-hidden">
                     
                     {/* Text Area */}
                     <div className="flex-1 min-w-0 px-4 flex items-center">
                        <span className="font-mono text-xs text-gray-500 dark:text-slate-300 truncate select-all transition-colors">
                          {option.address}
                        </span>
                     </div>

                     {/* Fixed Copy Button Area - Stable Dimensions */}
                     <div className="w-16 h-full flex items-center justify-center border-l border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 text-gray-400 dark:text-slate-500 group-hover:text-sage dark:group-hover:text-sage transition-colors shrink-0 rtl:border-l-0 rtl:border-r">
                        {copiedId === option.id ? (
                            <span className="material-symbols-outlined text-xl text-sage animate-fade-in">check</span>
                        ) : (
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                        )}
                     </div>
                  </div>
                </button>

                {/* 4. QR Code (Compact & Animated) */}
                {expandedId === option.id && (
                  <div className="flex justify-center mt-2 animate-fade-in origin-top">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft border border-black/5 dark:border-white/5 flex flex-col items-center gap-3 transition-colors">
                       <QRCode
                            value={option.address}
                            size={140}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 140 140`}
                            level="M"
                            bgColor="#FFFFFF"
                            fgColor="#111111"
                        />
                        <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-widest transition-colors">
                            {t('scan_to_send')} {option.network}
                        </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 5. Footer Note */}
          <div className="pt-8 border-t border-gray-100 dark:border-white/5 pb-12 transition-colors">
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center leading-relaxed transition-colors">
              {t('privacy_assurance')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
