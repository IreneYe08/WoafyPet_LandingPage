import { logoImage } from '@/constants/images';
import { PrimaryButton } from '@/components/common';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  isScrolled: boolean;
  hasJoinedWaitlist: boolean;
  offerExpired: boolean;
  onOpenModal: (section?: string) => void;
  onOpenCart: () => void;
}

export function HeroSection({
  isScrolled,
  onOpenModal,
  onOpenCart,
}: HeroSectionProps) {
  return (
    <>
      <nav
        className={[
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-sm'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div
            className={`flex items-center justify-between ${
              isScrolled ? 'py-3' : 'py-4'
            }`}
          >
            {/* Left: logo + nav */}
            <div className="flex items-center gap-8 md:gap-12">
              <Link to="/" className="shrink-0">
                <img
                  src={logoImage}
                  alt="WoafyPet Logo"
                  className="h-10 w-auto md:h-12"
                />
              </Link>

              <div className="hidden md:flex items-center">
                <Link
                  to="/blog"
                  className={[
                    'text-base font-medium uppercase tracking-[0.16em] transition',
                    isScrolled
                      ? 'text-[#2F2F2F] hover:text-[#FD8829]'
                      : 'text-white hover:text-white/80',
                  ].join(' ')}
                >
                  Care Guides
                </Link>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onOpenCart}
                className={[
                  'relative flex items-center justify-center rounded-lg p-2 transition',
                  isScrolled ? 'hover:bg-gray-100/80' : 'hover:bg-white/10',
                ].join(' ')}
                aria-label="Shopping Cart"
              >
                <ShoppingCart
                  size={22}
                  className={isScrolled ? 'text-gray-600' : 'text-white/90'}
                />
              </button>

              <PrimaryButton
                onClick={() => onOpenModal('hero')}
                className="px-4 sm:px-5"
              >
                Join Waitlist Now
              </PrimaryButton>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative w-full overflow-hidden">
        <div className="relative h-[86vh] min-h-[620px] w-full">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={`${import.meta.env.BASE_URL}images/hero-poster.jpg`}
          >
            <source
              src={`${import.meta.env.BASE_URL}videos/heroV3.webm`}
              type="video/webm"
            />
            <source
              src={`${import.meta.env.BASE_URL}videos/heroV3.mp4`}
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-black/25" />

          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="mx-auto max-w-[980px] px-5 pt-16 text-center sm:px-8 md:pt-20">
              <div className="mb-5 flex justify-center">
                <div className="inline-flex items-center rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white">
                  Patent Pending
                </div>
              </div>

              <h1 className="text-[2.2rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[2.6rem] md:text-6xl lg:text-7xl">
                World&apos;s First AI–Powered
                <br className="hidden sm:block" />
                Orthopedic Dog Bed
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                Because your best friend deserves to wake up pain-free every
                morning.
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