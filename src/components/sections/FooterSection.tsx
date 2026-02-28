import { useEffect, useState } from 'react';
import { logoImage } from '@/constants/images';

export function FooterSection() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (!isSupportOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSupportOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSupportOpen]);

  return (
    <footer className="bg-[#3D3D3D] text-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Brand */}
          <div>
            <img
              src={logoImage}
              alt="WoafyPet Logo"
              className="h-12 mb-6 brightness-0 invert"
            />
            <p className="text-sm text-white/70 leading-relaxed max-w-[36ch]">
              Smart orthopedic comfort + passive health insights—built for real pets and real homes.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-base font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/privacy-choices" className="hover:text-white transition-colors">
                  Your Privacy Choices
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-base font-semibold mb-4">Follow Us</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
              <a
                href="https://www.instagram.com/woafy.pet?igsh=MTB3ZThkb2Y5dmY2cw=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@woafmeow_m"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                TikTok
              </a>
              <a
                href="https://www.facebook.com/share/1bVDzBdAyK/?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://discord.gg/fkzqUnY9"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 pt-8 text-center text-white/60 text-sm">
          <p>© 2026 WoafMeow Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Support Modal */}
      {isSupportOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Contact Support"
        >
          {/* overlay */}
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsSupportOpen(false)}
          />

          {/* modal card */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-[#333333] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold">Contact Support</h3>
              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                className="rounded-lg p-2 text-[#666666] hover:bg-black/5 hover:text-[#333333] transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-[#555555] leading-relaxed">
              Email us at:
              <a
                href="mailto:support@woafmeow.com"
                className="ml-1 font-semibold text-[#333333] underline underline-offset-2 hover:opacity-80"
              >
                support@woafmeow.com
              </a>
            </p>

            <p className="mt-2 text-sm text-[#777777]">
              We typically respond within <span className="font-semibold">3 business days</span>.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSupportOpen(false)}
                className="rounded-xl bg-[#333333] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default FooterSection;