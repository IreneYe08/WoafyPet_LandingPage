import {
  Heart,
  Brain,
  Clock,
  Activity,
  Droplet,
  Shield,
  Thermometer,
  Sparkles,
} from 'lucide-react';

import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card, CardBody } from '@/app/components/layout/Card';

const BENEFITS = [
  { icon: Heart, title: 'Highest Comfort Memory Foam' },
  { icon: Brain, title: '50K+ Data Trained LLM Model' },
  { icon: Clock, title: '24/7 Expert Support' },
  { icon: Activity, title: 'Comprehensive Health Monitoring' },
  { icon: Droplet, title: 'Waterproof' },
  { icon: Shield, title: 'Scratch-Resistant' },
  { icon: Thermometer, title: 'Temperature Adjustable' },
  { icon: Sparkles, title: 'Machine Washable' },
];

export function BenefitsGridSection() {
  return (
    <Section tone="white">
      <SectionHeading
        title="Built for Real Life"
        subtitle="Comfort, durability, and intelligence—designed to work without changing your routine."
        className="mb-10 md:mb-12"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {BENEFITS.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <Card key={index} className="bg-gray-50">
              <CardBody className="flex flex-col items-center text-center p-6 sm:p-7 lg:p-8">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/5">
                  <IconComponent className="text-[#FD8829]" size={26} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#333333] leading-snug">
                  {benefit.title}
                </h3>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

export default BenefitsGridSection;