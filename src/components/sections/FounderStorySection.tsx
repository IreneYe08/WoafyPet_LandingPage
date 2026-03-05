import { founderImage } from '@/constants/images';
import { Section, SectionHeading, TwoCol } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

export function FounderStorySection() {
  return (
    <Section tone="white">
      <TwoCol
        left={
          <Card className="overflow-hidden">
            <img
              src={founderImage}
              alt="Founder with Bobby"
              className="w-full h-[320px] sm:h-[420px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </Card>
        }
        right={
          <div className="lg:pl-4">
            <SectionHeading
              title="Why We Build WoafyPet Bed"
              className="mb-6"
              align="left"
            />
            <div className="space-y-5 text-base sm:text-lg text-[#666666] leading-relaxed max-w-prose">
              <p>
                I am Robert, Co-founder and CEO of WoafMeow. I had an Alaskan Malamute called
                Bobby. When Bobby lay on the cold marble floor, looking tired, we thought he
                was just feeling hot. We didn&apos;t notice his silence warning us. By the time
                his symptoms were obvious, it was already too late.
              </p>
              <p>
                That regret still stays with me today. Pets are masters at hiding pain. This is
                why I started WoafMeow. I wanted to answer one simple question:{' '}
                <span className="text-[#333333] font-semibold">
                  If pets can&apos;t speak, can we build something that listens and speaks for them?
                </span>
              </p>
              <p>
                We built this bed to turn invisible signs into clear voices you can understand.
                <span className="text-[#333333] font-semibold">
                  {' '}This isn&apos;t just a smart device. It&apos;s the lifeline I wish I had for Bobby.
                </span>
              </p>
            </div>
          </div>
        }
      />
    </Section>
  );
}

export default FounderStorySection;