import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BlogBlock,
  BlogPost,
  fetchBlogPostBySlug,
  formatBlogDate,
} from '../lib/blog';

function renderBlock(block: BlogBlock, index: number) {
  if (block.type === 'heading') {
    return (
      <h2 key={index} className="mt-10 text-2xl font-semibold">
        {block.text}
      </h2>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <p key={index} className="mt-5 text-base leading-8 text-neutral-700">
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul key={index} className="mt-5 list-disc pl-6 space-y-2">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return null;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const data = await fetchBlogPostBySlug(slug);
      setPost(data);

      if (!data) return;

      const url = `https://woafypet.com/blog/${data.slug}`;

      document.title = `${data.title} | WoafyPet Care Guides`;

      const metaDesc =
        document.querySelector("meta[name='description']") ||
        document.createElement('meta');

      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', data.excerpt);
      document.head.appendChild(metaDesc);

      const canonical =
        document.querySelector("link[rel='canonical']") ||
        document.createElement('link');

      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);

      // OpenGraph
      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.content = data.title;

      const ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      ogDesc.content = data.excerpt;

      const ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      ogType.content = 'article';

      const ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      ogUrl.content = url;

      document.head.appendChild(ogTitle);
      document.head.appendChild(ogDesc);
      document.head.appendChild(ogType);
      document.head.appendChild(ogUrl);

      // JSON-LD
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.excerpt,
        datePublished: data.publishedAt,
        author: {
          '@type': 'Organization',
          name: 'WoafyPet',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WoafyPet',
          logo: {
            '@type': 'ImageObject',
            url: 'https://woafypet.com/logo.png',
          },
        },
        mainEntityOfPage: url,
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);

      document.head.appendChild(script);
    }

    load();
  }, [slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <Link to="/blog" className="text-[#FD8829] mt-6 block">
          Back to Care Guides
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/blog" className="text-sm text-[#FD8829]">
        ← Back to Care Guides
      </Link>

      <h1 className="mt-6 text-4xl font-bold">{post.title}</h1>

      <div className="mt-3 text-sm text-neutral-500">
        {formatBlogDate(post.publishedAt)}
      </div>

      {post.coverImage && (
        <img
          src={post.coverImage}
          className="mt-8 rounded-xl"
          alt={post.title}
        />
      )}

      <article className="mt-10">
        {post.content.map((block, i) => renderBlock(block, i))}
      </article>
    </main>
  );
}