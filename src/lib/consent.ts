export type ConsentValue = 'granted' | 'denied';
export type ConsentSource = 'banner' | 'choices_page' | 'gpc' | 'default';

export type ConsentState = {
  analytics: ConsentValue;
  ads: ConsentValue;
  source: ConsentSource;
  ts: string; // ISO
};

const COOKIE_NAME = 'woafy_consent';
const LS_KEY = 'woafy_consent_v1';

const DEFAULT_STATE: ConsentState = {
  analytics: 'denied',
  ads: 'denied',
  source: 'default',
  ts: new Date(0).toISOString(),
};

export function isGpcEnabled(): boolean {
  return typeof navigator !== 'undefined' && (navigator as any).globalPrivacyControl === true;
}

function safeJsonParse<T>(v: string | null): T | null {
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function loadConsent(): ConsentState {
  // 1) cookie
  const fromCookie = safeJsonParse<ConsentState>(getCookie(COOKIE_NAME));
  // 2) localStorage
  const fromLs =
    typeof window !== 'undefined'
      ? safeJsonParse<ConsentState>(window.localStorage.getItem(LS_KEY))
      : null;

  const merged = fromCookie ?? fromLs ?? DEFAULT_STATE;

  // GPC 最高优先级：强制 ads=denied（frictionless）
  if (isGpcEnabled()) {
    const gpcState: ConsentState = {
      ...merged,
      ads: 'denied',
      source: 'gpc',
      ts: new Date().toISOString(),
    };
    persistConsent(gpcState);
    return gpcState;
  }

  return merged;
}

export function persistConsent(next: ConsentState): void {
  // 双写：cookie + localStorage
  const payload = JSON.stringify(next);
  setCookie(COOKIE_NAME, payload, 365); // 1年
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LS_KEY, payload);
  }
}

export function hasStoredConsent(): boolean {
  const c = getCookie(COOKIE_NAME);
  const ls =
    typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
  return !!(c || ls);
}

export function setConsentAllGranted(): ConsentState {
  const next: ConsentState = {
    analytics: 'granted',
    ads: isGpcEnabled() ? 'denied' : 'granted',
    source: isGpcEnabled() ? 'gpc' : 'banner',
    ts: new Date().toISOString(),
  };
  persistConsent(next);
  return next;
}

export function setConsentAllDenied(source: ConsentSource = 'banner'): ConsentState {
  const next: ConsentState = {
    analytics: 'denied',
    ads: 'denied',
    source: isGpcEnabled() ? 'gpc' : source,
    ts: new Date().toISOString(),
  };
  persistConsent(next);
  return next;
}