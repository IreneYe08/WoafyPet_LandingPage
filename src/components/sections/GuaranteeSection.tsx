import { Shield } from 'lucide-react';
import { happySeniorDogImage } from '@/constants/images';
import { PrimaryButton } from '@/components/common';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

import { Section } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

interface GuaranteeSectionProps {
  onOpenModal: (section?: string) => void;
}

export function GuaranteeSection({ onOpenModal }: GuaranteeSectionProps) {
  return (
    <Section tone="white">
      <Card className="relative overflow-hidden">
        <ImageWithFallback
          src={happySeniorDogImage}
          alt="Happy Senior Dog Walking with Owner"
          className="w-full h-[360px] sm:h-[420px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent" />

        <div className="absolute inset-0 flex items-end p-6 sm:p-8 lg:p-10">
          <div className="text-white max-w-[46ch]">
            <Shield className="mb-4 text-white" size={44} />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              30 Day Happiness Guarantee
            </h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed">
              Try WoafyPet risk-free for 30 days. If you&apos;re not completely satisfied,
              return it for a full refund.
            </p>
            <div className="mt-6">
              <PrimaryButton size="lg" onClick={() => onOpenModal('guarantee')}>
                Join Waitlist Now
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Card>
    </Section>
  );
}

export default GuaranteeSection;