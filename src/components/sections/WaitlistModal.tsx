/**
 * WaitlistModal - Waitlist 注册模态框 (Production SSR Safe FINAL)
 * ✅ Updates in this version:
 * 1) Add required Privacy Policy + Terms of Service consent (with hyperlinks)
 * 2) Keep "I agree to receive product updates."
 * 3) Validation requires BOTH checkboxes
 * 4) Change Step 2 label: "How many dogs do you have?"
 */

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { PrimaryButton } from '@/components/common';
import { PersistentCountdown } from '@/app/components/PersistentCountdown';
import { trackEvent } from '@/lib/analytics';

/** ⚠️ Stripe 支付链接 */
const STRIPE_URL = 'https://buy.stripe.com/3cIdRacRW1PW2Efcv7bV600';

/**
 * ✅ Brevo API (called directly from the browser so this works on static hosts
 *    like GitHub Pages as well as the Hostinger PHP server).
 *
 *    Set VITE_BREVO_API_KEY in your GitHub Actions secrets / .env.production.
 *    Set VITE_BREVO_LIST_ID  (defaults to 13 if omitted).
 */
const BREVO_API_KEY  = (import.meta as any).env?.VITE_BREVO_API_KEY as string | undefined;
const BREVO_LIST_ID  = Number((import.meta as any).env?.VITE_BREVO_LIST_ID ?? 13);
const BREVO_API_URL  = 'https://api.brevo.com/v3/contacts';

/** ✅ Legal pages (change to your real routes if needed) */
const PRIVACY_URL = '/privacy';
const TERMS_URL = '/terms';

/** 前端正则 (做初步拦截，后端做最终裁决) */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ModalStep = 'form' | 'success' | 'upsell';

interface PetInfo {
  breed: string;
  age: string;
}

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
  onUpsellClick: () => void;
  onOfferExpire: () => void;
}

export function WaitlistModal({
  isOpen,
  onClose,
  onJoinSuccess,
  onUpsellClick,
  onOfferExpire,
}: WaitlistModalProps) {
  // --- State ---
  const [modalStep, setModalStep] = useState<ModalStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOfferExpired, setIsOfferExpired] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    consent: false,        // product updates
    legalConsent: false,   // privacy + terms
  });

  const [petQuantity, setPetQuantity] = useState('');
  const [pets, setPets] = useState<PetInfo[]>([]);

  /** ✅ 防止 confetti 重复触发 */
  const confettiFiredRef = useRef(false);
  /** GA4: waitlist form opened (once per modal open) */
  const formOpenedTrackedRef = useRef(false);
  /** GA4: discount/waitlist form started (first field interaction) */
  const formStartedTrackedRef = useRef(false);

  // --- Effects ---

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setIsOfferExpired(false);
    confettiFiredRef.current = false;
    formOpenedTrackedRef.current = false;
    formStartedTrackedRef.current = false;
  }, [isOpen]);

  /** GA4: waitlist form opened (modal visible, step = form) */
  useEffect(() => {
    if (!isOpen || modalStep !== 'form') return;
    if (formOpenedTrackedRef.current) return;
    formOpenedTrackedRef.current = true;
    trackEvent('waitlist_form_open', {
      form_id: 'waitlist_modal',
      form_name: 'Waitlist signup',
      section: 'modal',
    });
  }, [isOpen, modalStep]);

  useEffect(() => {
    if (!isOpen) return;
    if (modalStep !== 'upsell') return;
    if (confettiFiredRef.current) return;

    confettiFiredRef.current = true;
    triggerConfetti();
  }, [modalStep, isOpen]);

  // --- Logic ---

  /**
   * 🌟 SSR Safe Confetti: 动态导入，防止 window is not defined
   */
  const triggerConfetti = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { default: confetti } = await import('canvas-confetti');

      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          window.clearInterval(interval);
          return;
        }
        const particleCount = 45 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    } catch (e) {
      console.error('Confetti load failed', e);
    }
  };

  const handlePetQuantityChange = (quantity: string) => {
    setPetQuantity(quantity);
    const num = parseInt(quantity, 10) || 0;
    const safeNum = Math.min(num, 10);

    const newPets = Array.from({ length: safeNum }, (_, i) => ({
      breed: pets[i]?.breed || '',
      age: pets[i]?.age || '',
    }));
    setPets(newPets);
  };

  const handlePetChange = (index: number, field: 'breed' | 'age', value: string) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [field]: value };
    setPets(newPets);
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    setTimeout(() => {
      setModalStep('form');
      setFormData({ name: '', email: '', consent: false, legalConsent: false });
      setPetQuantity('');
      setPets([]);
      setErrorMsg('');
      setIsLoading(false);
      setIsOfferExpired(false);
      confettiFiredRef.current = false;
    }, 250);
  };

  const handleOfferExpireCallback = () => {
    setIsOfferExpired(true);
    onOfferExpire();
  };

  /**
   * 🌟 Step 1: 提交基础表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.name.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // ✅ require BOTH checkboxes
    if (!formData.consent) {
      setErrorMsg('Please agree to receive product updates.');
      return;
    }
    if (!formData.legalConsent) {
      setErrorMsg('You must agree to the Privacy Policy and Terms of Service.');
      return;
    }

    setIsLoading(true);

    try {
      if (!BREVO_API_KEY) {
        // API key not yet configured — skip the Brevo call and proceed so
        // the UX still works. A console warning helps the developer diagnose.
        console.warn(
          '[WoafyPet] VITE_BREVO_API_KEY is not set. ' +
          'Configure the BREVO_API_KEY GitHub Actions secret so email addresses are saved.'
        );
        setFormData((prev) => ({ ...prev, name: cleanName, email: cleanEmail }));
        trackEvent('generate_lead', { form_id: 'waitlist_modal', form_name: 'Waitlist signup', section: 'modal' });
        setModalStep('success');
        onJoinSuccess();
        return;
      }

      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          email: cleanEmail,
          attributes: { FIRSTNAME: cleanName },
          listIds: [BREVO_LIST_ID],
          updateEnabled: true,
        }),
      });

      // 200/201 = created, 204 = updated — all are success
      if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error((errBody as any).message || `Server error: ${response.status}`);
      }

      setFormData((prev) => ({
        ...prev,
        name: cleanName,
        email: cleanEmail,
        consent: true,
        legalConsent: true,
      }));

      trackEvent('generate_lead', {
        form_id: 'waitlist_modal',
        form_name: 'Waitlist signup',
        section: 'modal',
      });
      trackEvent('waitlist_submit_success', {
        form_id: 'waitlist_modal',
        form_name: 'Waitlist signup',
        section: 'modal',
      });

      setModalStep('success');
      onJoinSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🌟 Step 2: 提交宠物信息
   */
  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseInt(petQuantity, 10) || 0;
    if (qty <= 0) {
      setModalStep('upsell');
      return;
    }

    setIsLoading(true);

    const cleanedPets = pets
      .slice(0, qty)
      .map((p) => ({
        breed: (p.breed || '').trim() || 'Unknown',
        age: (p.age || '').toString().trim() || 'Unknown',
      }));

    const petDetails = cleanedPets.map((p) => `${p.breed}(${p.age})`).join(', ');
    const petInfoString = `${qty} Pets: ${petDetails}`;

    const currentEmail = formData.email;

    try {
      // Update the Brevo contact with pet info if the API key is available.
      if (BREVO_API_KEY) {
        const response = await fetch(`${BREVO_API_URL}/${encodeURIComponent(currentEmail)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify({
            attributes: { PET_INFO: petInfoString },
          }),
        });
        if (!response.ok) console.warn('Step 2 save warning', response.status);
      }
      setModalStep('upsell');
    } catch (error) {
      console.error('Pet info error:', error);
      setModalStep('upsell');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPetInfo = () => {
    setModalStep('upsell');
  };

  const handleUpsell = () => {
    if (isOfferExpired) return;
    trackEvent('begin_checkout', {
      button_name: '$1.99 for 50% off',
      section: 'modal',
    });
    onUpsellClick();
    window.location.href = STRIPE_URL;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => !isLoading && handleClose()}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {modalStep !== 'success' && !isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}

        <div className="p-8 overflow-y-auto">
          {/* --- Step 1 --- */}
          {modalStep === 'form' && (
            <>
              <h2 className="text-3xl mb-3 text-[#3D3D3D] text-center">Your Buddy Is Waiting!</h2>
              <p className="text-[#666666] text-center mb-8">
                Be the first to know when WoafyPet launches. Early supporters get exclusive perks.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (!formStartedTrackedRef.current) {
                        formStartedTrackedRef.current = true;
                        trackEvent('discount_form_started', {
                          form_id: 'waitlist_modal',
                          form_name: 'Waitlist signup',
                          section: 'modal',
                        });
                      }
                    }}
                    onFocus={() => {
                      if (!formStartedTrackedRef.current) {
                        formStartedTrackedRef.current = true;
                        trackEvent('discount_form_started', {
                          form_id: 'waitlist_modal',
                          form_name: 'Waitlist signup',
                          section: 'modal',
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (!formStartedTrackedRef.current) {
                        formStartedTrackedRef.current = true;
                        trackEvent('discount_form_started', {
                          form_id: 'waitlist_modal',
                          form_name: 'Waitlist signup',
                          section: 'modal',
                        });
                      }
                    }}
                    onFocus={() => {
                      if (!formStartedTrackedRef.current) {
                        formStartedTrackedRef.current = true;
                        trackEvent('discount_form_started', {
                          form_id: 'waitlist_modal',
                          form_name: 'Waitlist signup',
                          section: 'modal',
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                    disabled={isLoading}
                  />
                </div>

                {/* ✅ Consent 1: product updates */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent_updates"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[#FD8829] border-gray-300 rounded focus:ring-[#FD8829]"
                    disabled={isLoading}
                  />
                  <label htmlFor="consent_updates" className="text-sm text-[#666666] cursor-pointer">
                    I agree to receive product updates.
                  </label>
                </div>

                {/* ✅ Consent 2: privacy + terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent_legal"
                    checked={formData.legalConsent}
                    onChange={(e) =>
                      setFormData({ ...formData, legalConsent: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 text-[#FD8829] border-gray-300 rounded focus:ring-[#FD8829]"
                    disabled={isLoading}
                  />
                  <label htmlFor="consent_legal" className="text-sm text-[#666666] cursor-pointer">
                    I agree to the{' '}
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FD8829] hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FD8829] hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </a>
                    .
                  </label>
                </div>

                <PrimaryButton type="submit" size="lg" fullWidth disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Submit'}
                </PrimaryButton>
              </form>
            </>
          )}

          {/* --- Step 2 --- */}
          {modalStep === 'success' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-3xl mb-3 text-[#3D3D3D]">You're on the list! 🎉</h2>
                <p className="text-[#666666] mb-6">Thanks for joining!</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg mb-2 text-[#3D3D3D] text-center">
                  Tell us about your pack (Optional)
                </h3>
                <p className="text-sm text-[#666666] text-center mb-6">
                  For relevant health updates.
                </p>

                <form onSubmit={handlePetSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">
                      How many dogs do you have?
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2"
                      value={petQuantity}
                      onChange={(e) => handlePetQuantityChange(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                      disabled={isLoading}
                    />
                    <p className="mt-2 text-xs text-[#999999]">(Max 10 for now to keep the form fast.)</p>
                  </div>

                  {pets.map((pet, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-4">
                      <div className="text-sm font-medium text-[#3D3D3D]">Pet {index + 1}</div>

                      <div>
                        <label className="block text-sm text-[#666666] mb-2">Breed</label>
                        <input
                          type="text"
                          placeholder="e.g., Golden Retriever"
                          value={pet.breed}
                          onChange={(e) => handlePetChange(index, 'breed', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#666666] mb-2">Age</label>
                        <input
                          type="number"
                          placeholder="e.g., 5"
                          value={pet.age}
                          onChange={(e) => handlePetChange(index, 'age', e.target.value)}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ))}

                  <PrimaryButton type="submit" size="lg" fullWidth disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Continue'}
                  </PrimaryButton>
                </form>

                <button
                  onClick={handleSkipPetInfo}
                  disabled={isLoading}
                  className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {/* --- Step 3 --- */}
          {modalStep === 'upsell' && (
            <>
              <div className="text-center mb-3">
                <h2 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-[#FD8829] via-[#FF6B35] to-[#FD8829] bg-clip-text text-transparent animate-pulse">
                  Congratulations,
                  <br />
                  <span className="block mt-1 text-4xl">You Have Been Chosen!</span>
                </h2>
                <p className="text-base text-[#666666] mt-2">🎉 You're one of the lucky few! 🎉</p>
              </div>

              <PersistentCountdown onExpire={handleOfferExpireCallback} />

              <div
                className={`bg-orange-50 border-2 border-[#FD8829] rounded-2xl p-4 mb-4 transition-opacity ${
                  isOfferExpired ? 'opacity-50 grayscale' : ''
                }`}
              >
                <h3 className="text-2xl font-bold mb-3 text-[#FD8829] text-center animate-pulse">
                  {isOfferExpired ? 'Offer Expired' : '🔥 Limited Early Bird Deal 🔥'}
                </h3>

                <div className="relative bg-gradient-to-r from-[#FD8829] to-[#E57620] rounded-xl p-4 mb-3 shadow-lg">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-50 rounded-full" />
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-50 rounded-full" />
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/30" />
                  <div className="text-center">
                    <div className="text-white text-5xl font-extrabold mb-1 drop-shadow-lg">50% OFF</div>
                    <div className="text-white text-xl font-semibold">
                      for just <span className="font-bold">$1.99</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 text-[#3D3D3D]">
                  <li className="flex items-center gap-2">
                    <Shield size={18} className="text-[#FD8829] flex-shrink-0" />
                    <span className="text-sm text-[#666666]">100% refundable at any time.</span>
                  </li>
                </ul>
              </div>

              <PrimaryButton
                onClick={handleUpsell}
                size="lg"
                fullWidth
                disabled={isOfferExpired}
                className={`shadow-xl hover:shadow-2xl transform transition-all ${
                  isOfferExpired ? 'cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isOfferExpired ? 'Offer Expired' : 'Claim My 50% Discount Now'}
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitlistModal;