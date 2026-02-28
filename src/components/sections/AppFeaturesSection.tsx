import { useState } from 'react';
import {
  healthMonitorImage,
  weightTrackingImage,
  sleepAnalysisImage,
  aiVetImage,
  multiPetImage,
} from '@/constants/images';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

type HealthTabType = 'health' | 'weight' | 'sleep' | 'aivet' | 'multipet';

const HEALTH_TABS = [
  { key: 'health' as const, label: 'Health Monitor' },
  { key: 'weight' as const, label: 'Weight Tracking' },
  { key: 'sleep' as const, label: 'Sleep Analysis' },
  { key: 'aivet' as const, label: 'AI Vet' },
  { key: 'multipet' as const, label: 'Multi-Pet Support' },
];

interface TabContentItem {
  image: string;
  title: string;
  description: string;
  useImageWithFallback?: boolean;
}

const TAB_CONTENT: Record<HealthTabType, TabContentItem> = {
  health: {
    image: healthMonitorImage,
    title: 'Monitor resting heart rate, respiration trends, and weight fluctuations automatically.',
    description:
      'Our high-precision sensors capture insights in as little as 30 minutes of daily rest, ensuring a complete health trend even for the most active pets. Catch physical changes early.',
  },
  weight: {
    image: weightTrackingImage,
    title: 'Easy weight measuring, no more heavy lifting.',
    description:
      'Forget the struggle of holding your pet on a bathroom scale. Our built-in sensors capture precise weight data automatically every time they rest. Monitor subtle trends to manage obesity or catch sudden weight loss early.',
  },
  sleep: {
    image: sleepAnalysisImage,
    title: 'Advanced sleep quality tracking and analysis.',
    description:
      "Advanced algorithms track sleep quality, restlessness, and anxiety levels. Catch sleep disturbances before they become serious health issues. Get detailed insights into your pet's rest patterns.",
  },
  aivet: {
    image: aiVetImage,
    title: '24/7 AI-powered veterinary assistance.',
    description:
      "Instant veterinary consultations powered by your pet's unique health data. Real-time mood detection gives you complete peace of mind, anywhere, anytime. Get expert advice when you need it most.",
  },
  multipet: {
    image: multiPetImage,
    title: 'Seamless tracking for multiple pets.',
    description:
      'Intelligent biometric sensors automatically identify each pet and maintain separate health profiles. No collars, no tags, no hassle—just accurate tracking for your entire pack.',
    useImageWithFallback: true,
  },
};

export function AppFeaturesSection() {
  const [activeTab, setActiveTab] = useState<HealthTabType>('health');
  const currentContent = TAB_CONTENT[activeTab];

  return (
    <Section tone="warm">
      <SectionHeading
        title="Zero Friction Tech, Make Health Visible"
        subtitle="Passive sensing. Real insights. No wearables required."
        className="mb-10 md:mb-12"
      />

      <div className="space-y-8">
               {/* Tabs - mobile 横滑，desktop 与 Card 同宽铺满 */}
        <div className="w-full">
          {/* mobile: 横滑；md+: 不横滑 */}
          <div className="overflow-x-auto md:overflow-visible">
            {/* mobile 用 w-max 让它可横滑；md+ 用 w-full 让它跟 Card 同宽 */}
            <div className="flex w-max md:w-full items-center gap-2 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5">
              {HEALTH_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    // mobile: flex-none（按内容宽度，方便横滑）
                    // md+: flex-1（平均铺满，跟 Card 同宽）
                    'flex-none md:flex-1 whitespace-nowrap rounded-full px-4 py-3 text-sm sm:px-6 sm:text-base font-semibold transition',
                    'md:text-center',
                    activeTab === tab.key
                      ? 'bg-[#FD8829] text-white shadow-md'
                      : 'text-[#666666] hover:text-[#333333]',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Card */}
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[45%_55%]">
            <div className="h-[240px] sm:h-[320px] md:h-auto">
              {currentContent.useImageWithFallback ? (
                <ImageWithFallback
                  src={currentContent.image}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentContent.image}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="text-xl sm:text-2xl font-bold text-[#333333] leading-snug">
                {currentContent.title}
              </h3>
              <p className="mt-4 text-[#666666] leading-relaxed text-base">
                {currentContent.description}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

export default AppFeaturesSection;