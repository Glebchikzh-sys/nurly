
import { useLayoutEffect } from 'react';

export const useLockBodyScroll = (isLocked: boolean) => {
  useLayoutEffect(() => {
    if (!isLocked) return;

    // 1. Get original overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // 2. Lock body
    document.body.style.overflow = 'hidden';

    // 3. Cleanup on unmount or unlock
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};
