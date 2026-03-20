import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: React.ReactNode;
  textAnswer: string;
};

type FAQSection = {
  title: string;
  items: FAQItem[];
};

const faqSections: FAQSection[] = [
  {
    title: 'About WoafyPet Bed',
    items: [
      {
        question: 'When will WoafyPet Bed be available?',
        textAnswer: 'WoafyPet Bed is currently in the product development and testing stage. We are actively refining the hardware, monitoring algorithms, and comfort design. Our current plan is to launch WoafyPet Bed on Kickstarter in May 2026. You can follow our progress on this website or our social media channels.',
        answer: (
          <>
            <p>
              WoafyPet Bed is currently in the product development and testing
              stage.
            </p>
            <p className="mt-6">
              We are actively refining the hardware, monitoring algorithms, and
              comfort design to ensure the best possible experience for both
              dogs and their owners.
            </p>
            <p className="mt-6">
              Our current plan is to launch WoafyPet Bed on Kickstarter in May
              2026.
            </p>
            <p className="mt-6">
              You can follow our progress on this website or our Facebook,
              Instagram, TikTok and Discord, where we regularly share
              development updates, product improvements, and early previews.
            </p>
          </>
        ),
      },
      {
        question: 'What makes WoafyPet Bed different from a normal dog bed?',
        textAnswer: 'Most dog beds only provide a place for your dog to sleep. WoafyPet Bed combines a comfortable resting space with built-in health monitoring. While your dog rests, the system can monitor breathing rate, heart rate, and sleep patterns, helping you understand your dog\'s daily health condition and long-term trends.',
        answer: (
          <>
            <p>Most dog beds only provide a place for your dog to sleep.</p>
            <p className="mt-6">
              WoafyPet Bed combines a comfortable resting space with built-in
              health monitoring. While your dog rests, the system can monitor
              breathing rate, heart rate, and sleep patterns, helping you
              understand your dog's daily health condition and long-term trends.
            </p>
            <p className="mt-6">
              The goal is to help owners notice meaningful changes earlier and
              provide better day-to-day care at home.
            </p>
          </>
        ),
      },
      {
        question: 'How does WoafyPet Bed monitor my dog\u2019s health?',
        textAnswer: 'WoafyPet Bed uses integrated sensors inside the bed to detect subtle body movements while your dog rests. From these signals, the system estimates breathing rate, heart rate, sleep patterns, and resting behavior trends. All monitoring happens automatically while your dog sleeps or relaxes on the bed.',
        answer: (
          <>
            <p>
              WoafyPet Bed uses integrated sensors inside the bed to detect
              subtle body movements while your dog rests.
            </p>
            <p className="mt-6">From these signals, the system estimates:</p>
            <ul className="mt-6 list-disc space-y-2 pl-6">
              <li>breathing rate</li>
              <li>heart rate</li>
              <li>sleep patterns</li>
              <li>resting behavior trends</li>
            </ul>
            <p className="mt-6">
              All monitoring happens automatically while your dog sleeps or
              relaxes on the bed.
            </p>
          </>
        ),
      },
      {
        question: 'Is WoafyPet Bed a medical device?',
        textAnswer: 'No. WoafyPet Bed is not a medical device. It is designed to provide helpful health insights and observational data based on your dog\'s resting signals.',
        answer: (
          <>
            <p>No.</p>
            <p className="mt-6">
              WoafyPet Bed is not a medical device. It is designed to provide
              helpful health insights and observational data based on your dog's
              resting signals.
            </p>
          </>
        ),
      },
      {
        question: 'Can WoafyPet Bed diagnose health problems?',
        textAnswer: 'No. WoafyPet Bed does not diagnose illnesses and cannot replace veterinary care. The system provides health insights and trend observations. If you notice unusual changes in your dog\'s breathing, heart rate, sleep, or behavior, you should consult a licensed veterinarian.',
        answer: (
          <>
            <p>No.</p>
            <p className="mt-6">
              WoafyPet Bed does not diagnose illnesses and cannot replace
              veterinary care.
            </p>
            <p className="mt-6">
              The system provides health insights and trend observations. If you
              notice unusual changes in your dog's breathing, heart rate, sleep,
              or behavior, you should consult a licensed veterinarian.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Coupons & Early Support',
    items: [
      {
        question: 'How do WoafyPet coupons work?',
        textAnswer: 'Coupons obtained through the WoafyPet website can be used after the product officially launches. These coupons will be redeemable when purchasing WoafyPet products directly from our official website once sales begin.',
        answer: (
          <>
            <p>
              Coupons obtained through the WoafyPet website can be used after
              the product officially launches.
            </p>
            <p className="mt-6">
              These coupons will be redeemable when purchasing WoafyPet products
              directly from our official website once sales begin.
            </p>
          </>
        ),
      },
      {
        question: 'Can I use multiple coupons in one order?',
        textAnswer: 'No. Only one coupon can be applied per order, and coupons cannot be combined or stacked with other coupons.',
        answer: (
          <>
            <p>No.</p>
            <p className="mt-6">
              Only one coupon can be applied per order, and coupons cannot be
              combined or stacked with other coupons.
            </p>
          </>
        ),
      },
      {
        question: 'Where can I use my WoafyPet coupon?',
        textAnswer: 'Coupons issued through our website can only be used on the official WoafyPet website after the product becomes available. They cannot be redeemed on third-party platforms or marketplaces.',
        answer: (
          <>
            <p>
              Coupons issued through our website can only be used on the
              official WoafyPet website after the product becomes available.
            </p>
            <p className="mt-6">
              They cannot be redeemed on third-party platforms or marketplaces.
            </p>
          </>
        ),
      },
      {
        question: 'What if I purchased a coupon but change my mind?',
        textAnswer: 'If your coupon was purchased, you may request a refund at any time before using it. Simply contact our support team via email and we will assist you with the refund process.',
        answer: (
          <>
            <p>
              If your coupon was purchased, you may request a refund at any time
              before using it.
            </p>
            <p className="mt-6">
              Simply contact our support team via email and we will assist you
              with the refund process.
            </p>
          </>
        ),
      },
      {
        question: 'Do WoafyPet coupons expire?',
        textAnswer: 'Expiration information, if applicable, will be provided at the time the coupon is issued. Any additional details will also be shared before the product launch.',
        answer: (
          <>
            <p>
              Expiration information, if applicable, will be provided at the
              time the coupon is issued.
            </p>
            <p className="mt-6">
              Any additional details will also be shared before the product
              launch.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Dog Comfort & Use',
    items: [
      {
        question: "What if my dog doesn't use the bed?",
        textAnswer: 'Most dogs love the bed right away, but some may need a little time to adjust to a new sleeping spot. Check out our guide for tips on helping your dog get comfortable. Most importantly, give your dog a little time.',
        answer: (
          <>
            <p>
              Most dogs love the bed right away, but some may need a little time
              to adjust to a new sleeping spot.
            </p>
            <p className="mt-6">
              If needed, check out our guide for tips:{' '}
              <Link
                to="/blog/what-if-your-dog-refuses-to-use-a-new-bed"
                className="font-medium text-[#FD8829] underline underline-offset-2 hover:opacity-80"
              >
                What If Your Dog Refuses to Use a New Bed?
              </Link>
            </p>
            <p className="mt-6">
              Most importantly, give your dog a little time.
            </p>
          </>
        ),
      },
      {
        question: 'Is WoafyPet Bed good for senior dogs?',
        textAnswer: 'Yes. Monitoring breathing rate, heart rate, and sleep patterns can be particularly helpful for senior dogs, since subtle changes in these signals may reflect changes in health or comfort over time.',
        answer: (
          <>
            <p>Yes.</p>
            <p className="mt-6">
              Monitoring breathing rate, heart rate, and sleep patterns can be
              particularly helpful for senior dogs, since subtle changes in
              these signals may reflect changes in health or comfort over time.
            </p>
          </>
        ),
      },
      {
        question: 'Can I use WoafyPet Bed for multiple dogs?',
        textAnswer: 'WoafyPet Bed is designed to monitor the dog currently resting on the bed. For the most accurate insights, it works best when a single dog uses the bed consistently.',
        answer: (
          <>
            <p>
              WoafyPet Bed is designed to monitor the dog currently resting on
              the bed.
            </p>
            <p className="mt-6">
              For the most accurate insights, it works best when a single dog
              uses the bed consistently.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'App & Monitoring',
    items: [
      {
        question: 'What information does the WoafyPet app show?',
        textAnswer: 'The WoafyPet app provides insights based on your dog\'s resting data, including breathing rate trends, heart rate trends, sleep duration and sleep patterns, and changes in resting behavior. These insights help owners better understand their dog\'s overall health patterns.',
        answer: (
          <>
            <p>
              The WoafyPet app provides insights based on your dog's resting
              data, including:
            </p>
            <ul className="mt-6 list-disc space-y-2 pl-6">
              <li>breathing rate trends</li>
              <li>heart rate trends</li>
              <li>sleep duration and sleep patterns</li>
              <li>changes in resting behavior</li>
            </ul>
            <p className="mt-6">
              These insights help owners better understand their dog's overall
              health patterns.
            </p>
          </>
        ),
      },
      {
        question: "Can I check my dog when I'm away from home?",
        textAnswer: 'Yes. When connected to the WoafyPet app, you can view your dog\'s health insights remotely and stay informed about their resting condition.',
        answer: (
          <>
            <p>Yes.</p>
            <p className="mt-6">
              When connected to the WoafyPet app, you can view your dog's health
              insights remotely and stay informed about their resting condition.
            </p>
          </>
        ),
      },
      {
        question: 'Will the system alert me if something changes?',
        textAnswer: 'The system may highlight unusual changes or trends in your dog\'s resting data. These alerts are informational and meant to encourage closer observation. They are not medical diagnoses.',
        answer: (
          <>
            <p>
              The system may highlight unusual changes or trends in your dog's
              resting data.
            </p>
            <p className="mt-6">
              These alerts are informational and meant to encourage closer
              observation. They are not medical diagnoses.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Care & Maintenance',
    items: [
      {
        question: 'Is the bed cover washable?',
        textAnswer: 'Yes. The outer cover is removable and machine washable, making it easy to keep clean for daily use.',
        answer: (
          <>
            <p>Yes.</p>
            <p className="mt-6">
              The outer cover is removable and machine washable, making it easy
              to keep clean for daily use.
            </p>
          </>
        ),
      },
    ],
  },
];

type FAQKey = string;

function FAQAccordionItem({
  sectionTitle,
  item,
  isOpen,
  onToggle,
}: {
  sectionTitle: string;
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-black/10 py-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="mt-1 shrink-0 text-[#444444]">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
        <span className="text-[1.15rem] font-medium leading-8 text-[#333333] md:text-[1.25rem]">
          {item.question}
        </span>
      </button>

      {isOpen && (
        <div className="ml-8 mt-6 max-w-5xl text-[1.05rem] leading-9 text-[#555555]">
          {item.answer}
        </div>
      )}
    </div>
  );
}

const faqSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.textAnswer,
      },
    }))
  ),
});

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<FAQKey, boolean>>({});

  useEffect(() => {
    document.title = 'Frequently Asked Questions | WoafyPet';

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (metaDescription) {
      metaDescription.content =
        'Frequently asked questions about WoafyPet Bed, coupons, app monitoring, dog comfort, care, and maintenance.';
    }
  }, []);

  const toggleItem = (key: FAQKey) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main className="min-h-screen bg-[#F5F3EF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />
      <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:px-12 xl:px-16 md:py-20">
        <div className="max-w-5xl">
          <h1 className="text-[2.75rem] font-semibold tracking-tight text-[#2F2F2F] md:text-[4rem]">
            Frequently Asked Questions
          </h1>

          <p className="mt-8 max-w-5xl text-base leading-8 text-[#555555] md:text-lg">
            WoafyPet Bed is not a medical device and does not provide medical
            diagnosis or treatment. It is designed to provide observational
            health insights for at-home monitoring. If you notice concerning
            changes in your dog's health, please consult a licensed
            veterinarian.
          </p>
        </div>

        <div className="mt-14 md:mt-16">
          {faqSections.map((section) => (
            <section key={section.title} className="mb-14 last:mb-0">
              <h2 className="mb-6 text-[1.8rem] font-semibold tracking-tight text-[#2F2F2F] md:text-[2.5rem]">
                {section.title}
              </h2>

              <div>
                {section.items.map((item, index) => {
                  const key = `${section.title}-${index}`;
                  return (
                    <FAQAccordionItem
                      key={key}
                      sectionTitle={section.title}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}