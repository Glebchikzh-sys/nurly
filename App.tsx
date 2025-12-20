
import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { QuranView } from './components/QuranView';
import { QiblaView } from './components/QiblaView';
import { SettingsView } from './components/SettingsView';
import { TasbihView } from './components/TasbihView';
import { SavedVersesView } from './components/SavedVersesView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TermsOfServiceView } from './components/TermsOfServiceView';
import { DonationView } from './components/DonationView';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { ViewState, Surah, Bookmark } from './types';
import { useBookmarks } from './hooks/useBookmarks';
import { usePrayerNotifications } from './hooks/usePrayerNotifications';
import { SURAHS } from './constants';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ currentView: 'home' });
  const { bookmarks, isBookmarked, toggleBookmark, removeBookmark } = useBookmarks();
  
  // Activate Prayer Notifications Logic
  usePrayerNotifications();

  const navigateTo = (view: ViewState['currentView'], data?: any) => {
    setViewState({ currentView: view, data });
  };

  const handleNavigateFromBookmark = (bookmark: Bookmark) => {
    // 1. Find the full Surah Object from constants/API based on the bookmark
    // NOTE: In a real app we might need to fetch this if not in constants, 
    // but for now we rely on the SURAHS constant having basic data 
    // or reconstructing a minimal Surah object sufficient for fetching.
    
    const surahObj: Surah | undefined = SURAHS.find(s => s.number === bookmark.surahNumber);
    
    // If not in our mini-constant list, reconstruct basic valid object for API fetch
    const targetSurah: Surah = surahObj || {
        number: bookmark.surahNumber,
        englishName: bookmark.surahName,
        englishNameTranslation: '', 
        arabicName: '',
        numberOfAyahs: 0
    };

    // 2. Navigate to reading view with specific Ayah index (array is 0-indexed, ayahNumber is 1-indexed)
    navigateTo('reading', {
        surah: targetSurah,
        ayahIndex: bookmark.ayahNumber - 1 
    });
  };

  const renderView = () => {
    switch (viewState.currentView) {
      case 'home':
        return <HomeView onChangeView={navigateTo} />;
      case 'quran':
      case 'reading':
        // Handle logic for direct deep linking (from Bookmark)
        const isDeepLink = viewState.data && 'ayahIndex' in viewState.data;
        const activeSurah = isDeepLink ? viewState.data.surah : viewState.data;
        const initialIndex = isDeepLink ? viewState.data.ayahIndex : undefined;

        return (
          <QuranView 
            activeSurah={activeSurah} 
            onSelectSurah={(surah: Surah) => navigateTo('reading', surah)}
            onBackToList={() => navigateTo('quran')}
            isBookmarked={isBookmarked}
            toggleBookmark={toggleBookmark}
            initialAyahIndex={initialIndex}
          />
        );
      case 'saved':
        return (
          <SavedVersesView 
            bookmarks={bookmarks}
            onRemove={removeBookmark}
            onNavigate={handleNavigateFromBookmark}
            onBack={() => navigateTo('home')}
          />
        );
      case 'qibla':
        return <QiblaView onBack={undefined} />;
      case 'tasbih':
        return <TasbihView onBack={() => navigateTo('home')} />;
      case 'settings':
        return <SettingsView onChangeView={navigateTo} />;
      case 'privacy':
        return <PrivacyPolicyView onBack={() => navigateTo('settings')} />;
      case 'terms':
        return <TermsOfServiceView onBack={() => navigateTo('settings')} />;
      case 'donation':
        return <DonationView onBack={() => navigateTo('settings')} />;
      default:
        return <HomeView onChangeView={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-cream dark:bg-slate-900 transition-colors duration-300 overflow-hidden text-ink dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar currentView={viewState.currentView} onChangeView={navigateTo} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {renderView()}
        </main>
        
        {/* Mobile Bottom Nav */}
        <BottomNav currentView={viewState.currentView} onChangeView={navigateTo} />
      </div>
    </div>
  );
};

export default App;
