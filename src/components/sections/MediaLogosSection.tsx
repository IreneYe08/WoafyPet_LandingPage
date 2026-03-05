import {
  mediaLogo1,
  mediaLogo2,
  mediaLogo3,
  mediaLogo4,
  mediaLogo5,
} from '@/constants/images';

import { Section, SectionHeading } from '@/app/components/layout/Section';

const MEDIA_LOGOS = [
  { src: mediaLogo1, maxH: 'max-h-14' },
  { src: mediaLogo2, maxH: 'max-h-12' },
  { src: mediaLogo3, maxH: 'max-h-10' },
  { src: mediaLogo4, maxH: 'max-h-10' },
  { src: mediaLogo5, maxH: 'max-h-10' },
];

export function MediaLogosSection() {
  return (
    <Section tone="beige">
      <SectionHeading title="As Seen On" className="mb-10 md:mb-12" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center">
        {MEDIA_LOGOS.map((logo, index) => (
          <img
            key={index}
            src={logo.src}
            alt={`Media Logo ${index + 1}`}
            className={`${logo.maxH} w-auto object-contain grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100`}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </Section>
  );
}

export default MediaLogosSection;