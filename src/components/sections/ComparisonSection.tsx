import { CheckCircle, X } from 'lucide-react';
import { Section, SectionHeading } from '@/app/components/layout/Section';
import { Card } from '@/app/components/layout/Card';

const COMPARISON_DATA = [
  {
    feature: 'Orthopedic Support',
    traditional: { hasFeature: true, text: 'Memory Foam' },
    woafypet: { hasFeature: true, text: 'Vet-Recommended High-Density Foam' },
  },
  {
    feature: 'Weight Management',
    traditional: { hasFeature: false, text: 'None (Requires manual weighing)' },
    woafypet: { hasFeature: true, text: 'Built-in Scale & Daily Weight Tracking' },
  },
  {
    feature: 'Health Monitoring',
    traditional: { hasFeature: false, text: 'None' },
    woafypet: { hasFeature: true, text: 'Heart Rate & Breath Tracking (24/7)' },
  },
  {
    feature: 'Temperature Comfort',
    traditional: { hasFeature: false, text: 'Passive' },
    woafypet: { hasFeature: true, text: 'Smart Adjustable Heating' },
  },
  {
    feature: 'Peace of Mind',
    traditional: { hasFeature: false, text: 'You guess based on behavior' },
    woafypet: { hasFeature: true, text: 'App Alerts for Health Anomalies' },
  },
];

export function ComparisonSection() {
  return (
    <Section tone="white">
      <SectionHeading title="More Than Just a Bed" className="mb-10 md:mb-12" />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 z-10 bg-white text-left p-5 sm:p-6 text-[#333333] font-semibold text-base">
                  Feature
                </th>
                <th className="text-center p-5 sm:p-6 text-[#555555] font-medium text-sm sm:text-base bg-[#F5F5F5]">
                  Traditional Orthopedic Bed
                </th>
                <th className="text-center p-5 sm:p-6 text-[#FD8829] font-extrabold text-lg sm:text-2xl bg-white border-l-4 border-[#FD8829]">
                  WoafyPet
                </th>
              </tr>
            </thead>

            <tbody>
              {COMPARISON_DATA.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="sticky left-0 z-10 bg-white p-5 sm:p-6 text-[#333333] font-semibold">
                    {row.feature}
                  </td>

                  <td className="p-5 sm:p-6 text-center bg-[#F5F5F5]">
                    <div className="flex items-center justify-center gap-2">
                      {row.traditional.hasFeature ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <X className="text-red-500" size={18} />
                      )}
                      <span className="text-[#555555] text-sm sm:text-base">
                        {row.traditional.text}
                      </span>
                    </div>
                  </td>

                  <td className="p-5 sm:p-6 text-center bg-white border-l-4 border-[#FD8829]">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="text-green-500" size={18} />
                      <span className="text-[#333333] font-semibold text-sm sm:text-base">
                        {row.woafypet.text}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              <tr className="border-t border-gray-200">
                <td className="sticky left-0 z-10 bg-white p-5 sm:p-6 text-[#333333] font-extrabold">
                  The Result
                </td>
                <td className="p-5 sm:p-6 text-center text-[#555555] italic bg-[#EBEBEB]">
                  A normal spot to sleep.
                </td>
                <td className="p-5 sm:p-6 text-center bg-white border-l-4 border-[#FD8829]">
                  <span className="text-[#FD8829] font-extrabold text-sm sm:text-base">
                    A smart all-in-one bed to help dogs live longer and healthier.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-[#999999] text-center">
        Tip: swipe horizontally on mobile.
      </p>
    </Section>
  );
}

export default ComparisonSection;