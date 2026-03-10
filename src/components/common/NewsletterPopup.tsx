import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const POPUP_CLOSED_KEY = 'woafypet_popup_closed';
const POPUP_SUBMITTED_KEY = 'woafypet_popup_submitted';

const CLOSE_SUPPRESS_DAYS = 7;
const SUBMIT_SUPPRESS_DAYS = 30;

function getDaysInMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

function getStoredTimestamp(key: string): number | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function isWithinSuppressWindow(key: string, days: number): boolean {
  const stored = getStoredTimestamp(key);
  if (!stored) return false;

  const now = Date.now();
  return now - stored < getDaysInMs(days);
}

function getUTMParams() {
  const searchParams = new URLSearchParams(window.location.search);

  return {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_content: searchParams.get('utm_content') || '',
    utm_term: searchParams.get('utm_term') || '',
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const utm = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: '',
        utm_term: '',
      };
    }

    return getUTMParams();
  }, []);

  useEffect(() => {
    const shouldSuppressForClose = isWithinSuppressWindow(
      POPUP_CLOSED_KEY,
      CLOSE_SUPPRESS_DAYS
    );

    const shouldSuppressForSubmit = isWithinSuppressWindow(
      POPUP_SUBMITTED_KEY,
      SUBMIT_SUPPRESS_DAYS
    );

    if (shouldSuppressForClose || shouldSuppressForSubmit) return;

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible || hasViewed) return;

    trackEvent('popup_view', {
      popup_name: 'newsletter_10_off',
      page: 'landing_page',
    });

    setHasViewed(true);
  }, [isVisible, hasViewed]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    localStorage.setItem(POPUP_CLOSED_KEY, String(Date.now()));

    trackEvent('popup_close', {
      popup_name: 'newsletter_10_off',
      page: 'landing_page',
    });

    setIsVisible(false);
  };

  const handleContinueBrowsing = () => {
    setIsVisible(false);
  };

  const handleOverlayClick = () => {
    handleClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    trackEvent('popup_submit', {
      popup_name: 'newsletter_10_off',
      page: 'landing_page',
      source: 'popup',
    });

    try {
      const response = await fetch('/api/waitlist.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          source: 'popup',
          page: 'landing_page',
          timestamp: new Date().toISOString(),
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          referrer: document.referrer || '',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || 'Something went wrong. Please try again.'
        );
      }

      localStorage.setItem(POPUP_SUBMITTED_KEY, String(Date.now()));

      trackEvent('popup_success', {
        popup_name: 'newsletter_10_off',
        page: 'landing_page',
        source: 'popup',
      });

      setSubmitSuccess(true);
      setEmail('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Join the WoafyPet List"
    >
      <button
        type="button"
        aria-label="Close popup"
        onClick={handleOverlayClick}
        className="absolute inset-0 bg-black/55"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute right-4 top-4 rounded-lg p-2 text-[#777777] transition hover:bg-black/5 hover:text-[#333333]"
        >
          ✕
        </button>

        {!submitSuccess ? (
          <>
            <h2 className="pr-10 text-2xl font-semibold tracking-tight text-[#2F2F2F] sm:text-[2rem]">
              Join the WoafyPet List
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
              Sign up for our newsletter to get{' '}
              <span className="font-semibold text-[#2F2F2F]">
                10% off your first order
              </span>{' '}
              and early access to launch updates, special offers, and product
              news.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <label htmlFor="newsletter-email" className="sr-only">
                Enter your email
              </label>

              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#D8D8D8] bg-white px-4 py-3 text-base text-[#2F2F2F] outline-none transition placeholder:text-[#999999] focus:border-[#FD8829] focus:ring-2 focus:ring-[#FD8829]/15"
                disabled={isSubmitting}
              />

              {errorMessage ? (
                <p className="mt-3 text-sm text-[#C43D2F]">{errorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#FD8829] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Unlock 10% Off'}
              </button>

              <p className="mt-4 text-xs leading-6 text-[#7A7A7A]">
                By subscribing, you agree to receive marketing emails from
                WoafyPet. You can unsubscribe at any time.
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="pr-10 text-2xl font-semibold tracking-tight text-[#2F2F2F] sm:text-[2rem]">
              You&apos;re in!
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
              Your 10% off code is{' '}
              <span className="font-semibold text-[#2F2F2F]">WELCOME10</span>
            </p>

            <p className="mt-4 text-sm leading-7 text-[#5A5A5A] sm:text-base">
              We&apos;ll also keep you updated on product news, launch updates,
              and exclusive offers.
            </p>

            <button
              type="button"
              onClick={handleContinueBrowsing}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#2F2F2F] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue Browsing
            </button>
          </>
        )}
      </div>
    </div>
  );
}