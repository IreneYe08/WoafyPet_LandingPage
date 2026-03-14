import { sanityClient } from './sanityClient'

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  category: string;
  readTime?: string;
  featured?: boolean;
  content: any[];
}

export function formatBlogDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const posts = await sanityClient.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      "coverImage": coverImage.asset->url,
      publishedAt,
      category,
      readTime,
      featured,
      content
    }
  `)
  return posts
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug][0] {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      "coverImage": coverImage.asset->url,
      publishedAt,
      category,
      readTime,
      featured,
      content
    }
  `, { slug })
  return post || null
}