import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ConsentState,
  isGpcEnabled,
  loadConsent,
  persistConsent,
} from '@/lib/consent';

function statusLabel(consent: ConsentState, gpc: boolean) {
  if (gpc) return 'Detected via GPC';
  if (consent.ads === 'denied' && consent.analytics === 'denied') return 'Opted Out';
  if (consent.ads === 'granted' || consent.analytics === 'granted') return 'Opted In';
  return 'Opted Out';
}

export function PrivacyChoicesPage() {
  const gpc = useMemo(() => isGpcEnabled(), []);
  const [consent, setConsent] = useState<ConsentState>(() => loadConsent());
  const [ads, setAds] = useState(consent.ads === 'granted');
  const [analytics, setAnalytics] = useState(consent.analytics === 'granted');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // GPC frictionless：强制 Ads OFF，且 UI 上锁定
    if (gpc) {
      setAds(false);
    }
  }, [gpc]);

  const thisStatus = statusLabel(consent, gpc);

  return (
    <div className="mx-auto max-w-[980px] px-5 sm:px-8 lg:px-12 xl:px-16 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#2F2F2F]">Your Privacy Choices</h1>
      <p className="mt-2 text-sm text-black/70">Last Updated: 02.13.2026</p>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-bold text-[#2F2F2F]">Your current status</h2>

        <div className="mt-3 space-y-2 text-sm text-black/80">
          <div>
            <span className="font-semibold">This browser/device status:</span> {thisStatus}
          </div>
          <div>
            <span className="font-semibold">Account status:</span> Not logged in
          </div>
          <div className="pt-2 text-xs font-extrabold tracking-wide text-black/60">
            THIS CHOICE APPLIES TO THIS BROWSER/DEVICE…
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-bold text-[#2F2F2F]">Manage your settings</h2>

        <div className="mt-6 space-y-6">
          {/* Targeted Advertising */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-semibold text-[#2F2F2F]">Targeted Advertising</div>
              <div className="mt-1 text-sm text-black/70">
                <div><span className="font-semibold">ON:</span> Allow targeted advertising, attribution, and measurement (where permitted).</div>
                <div className="mt-1"><span className="font-semibold">OFF:</span> Opt out of sale/sharing for cross-context behavioral advertising and opt out of targeted advertising.</div>
              </div>
              {gpc && (
                <div className="mt-2 text-xs font-semibold text-black/60">
                  GPC is enabled — Targeted Advertising is forced OFF on this browser/device.
                </div>
              )}
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={ads}
                onChange={(e) => setAds(e.target.checked)}
                disabled={gpc}
              />
              <div className="peer h-6 w-11 rounded-full bg-black/15 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full peer-disabled:opacity-60" />
            </label>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-semibold text-[#2F2F2F]">Analytics</div>
              <div className="mt-1 text-sm text-black/70">
                <div><span className="font-semibold">ON:</span> Allow analytics technologies to help us understand and improve our Services.</div>
                <div className="mt-1"><span className="font-semibold">OFF:</span> Limit analytics technologies used to measure and improve our Services.</div>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-black/15 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        <button
          onClick={() => {
            const next: ConsentState = {
              analytics: analytics ? 'granted' : 'denied',
              ads: gpc ? 'denied' : ads ? 'granted' : 'denied',
              source: gpc ? 'gpc' : 'choices_page',
              ts: new Date().toISOString(),
            };
            persistConsent(next);
            setConsent(next);
            setSaved(true);

            // 为了让 TrackingGate 重新执行门禁，最稳是 reload
            window.setTimeout(() => window.location.reload(), 250);
          }}
          className="mt-8 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Save Preferences
        </button>

        {saved && (
          <div className="mt-3 text-sm text-black/70">
            Preferences saved for this browser/device.
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-bold text-[#2F2F2F]">Global Privacy Control (GPC)</h2>
        <p className="mt-2 text-sm text-black/70">
          Our processing of GPC signals occurs in a frictionless manner.
        </p>
        <div className="mt-3 text-sm text-black/80">
          <span className="font-semibold">GPC status on this browser/device:</span>{' '}
          {gpc ? 'Enabled' : 'Not detected'}
        </div>
        <div className="mt-2 text-sm text-black/70">
          {gpc
            ? 'Global Privacy Control is enabled on this browser/device. Your opt-out request is active here.'
            : 'Global Privacy Control is not detected on this browser/device.'}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          <span className="text-black/30">•</span>
          <Link to="/terms" className="underline underline-offset-4">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyChoicesPage;