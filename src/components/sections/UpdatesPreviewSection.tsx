import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type UpdateCategory =
  | 'R&D'
  | 'Prototype'
  | 'Testing'
  | 'Materials'
  | 'Software'
  | 'Manufacturing';

interface UpdateItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: UpdateCategory;
  featured?: boolean;
  published?: boolean;
}

interface UpdatesResponse {
  updates: UpdateItem[];
}

const fallbackUpdates: UpdateItem[] = [
  {
    id: 'placeholder-1',
    slug: 'coming-soon-1',
    title: 'Product development updates coming soon',
    summary:
      'We will share R&D milestones, prototype refinements, and progress updates here.',
    date: '2026-03-10',
    category: 'R&D',
    featured: true,
    published: false,
  },
  {
    id: 'placeholder-2',
    slug: 'coming-soon-2',
    title: 'Prototype and testing milestones will be published here',
    summary:
      'This section will document how WoafyPet moves from concept to real product progress.',
    date: '2026-03-10',
    category: 'Testing',
    featured: true,
    published: false,
  },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export default function UpdatesPreviewSection() {
  const [featuredUpdates, setFeaturedUpdates] = useState<UpdateItem[]>(fallbackUpdates);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const response = await fetch('/data/updates.json');
        if (!response.ok) throw new Error('Failed to load updates');

        const data: UpdatesResponse = await response.json();

        const published = (data.updates || [])
          .filter((item) => item.published !== false)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        const featured = published.filter((item) => item.featured).slice(0, 3);

        if (featured.length > 0) {
          setFeaturedUpdates(featured);
        } else {
          setFeaturedUpdates(fallbackUpdates);
        }
      } catch (error) {
        setFeaturedUpdates(fallbackUpdates);
      }
    }

    loadUpdates();
  }, []);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
          <div className="grid gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FD8829]">
                Development Updates
              </p>

              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Follow our product progress
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
                Track our R&amp;D milestones, prototype refinements, and product
                development progress as we build WoafyPet.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/updates"
                  className="inline-flex items-center justify-center rounded-full bg-[#FD8829] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  View Development Updates
                </Link>

                <a
                  href="#waitlist"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
                >
                  Join the Waitlist
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {featuredUpdates.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="mb-3 flex items-center gap-3 text-sm">
                    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-medium text-[#FD8829]">
                      {item.category}
                    </span>
                    <span className="text-neutral-500">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}