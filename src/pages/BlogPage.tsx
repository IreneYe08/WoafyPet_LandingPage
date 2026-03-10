import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import { BlogPost, fetchBlogPosts } from '../lib/blog';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Care Guides | WoafyPet';

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (metaDescription) {
      metaDescription.content =
        'Explore WoafyPet care guides on dog comfort, sleep, weight, joint support, and smarter pet care.';
    }

    async function loadPosts() {
      try {
        const blogPosts = await fetchBlogPosts();
        setPosts(blogPosts);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  const isEmpty = !loading && posts.length === 0;

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FD8829]">
            WoafyPet Care Guides
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Care Guides
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 md:text-lg">
            Articles on dog comfort, sleep, mobility, weight, and smarter daily
            care.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <p className="text-base text-neutral-600">Loading articles...</p>
          </div>
        ) : isEmpty ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Articles will be published here soon
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              This page is ready. Once articles are added to the GitHub JSON
              file, they will appear here automatically after deployment.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                Back to Home
              </Link>

              <a
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-full bg-[#FD8829] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Join the Waitlist
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}