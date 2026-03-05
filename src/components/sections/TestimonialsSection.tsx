import {
  testimonialSarahImage,
  testimonialDavidImage,
  testimonialChloeImage,
} from '@/constants/images';

import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

const TESTIMONIALS = [
  {
    image: testimonialSarahImage,
    quote:
      "Watching Max struggle to stand up on cold mornings used to break my heart. The heating function is a game-changer for his old hips. He wakes up and walks effortlessly now. It's not just a bed; it's pain relief.",
    name: 'Sarah & Max',
    petInfo: 'Labrador, 12yr',
  },
  {
    image: testimonialDavidImage,
    quote:
      "I used to constantly worry about Luna's anxiety while I was at work. Now, I just glance at the App. Seeing her heart rate and 'Relaxed' status in real-time gives me total peace of mind.",
    name: 'David & Luna',
    petInfo: 'French Bulldog, 3yr',
  },
  {
    image: testimonialChloeImage,
    quote:
      "Previously I bought 3 dog beds that Mochi completely ignored. I was skeptical, but the 'Cozy Heat' mode won her over instantly. It's the first bed she actually loves. The weight scale is very helpful too.",
    name: 'Chloe & Mochi',
    petInfo: 'Ragdoll Cat, 4yr',
  },
];

export function TestimonialsSection() {
  return (
    <Section tone="white">
      <SectionHeading
        title="Loved by Pets. Trusted by Owners"
        subtitle="Real stories from owners who wanted better rest—and real peace of mind."
        className="mb-10 md:mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {TESTIMONIALS.map((t, index) => (
          <Card key={index} className="hover:shadow-2xl transition-shadow">
            <CardBody className="flex h-full flex-col">
              <div className="text-xl mb-4">⭐⭐⭐⭐⭐</div>

              <p className="text-[#3D3D3D] leading-relaxed flex-grow text-sm sm:text-base">
                “{t.quote}”
              </p>

              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-gray-200">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <div className="font-semibold text-[#3D3D3D]">{t.name}</div>
                  <div className="text-sm text-[#666666]">{t.petInfo}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default TestimonialsSection;