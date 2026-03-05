import { logoImage } from '@/constants/images';
import { PrimaryButton } from '@/components/common';
import { ShoppingCart } from 'lucide-react';
import { MiniCountdown } from '@/app/components/MiniCountdown';

interface HeroSectionProps {
  isScrolled: boolean;
  hasJoinedWaitlist: boolean;
  offerExpired: boolean;
  onOpenModal: (section?: string) => void;
  onOpenCart: () => void;
}

export function HeroSection({
  isScrolled,
  hasJoinedWaitlist,
  offerExpired,
  onOpenModal,
  onOpenCart,
}: HeroSectionProps) {
  return (
    <>
      {/* --- Nav (overlays video) --- */}
      <nav
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className={`flex items-center justify-between ${isScrolled ? 'py-3' : 'py-4'}`}>
            <img src={logoImage} alt="WoafyPet Logo" className="h-10 md:h-12 w-auto" />

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onOpenCart}
                className={[
                  'relative flex items-center justify-center rounded-lg p-2 transition',
                  isScrolled ? 'hover:bg-gray-100/80' : 'hover:bg-white/10',
                ].join(' ')}
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={22} className={isScrolled ? 'text-gray-600' : 'text-white/90'} />

                {hasJoinedWaitlist && !offerExpired && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FD8829] text-[10px] font-bold text-white ring-2 ring-white">
                      1
                    </span>
                    <MiniCountdown />
                  </>
                )}
              </button>

              <PrimaryButton onClick={() => onOpenModal('hero')} className="px-4 sm:px-5">
                Join Waitlist Now
              </PrimaryButton>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero --- */}
      <section className="relative w-full overflow-hidden">
        {/* ✅ full-bleed hero height */}
        <div className="relative h-[86vh] min-h-[620px] w-full">
          {/* ✅ Video goes to the very top (no padding above it) */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-poster.jpg"
          >
            <source src="/videos/heroV3.webm" type="video/webm" />
            <source src="/videos/heroV3.mp4" type="video/mp4" />
          </video>

          {/* ✅ 25% dark overlay */}
          <div className="absolute inset-0 bg-black/25" />

          {/* ✅ Center content (push content down a bit to avoid nav overlap) */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="mx-auto max-w-[980px] px-5 sm:px-8 text-center pt-16 md:pt-20">
              <div className="mb-5 flex justify-center">
                <div className="inline-flex items-center rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white">
                  Patent Pending
                </div>
              </div>

              <h1 className="text-white font-extrabold tracking-tight leading-[1.05] text-[2.2rem] sm:text-[2.6rem] md:text-6xl lg:text-7xl">
                World&apos;s First AI–Powered
                <br className="hidden sm:block" />
                  Orthopedic Dog Bed
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-white/90 text-base md:text-lg leading-relaxed">
                Because your best friend deserves to wake up pain-free every morning.
              </p>

              <div className="mt-7 flex justify-center">
                <PrimaryButton
                  size="lg"
                  onClick={() => onOpenModal('hero')}
                  className="shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Join Waitlist Now
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;