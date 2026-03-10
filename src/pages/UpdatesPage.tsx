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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

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

        setUpdates(published);
      } catch (error) {
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    }

    loadUpdates();
  }, []);

  const isEmpty = !loading && updates.length === 0;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FD8829]">
            WoafyPet
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Development Updates
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 md:text-lg">
            Follow our R&amp;D progress, prototype iterations, and product
            development milestones as we build WoafyPet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <p className="text-base text-neutral-600">Loading updates...</p>
          </div>
        ) : isEmpty ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Updates will be published here soon
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              This page is ready. Once new development updates are available,
              you can add them directly in the GitHub JSON file and publish
              them automatically.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-full bg-[#FD8829] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Join the Waitlist
              </a>

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8"
              >
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-medium text-[#FD8829]">
                    {item.category}
                  </span>
                  <span className="text-neutral-500">
                    {formatDate(item.date)}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  {item.title}
                </h2>

                <p className="mt-3 text-base leading-7 text-neutral-600">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Want to follow our progress from the start?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            Join the waitlist to get early updates and future product access.
          </p>
          <a
            href="/#waitlist"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#FD8829] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Join the Waitlist
          </a>
        </div>
      </section>
    </main>
  );
}