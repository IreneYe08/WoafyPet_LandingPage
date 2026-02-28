import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  hasStoredConsent,
  isGpcEnabled,
  loadConsent,
  setConsentAllDenied,
  setConsentAllGranted,
} from '@/lib/consent';

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const gpc = useMemo(() => isGpcEnabled(), []);

  useEffect(() => {
    // GPC：强制 ads denied（loadConsent 会写入），可以选择仍提示但不做二次确认
    if (gpc) {
      loadConsent(); // 触发 gpc persist
      // 方案A：仍显示提示 banner（但不需要“确认弹窗”）
      setOpen(true);
      return;
    }

    // 非首次：不显示
    if (hasStoredConsent()) {
      setOpen(false);
      return;
    }

    setOpen(true);
  }, [gpc]);

  if (!open) return null;

  if (gpc) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999]">
        <div className="mx-auto max-w-[980px] rounded-2xl border border-black/10 bg-white shadow-xl px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-black/80">
              Global Privacy Control (GPC) is enabled on this browser/device. We&apos;ve applied an opt-out
              for targeted advertising (Ads OFF) in a frictionless manner.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/privacy-choices"
                className="text-sm font-semibold text-black underline underline-offset-4"
              >
                Learn more
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999]">
      <div className="mx-auto max-w-[980px] rounded-2xl border border-black/10 bg-white shadow-xl px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-black/80">
            We use cookies/pixels for necessary site functions, analytics, and targeted advertising. You can accept all,
            decline non-essential, or manage preferences.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setConsentAllGranted();
                setOpen(false);
                // 写完 consent 后，刷新一次让 TrackingGate 重新读取（最稳）
                window.location.reload();
              }}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Accept All
            </button>

            <button
              onClick={() => {
                setConsentAllDenied('banner');
                setOpen(false);
              }}
              className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Decline Non-Essential
            </button>

            <button
              onClick={() => {
                setOpen(false);
                navigate('/privacy-choices');
              }}
              className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;