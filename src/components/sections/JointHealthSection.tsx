import { dogPlayingImage, dogRestingImage, dogJointCareImage } from '@/constants/images';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

import { Section } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

function JointRow({
  image,
  alt,
  text,
  reverse = false,
}: {
  image: string;
  alt: string;
  text: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div className="md:col-span-6">
        <Card className="overflow-hidden">
          <ImageWithFallback src={image} alt={alt} className="w-full h-[260px] sm:h-[340px] object-cover" loading="lazy" decoding="async" />
        </Card>
      </div>
      <div className="md:col-span-6">
        <p className="text-lg sm:text-xl md:text-[22px] leading-relaxed text-[#333333]">
          {text}
        </p>
      </div>
    </div>
  );
}

export function JointHealthSection() {
  return (
    <Section tone="white" id="section-joint-health">
      <div className="space-y-12 md:space-y-16">
        <JointRow
          image={dogPlayingImage}
          alt="Dog Playing"
          text={
            <>
              Every joyful leap, every excited sprint, every wag of their tail,{' '}
              <span className="text-[#FD8829] font-semibold">their joints remember it all.</span>
            </>
          }
        />

        <JointRow
          image={dogRestingImage}
          alt="Dog Resting"
          reverse
          text={
            <>
              <span className="text-[#FD8829] font-semibold">80% of dogs over 7</span> quietly endure joint
              pain. They hide the discomfort, masking the hurt with quiet resilience.
            </>
          }
        />

        <JointRow
          image={dogJointCareImage}
          alt="Dog Joint Health Care"
          text={
            <>
              The right bed changes everything.{' '}
              <span className="text-[#FD8829] font-semibold">
                WoafyPet Bed turns restless nights into healing sleep
              </span>
              , so they wake up ready to chase, play, and love you longer.
            </>
          }
        />
      </div>
    </Section>
  );
}

export default JointHealthSection;