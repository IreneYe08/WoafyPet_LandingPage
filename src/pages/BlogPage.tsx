import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import { BlogPost, fetchBlogPosts } from '../lib/blog';
import { blogHeroImage, logoImage } from '../constants/images';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Care Guides | WoafyPet';

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;

    if (metaDescription) {
      metaDescription.content =
        'Explore WoafyPet care guides on dog comfort, sleep, weight, joint support, and smarter pet care.';
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    async function loadPosts() {
      try {
        const blogPosts = await fetchBlogPosts();
        setPosts(blogPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isEmpty = !loading && posts.length === 0;

  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav
        className={[
          'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className={`flex items-center justify-between ${isScrolled ? 'py-3' : 'py-4'}`}>

            {/* Left: logo + nav */}
            <div className="flex items-center gap-8 md:gap-12">
              <Link to="/" className="shrink-0">
                <img
                  src={logoImage}
                  alt="WoafyPet Logo"
                  className="h-10 w-auto md:h-12"
                />
              </Link>

              <div className="hidden md:flex items-center">
                <Link
                  to="/blog"
                  className={[
                    'text-base font-medium uppercase tracking-[0.16em] transition',
                    isScrolled
                      ? 'text-[#2F2F2F] hover:text-[#FD8829]'
                      : 'text-white hover:text-white/80',
                  ].join(' ')}
                >
                  Care Guides
                </Link>
              </div>
            </div>

            {/* Right: cart + CTA */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                className={[
                  'relative flex items-center justify-center rounded-lg p-2 transition',
                  isScrolled ? 'hover:bg-gray-100/80' : 'hover:bg-white/10',
                ].join(' ')}
                aria-label="Shopping Cart"
              >
                <ShoppingCart
                  size={22}
                  className={isScrolled ? 'text-gray-600' : 'text-white/90'}
                />
              </button>

              <Link
                to="/#waitlist"
                className="inline-flex items-center justify-center rounded-full bg-[#FD8829] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Join Waitlist Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={blogHeroImage}
            alt=""
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-16 sm:pt-40 sm:pb-20 md:pt-48 md:pb-28 lg:pt-56 lg:pb-36">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FD8829]">
            WoafyPet Journal
          </p>

          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Care Guides
          </h1>

          <p className="mt-4 max-w-lg text-base leading-7 text-white/80 md:text-lg">
            Articles on dog comfort, sleep, mobility, weight, and smarter daily care.
          </p>
        </div>
      </section>

      {/* Articles Section */}
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
              This page is ready. Once articles are added, they will appear here automatically.
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