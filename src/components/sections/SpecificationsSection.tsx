import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

const SPECIFICATIONS = [
  {
    size: 'Small',
    dimensions: '24" x 18" x 6"',
    weight: '4 – 18 lbs',
    description: 'Perfect for small breeds',
  },
  {
    size: 'Medium',
    dimensions: '35" x 22" x 7"',
    weight: '18 – 55 lbs',
    description: 'Ideal for medium breeds',
  },
  {
    size: 'Large',
    dimensions: '48" x 35" x 8"',
    weight: '55 – 110+ lbs',
    description: 'Built for large breeds',
  },
];

export function SpecificationsSection() {
  return (
    <Section tone="white">
      <SectionHeading title="Specifications" className="mb-10 md:mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {SPECIFICATIONS.map((spec, index) => (
          <Card key={index} className="bg-gray-50">
            <CardBody>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#FD8829]">
                {spec.size}
              </h3>

              <ul className="mt-5 space-y-2 text-[#666666] text-sm sm:text-base">
                <li>• {spec.dimensions}</li>
                <li>• {spec.weight}</li>
                <li>• {spec.description}</li>
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default SpecificationsSection;