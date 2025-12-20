
import { useEffect } from 'react';

export const useMobileScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    // Target the specific app scroller if it exists, otherwise fallback to body
    const mainContainer = document.getElementById('main-scroll-container');
    
    if (isLocked) {
      if (mainContainer) {
        mainContainer.style.overflow = 'hidden';
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (mainContainer) {
        mainContainer.style.overflow = '';
      }
      document.body.style.overflow = '';
    }

    return () => {
      if (mainContainer) mainContainer.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isLocked]);
};
