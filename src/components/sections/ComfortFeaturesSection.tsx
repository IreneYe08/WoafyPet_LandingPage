import { useState } from 'react';
import {
  comfortBackgroundImage,
  waterResistantFabricImage,
  memoryFoamImage,
  temperatureControlImage,
} from '@/constants/images';
import { PrimaryButton } from '@/components/common';

import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

type FeatureType = 'cover' | 'foam' | 'heating';

interface ComfortFeaturesSectionProps {
  onOpenModal: (section?: string) => void;
}

const FEATURE_CONTENT: Record<FeatureType, { image: string; title: string; description: string }> = {
  cover: {
    image: waterResistantFabricImage,
    title: 'Scratch-resistant, waterproof, easy-clean and machine washable',
    description:
      'Breathable fibers prevent moisture retention, reducing heat for perfect summer sleep.',
  },
  foam: {
    image: memoryFoamImage,
    title: 'Orthopedic Support',
    description:
      "WoafyPet Bed relieves joint pressure. The cot-style design distributes weight evenly to reduce pressure points. Critical relief for seniors, preventative support for the young.",
  },
  heating: {
    image: temperatureControlImage,
    title: 'Temperature Control',
    description:
      'App-controlled heating lets you set the perfect warmth to soothe stiff joints and keep your furry friends cozy.',
  },
};

const HOTSPOT_POSITIONS: Record<FeatureType, string> = {
  cover: 'top-[56%] right-[50%]',
  foam: 'top-[60%] right-[35%]',
  heating: 'top-[71%] right-[38%]',
};

const FEATURE_TABS: { key: FeatureType; label: string }[] = [
  { key: 'heating', label: 'Heating' },
  { key: 'foam', label: 'Orthopedic Foam' },
  { key: 'cover', label: 'Waterproof Cover' },
];

export function ComfortFeaturesSection({ onOpenModal }: ComfortFeaturesSectionProps) {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('heating');
  const currentFeature = FEATURE_CONTENT[activeFeature];

  return (
    <Section tone="warm">
      <SectionHeading
        title="So Comfortable, They Won't Want to Leave"
        subtitle="Three core upgrades that turn ordinary rest into real recovery."
        className="mb-10 md:mb-12"
      />

      {/* Desktop: background + glass panel + hotspots */}
      <div
        className="relative hidden md:block rounded-3xl shadow-2xl overflow-hidden min-h-[620px] bg-cover bg-center"
        style={{ backgroundImage: `url(${comfortBackgroundImage})` }}
      >
        {/* 左侧玻璃面板 */}
        <div className="absolute left-0 top-0 bottom-0 w-[42%] bg-white/85 backdrop-blur-xl p-10 flex flex-col">
          <div className="flex flex-col h-full">
            <img
              src={currentFeature.image}
              alt={currentFeature.title}
              className="w-full h-56 object-cover rounded-2xl shadow-lg"
            />
            <h3 className="mt-6 text-2xl font-bold text-[#FD8829] leading-snug">
              {currentFeature.title}
            </h3>
            <p className="mt-4 text-[#666666] text-base leading-relaxed flex-grow">
              {currentFeature.description}
            </p>
            <PrimaryButton fullWidth onClick={() => onOpenModal('comfort')} className="mt-6">
              Join Waitlist Now
            </PrimaryButton>
          </div>
        </div>

        {/* Hotspots */}
        {(Object.keys(HOTSPOT_POSITIONS) as FeatureType[]).map((feature) => (
          <button
            key={feature}
            onClick={() => setActiveFeature(feature)}
            className={`absolute ${HOTSPOT_POSITIONS[feature]} w-6 h-6 rounded-full transition-all duration-300 cursor-pointer z-10 ${
              activeFeature === feature
                ? 'bg-[#FD8829] shadow-xl shadow-[#FD8829]/60'
                : 'bg-white shadow-xl'
            }`}
            aria-label={`View ${feature} features`}
          >
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                activeFeature === feature ? 'bg-[#FD8829]' : 'bg-white'
              }`}
            />
          </button>
        ))}

        <div className="absolute bottom-4 right-4 max-w-md text-right">
          <p className="text-xs text-white/80 leading-relaxed">
            Image is for illustration purposes only. Final product internal structure and design may vary.
          </p>
        </div>
      </div>

      {/* Mobile: image + tab buttons + card (稳定，不会错位) */}
      <div className="md:hidden space-y-6">
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          <img
            src={comfortBackgroundImage}
            alt="WoafyPet Bed comfort background"
            className="w-full h-[260px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex min-w-max gap-2 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5">
            {FEATURE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveFeature(t.key)}
                className={[
                  'whitespace-nowrap rounded-full px-4 py-3 text-sm font-semibold transition',
                  activeFeature === t.key
                    ? 'bg-[#FD8829] text-white shadow-md'
                    : 'text-[#666666] hover:text-[#333333]',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardBody className="p-6">
            <img
              src={currentFeature.image}
              alt={currentFeature.title}
              className="w-full h-44 object-cover rounded-2xl"
            />
            <h3 className="mt-5 text-xl font-bold text-[#FD8829] leading-snug">
              {currentFeature.title}
            </h3>
            <p className="mt-3 text-base text-[#666666] leading-relaxed">
              {currentFeature.description}
            </p>
            <PrimaryButton fullWidth onClick={() => onOpenModal('comfort')} className="mt-6">
              Join Waitlist Now
            </PrimaryButton>
          </CardBody>
        </Card>
      </div>
    </Section>
  );
}

export default ComfortFeaturesSection;