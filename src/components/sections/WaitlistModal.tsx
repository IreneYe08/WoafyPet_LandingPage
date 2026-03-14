/**
 * WaitlistModal - WoafyPet Waitlist Modal
 *
 * Changes in this version:
 * 1) Removed 50% OFF upsell flow
 * 2) Removed Stripe redirect / countdown / offer expiration logic
 * 3) Uses backend /api/waitlist instead of direct Brevo browser call
 * 4) Keeps required product updates consent + privacy/terms consent
 * 5) Keeps optional Step 2 pet info collection
 */

import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { PrimaryButton } from '@/components/common';
import { trackEvent } from '@/lib/analytics';

const WAITLIST_API_URL = '/api/waitlist';
const PRIVACY_URL = '/privacy';
const TERMS_URL = '/terms';

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ModalStep = 'form' | 'success';

interface PetInfo {
  breed: string;
  age: string;
}

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

export function WaitlistModal({
  isOpen,
  onClose,
  onJoinSuccess,
}: WaitlistModalProps) {
  const [modalStep, setModalStep] = useState<ModalStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    consent: false,
    legalConsent: false,
  });

  const [petQuantity, setPetQuantity] = useState('');
  const [pets, setPets] = useState<PetInfo[]>([]);
  const [isSavingPets, setIsSavingPets] = useState(false);

  const formOpenedTrackedRef = useRef(false);
  const formStartedTrackedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    setModalStep('form');
    setIsLoading(false);
    setIsSavingPets(false);
    setPetQuantity('');
    setPets([]);
    formOpenedTrackedRef.current = false;
    formStartedTrackedRef.current = false;
  }, [isOpen]);

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

  const handlePetQuantityChange = (quantity: string) => {
    setPetQuantity(quantity);

    const num = parseInt(quantity, 10) || 0;
    const safeNum = Math.min(Math.max(num, 0), 10);

    const nextPets = Array.from({ length: safeNum }, (_, index) => ({
      breed: pets[index]?.breed || '',
      age: pets[index]?.age || '',
    }));

    setPets(nextPets);
  };

  const handlePetChange = (
    index: number,
    field: 'breed' | 'age',
    value: string
  ) => {
    const nextPets = [...pets];
    nextPets[index] = {
      ...nextPets[index],
      [field]: value,
    };
    setPets(nextPets);
  };

  const resetModal = () => {
    setModalStep('form');
    setFormData({
      name: '',
      email: '',
      consent: false,
      legalConsent: false,
    });
    setPetQuantity('');
    setPets([]);
    setErrorMsg('');
    setIsLoading(false);
    setIsSavingPets(false);
  };

  const handleClose = () => {
    if (isLoading || isSavingPets) return;

    onClose();

    window.setTimeout(() => {
      resetModal();
    }, 250);
  };

  const getUTMParams = () => {
    const params = new URLSearchParams(window.location.search);

    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!formData.consent) {
      setErrorMsg('Please agree to receive product updates.');
      return;
    }

    if (!formData.legalConsent) {
      setErrorMsg(
        'You must agree to the Privacy Policy and Terms of Service.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const utm = getUTMParams();

      const response = await fetch(WAITLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          step: '1',
          source: 'waitlist_modal',
          page: 'landing_page',
          timestamp: new Date().toISOString(),
          name: cleanName,
          email: cleanEmail,
          consent: true,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          referrer: document.referrer || '',
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.status !== 'success') {
        throw new Error(
          result?.message_en ||
            result?.message ||
            'Something went wrong. Please try again.'
        );
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

      onJoinSuccess();
      setModalStep('success');
    } catch (error) {
      console.error('Waitlist submit error:', error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseInt(petQuantity, 10) || 0;
    if (qty <= 0) {
      handleClose();
      return;
    }

    setIsSavingPets(true);

    const cleanedPets = pets.slice(0, qty).map((pet) => ({
      breed: (pet.breed || '').trim() || 'Unknown',
      age: (pet.age || '').toString().trim() || 'Unknown',
    }));

    const petInfoString = `${qty} Pets: ${cleanedPets
      .map((pet) => `${pet.breed}(${pet.age})`)
      .join(', ')}`;

    try {
      const response = await fetch(WAITLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          step: '2',
          email: formData.email.trim().toLowerCase(),
          pets: petInfoString,
          source: 'waitlist_modal',
          page: 'landing_page',
          timestamp: new Date().toISOString(),
          referrer: document.referrer || '',
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.status !== 'success') {
        throw new Error(
          result?.message_en ||
            result?.message ||
            'Unable to save pet details.'
        );
      }

      handleClose();
    } catch (error) {
      console.error('Pet info submit error:', error);
      handleClose();
    } finally {
      setIsSavingPets(false);
    }
  };

  const handleSkipPetInfo = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => !(isLoading || isSavingPets) && handleClose()}
    >
      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoading && !isSavingPets && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}

        <div className="overflow-y-auto p-8">
          {modalStep === 'form' && (
            <>
              <h2 className="mb-3 text-center text-3xl text-[#3D3D3D]">
                Join the WoafyPet List
              </h2>

              <p className="mb-8 text-center text-[#666666]">
                Be the first to hear about product updates, launch news, and
                early access opportunities.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#3D3D3D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FD8829]"
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#3D3D3D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FD8829]"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent_updates"
                    checked={formData.consent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consent: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FD8829] focus:ring-[#FD8829]"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="consent_updates"
                    className="cursor-pointer text-sm text-[#666666]"
                  >
                    I agree to receive product updates.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent_legal"
                    checked={formData.legalConsent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        legalConsent: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FD8829] focus:ring-[#FD8829]"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="consent_legal"
                    className="cursor-pointer text-sm text-[#666666]"
                  >
                    I agree to the{' '}
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#FD8829] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#FD8829] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </a>
                    .
                  </label>
                </div>

                <PrimaryButton
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Join Waitlist'}
                </PrimaryButton>
              </form>
            </>
          )}

          {modalStep === 'success' && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle size={48} className="text-green-600" />
                </div>

                <h2 className="mb-3 text-3xl text-[#3D3D3D]">
                  You&apos;re on the list! 🎉
                </h2>

                <p className="text-[#666666]">
                  Thanks for joining. We&apos;ll keep you updated on product
                  progress, launch news, and early access opportunities.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="mb-2 text-center text-lg text-[#3D3D3D]">
                  Tell us about your pack (Optional)
                </h3>

                <p className="mb-6 text-center text-sm text-[#666666]">
                  This helps us understand who we&apos;re building for.
                </p>

                <form onSubmit={handlePetSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm text-[#3D3D3D]">
                      How many dogs do you have?
                    </label>

                    <input
                      type="number"
                      placeholder="e.g., 2"
                      value={petQuantity}
                      onChange={(e) =>
                        handlePetQuantityChange(e.target.value)
                      }
                      min="1"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[#3D3D3D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FD8829]"
                      disabled={isSavingPets}
                    />

                    <p className="mt-2 text-xs text-[#999999]">
                      Max 10 for now to keep the form fast.
                    </p>
                  </div>

                  {pets.map((pet, index) => (
                    <div
                      key={index}
                      className="space-y-4 rounded-xl border border-gray-200 p-4"
                    >
                      <div className="text-sm font-medium text-[#3D3D3D]">
                        Pet {index + 1}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-[#666666]">
                          Breed
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Golden Retriever"
                          value={pet.breed}
                          onChange={(e) =>
                            handlePetChange(index, 'breed', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-[#3D3D3D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FD8829]"
                          disabled={isSavingPets}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-[#666666]">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 5"
                          value={pet.age}
                          onChange={(e) =>
                            handlePetChange(index, 'age', e.target.value)
                          }
                          min="0"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-[#3D3D3D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FD8829]"
                          disabled={isSavingPets}
                        />
                      </div>
                    </div>
                  ))}

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    fullWidth
                    disabled={isSavingPets}
                  >
                    {isSavingPets ? 'Saving...' : 'Save & Continue'}
                  </PrimaryButton>
                </form>

                <button
                  onClick={handleSkipPetInfo}
                  disabled={isSavingPets}
                  className="mt-4 w-full text-sm text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitlistModal;