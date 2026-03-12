/**
 * App.tsx - WoafyPet Landing Page 主应用组件
 *
 * Changes in this version:
 * - Removed old offer state (offerStartTime / offerExpired / upsell flow)
 * - Removed waitlist-to-50%-off logic
 * - Keeps NewsletterPopup
 * - Keeps blog / updates / faq / privacy routes
 *
 * Note:
 * - HeroSection and CartPage are kept temporarily compatible by passing
 *   hasJoinedWaitlist={false} and offerExpired={false}.
 * - You can clean those components next.
 */

import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';

import FAQPage from '@/pages/FAQPage';
import NewsletterPopup from '@/components/common/NewsletterPopup';

// Section 组件
import {
  HeroSection,
  ProductIntroSection,
  BenefitsGridSection,
  JointHealthSection,
  ComfortFeaturesSection,
  AppFeaturesSection,
  FoamLayersSection,
  ComparisonSection,
  VetRecommendedSection,
  MediaLogosSection,
  TestimonialsSection,
  FounderStorySection,
  SpecificationsSection,
  GuaranteeSection,
  WaitlistModal,
} from '@/components/sections';

import UpdatesPreviewSection from '@/components/sections/UpdatesPreviewSection';

// 页面级组件
import { CartPage } from '@/app/components/CartPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import UpdatesPage from '@/pages/UpdatesPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyChoicesPage from '@/pages/PrivacyChoicesPage';

/**
 * Stripe Payment Link
 * Kept only for temporary CartPage compatibility.
 */
const STRIPE_PAYMENT_LINK_URL =
  (import.meta as any)?.env?.VITE_STRIPE_PAYMENT_LINK_URL ||
  'https://buy.stripe.com/3cIdRacRW1PW2Efcv7bV600';

function LandingPage() {
  const [showCart, setShowCart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.title = 'WoafyPet Bed | Smarter Comfort and Care for Dogs';

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (metaDescription) {
      metaDescription.content =
        'WoafyPet Bed combines orthopedic comfort and smarter pet care for better rest, support, and peace of mind.';
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    trackEvent('lp_open', { section: 'landing' });
  }, []);

  useScrollDepth([25, 50, 75, 90]);

  const openModal = (section?: string) => {
    trackEvent('click', {
      button_name: 'Join Waitlist Now',
      section: section || 'unknown',
    });

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openCart = () => setShowCart(true);

  const goToStripeCheckout = () => {
    window.location.assign(STRIPE_PAYMENT_LINK_URL);
  };

  const handleJoinSuccess = () => {
    localStorage.setItem('hasJoinedWaitlist', 'true');
  };

  if (showCart) {
    return (
      <CartPage
        onBack={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          goToStripeCheckout();
        }}
        hasJoinedWaitlist={false}
        offerExpired={false}
        onOfferExpire={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <NewsletterPopup />

      <HeroSection
        isScrolled={isScrolled}
        hasJoinedWaitlist={false}
        offerExpired={false}
        onOpenModal={openModal}
        onOpenCart={openCart}
      />

      <ProductIntroSection />
      <BenefitsGridSection />
      <JointHealthSection />
      <ComfortFeaturesSection onOpenModal={openModal} />
      <AppFeaturesSection />
      <FoamLayersSection />
      <ComparisonSection />
      <VetRecommendedSection />
      <MediaLogosSection />
      <TestimonialsSection />
      <FounderStorySection />
      <UpdatesPreviewSection />
      <SpecificationsSection />
      <GuaranteeSection onOpenModal={openModal} />

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onJoinSuccess={handleJoinSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/updates" element={<UpdatesPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy-choices" element={<PrivacyChoicesPage />} />
      <Route path="/faq" element={<FAQPage />} />
    </Routes>
  );
}