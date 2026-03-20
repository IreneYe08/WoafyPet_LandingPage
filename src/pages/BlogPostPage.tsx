import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PortableText } from '@portabletext/react';
import { BlogPost, fetchBlogPostBySlug, formatBlogDate } from '../lib/blog';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const data = await fetchBlogPostBySlug(slug);
      setPost(data);
      if (!data) return;

      const url = `https://woafy.pet/blog/${data.slug}`;
      document.title = `${data.title} | WoafyPet Care Guides`;

      const metaDesc = document.querySelector("meta[name='description']") || document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', data.excerpt);
      document.head.appendChild(metaDesc);

      const canonical = document.querySelector("link[rel='canonical']") || document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }
    load();
  }, [slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-2xl font-semibold">Article not found</h1>
        <Link to="/blog" className="text-[#FD8829] mt-6 block">Back to Care Guides</Link>
      </div>
    );
  }

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://woafy.pet/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Care Guides',
        item: 'https://woafy.pet/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://woafy.pet/blog/${post.slug}`,
      },
    ],
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbSchema }}
      />
      <Link to="/blog" className="text-sm text-[#FD8829]">← Back to Care Guides</Link>

      <h1 className="mt-6 text-4xl font-bold">{post.title}</h1>
      <div className="mt-3 text-sm text-neutral-500">{formatBlogDate(post.publishedAt)}</div>

      {post.coverImage && (
        <img src={post.coverImage} className="mt-8 rounded-xl" alt={post.title} />
      )}

      <article className="mt-10 prose prose-neutral max-w-none">
        <PortableText value={post.content} />
      </article>
    </main>
  );
}