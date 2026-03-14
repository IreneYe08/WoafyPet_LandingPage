import { foamLayersImage } from '@/constants/images';
import { Section, SectionHeading, TwoCol } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

const FOAM_LAYERS = [
  {
    title: 'Soft Layer (2")',
    description:
      "The top layer is made of plush, adaptive foam that gently molds to your dog's body shape. It provides immediate soft comfort and helps relieve pressure points for a more relaxing rest.",
  },
  {
    title: 'Orthopedic Core (3")',
    description:
      "The middle section is a dense, firm support foam. It supports your dog's weight evenly, helping keep joints aligned and preventing sinking too deeply into the mattress.",
  },
  {
    title: 'Foundation Layer (2")',
    description:
      'The solid bottom layer provides stability and durability. It acts as a barrier against hard floors and ensures the bed holds its shape over time.',
  },
];

export function FoamLayersSection() {
  return (
    <Section tone="warm">
      <SectionHeading
        title="Engineered for a Lifetime of Comfort"
        subtitle="Three-layer structure tuned for pressure relief and long-term support."
        className="mb-10 md:mb-12"
      />

      <Card className="overflow-hidden">
        <TwoCol
          className="min-h-[520px]"
          left={
            <div className="relative h-[260px] sm:h-[360px] lg:h-full lg:min-h-[520px]">
              <img
                src={foamLayersImage}
                alt="High Quality Foam Layers"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/70 lg:to-white/85" />
            </div>
          }
          right={
            <CardBody className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-6">
                {FOAM_LAYERS.map((layer, index) => (
                  <div key={index}>
                    <div className="inline-flex rounded-lg bg-[#FD8829] px-3 py-2">
                      <h3 className="text-sm font-semibold text-white">{layer.title}</h3>
                    </div>
                    <p className="mt-3 text-base text-[#666666] leading-relaxed">
                      {layer.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          }
        />
      </Card>
    </Section>
  );
}

export default FoamLayersSection;