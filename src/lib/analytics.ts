/**
 * GA4 analytics helper – production-only (or ?ga_debug=1), consent-gated via TrackingGate.
 * Safe when gtag is not ready (no crashes).
 */

const GA4_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ?? (import.meta as any).env?.VITE_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

function getPageContext(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  return {
    page_path: window.location.pathname || '/',
    page_title: document.title || '',
  };
}

/**
 * Fire a GA4 event. No-op if gtag is not loaded (e.g. dev without ga_debug, or no consent).
 */
export function trackEvent(name: string, params?: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') return;
    const gtag = window.gtag;
    if (!gtag) return;

    const base = getPageContext();
    const merged = { ...base, ...params };
    gtag('event', name, merged);
  } catch {
    // no-op: never crash
  }
}

/**
 * Whether we are in "send GA events" context (production or dev with ?ga_debug=1).
 * Used for conditional debug logging only; actual sending is gated by TrackingGate.
 */
export function isGaEnabled(): boolean {
  if (import.meta.env.PROD) return true;
  if (typeof window !== 'undefined' && window.location.search.includes('ga_debug=1')) return true;
  return false;
}

export { getPageContext };
export const GA4_MEASUREMENT_ID = GA4_ID;
