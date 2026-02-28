import { useEffect, useRef } from 'react';
import { loadConsent } from '@/lib/consent';

const GA4_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ?? (import.meta as any).env?.VITE_GA_ID;

function injectScriptOnce(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** GA4 loads only in production or when ?ga_debug=1 (for DebugView testing). Never on localhost otherwise. */
function shouldLoadGA(): boolean {
  if (import.meta.env.PROD) return true;
  if (typeof window !== 'undefined' && window.location.search.includes('ga_debug=1')) return true;
  return false;
}

export function TrackingGate() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const consent = loadConsent();

    // ✅ Ads gate (Meta/Google Ads/TikTok...)
    if (consent.ads === 'granted') {
      const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

      if (pixelId) {
        injectScriptOnce('meta-pixel', `https://connect.facebook.net/en_US/fbevents.js`);

        if (!(window as any).fbq) {
          (window as any).fbq = function () {
            ((window as any).fbq.callMethod
              ? (window as any).fbq.callMethod
              : (window as any).fbq.queue).push(arguments);
          };
          (window as any).fbq.queue = [];
          (window as any).fbq.loaded = true;
          (window as any).fbq.version = '2.0';
        }
        (window as any).fbq('init', pixelId);
        (window as any).fbq('track', 'PageView');
      }
    }

    // ✅ GA4: only in production or with ?ga_debug=1 (never send on localhost otherwise)
    if (consent.analytics === 'granted' && shouldLoadGA() && GA4_ID) {
      injectScriptOnce('ga-gtag', `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag() {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;
      (window as any).gtag('js', new Date());

      const config: Record<string, boolean | number> = {
        anonymize_ip: true,
        send_page_view: true,
      };
      if (typeof window !== 'undefined' && window.location.search.includes('ga_debug=1')) {
        config.debug_mode = true;
      }
      (window as any).gtag('config', GA4_ID, config);
    }
  }, []);

  return null;
}

export default TrackingGate;