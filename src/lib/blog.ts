export type BlogBlock =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'heading';
      text: string;
    }
  | {
      type: 'list';
      items: string[];
    }
  | {
      type: 'quote';
      text: string;
    };

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
  published?: boolean;
  content: BlogBlock[];
}

interface BlogPostsResponse {
  posts: BlogPost[];
}

export function formatBlogDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch('/data/blog-posts.json');

  if (!response.ok) {
    throw new Error('Failed to load blog posts');
  }

  const data: BlogPostsResponse = await response.json();

  return (data.posts || [])
    .filter((post) => post.published !== false)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}