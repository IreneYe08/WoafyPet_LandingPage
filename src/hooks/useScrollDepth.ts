import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

const DEFAULT_THRESHOLDS = [25, 50, 75, 90];

/**
 * Fires GA4 scroll_depth events once per threshold per page load.
 */
export function useScrollDepth(thresholds: number[] = DEFAULT_THRESHOLDS): void {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fired = firedRef.current;

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY ?? doc.scrollTop;
      const scrollHeight = (doc.scrollHeight ?? doc.clientHeight) - window.innerHeight;
      if (scrollHeight <= 0) return;
      const percent = Math.round((scrollTop / scrollHeight) * 100);

      thresholds.forEach((thresh) => {
        if (percent >= thresh && !fired.has(thresh)) {
          fired.add(thresh);
          trackEvent('scroll_depth', {
            percent_scrolled: thresh,
            page_path: window.location.pathname || '/',
            page_title: document.title || '',
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // in case already scrolled
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds.join(',')]);
}
