import { vetExaminingDogImage } from '@/constants/images';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

import { Section, TwoCol, SectionHeading } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

export function VetRecommendedSection() {
  return (
    <Section tone="white">
      <TwoCol
        left={
          <div className="lg:pr-6">
            <SectionHeading
              title="Trusted by Veterinarians"
              align="left"
              className="mb-5"
            />
            <Card className="bg-gray-50">
              <CardBody className="p-6 sm:p-8">
                <p className="text-[#666666] leading-relaxed text-base sm:text-lg">
                  Built on 50,000+ real pet sleep patterns and refined by certified behavior experts.
                  Veterinarians recommend WoafyPet Bed for reducing joint pain, improving mobility,
                  and speeding post-surgery recovery—because healing starts with quality rest.
                </p>
              </CardBody>
            </Card>
          </div>
        }
        right={
          <Card className="overflow-hidden">
            <ImageWithFallback
              src={vetExaminingDogImage}
              alt="Veterinarian Examining Dog"
              className="w-full h-[320px] sm:h-[420px] object-cover"
            />
          </Card>
        }
      />
    </Section>
  );
}

export default VetRecommendedSection;