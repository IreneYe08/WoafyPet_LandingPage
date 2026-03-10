import { Link } from 'react-router-dom';
import { BlogPost, formatBlogDate } from '../../lib/blog';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              Cover image coming soon
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 font-medium text-[#FD8829]">
              {post.category}
            </span>
            <span className="text-neutral-500">
              {formatBlogDate(post.publishedAt)}
            </span>
            {post.readTime ? (
              <span className="text-neutral-500">{post.readTime}</span>
            ) : null}
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {post.title}
          </h2>

          <p className="mt-3 text-base leading-7 text-neutral-600">
            {post.excerpt}
          </p>

          <div className="mt-6 text-sm font-semibold text-[#FD8829]">
            Read article
          </div>
        </div>
      </Link>
    </article>
  );
}