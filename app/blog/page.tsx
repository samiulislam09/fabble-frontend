import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  tags?: string[];
  categories?: string[];
  featured?: boolean;
  sticky?: boolean;
  author?: { name?: string | null };
}

export default async function BlogPage() {
  const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
  const response = await fetch(`${apiUrl}/blogs`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  const blogs: BlogItem[] = data?.data?.blogs || [];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase">Fabble Journal</p>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">Latest Stories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Style notes, product guides, and behind-the-scenes inspiration from our team.
          </p>
        </div>

        {blogs.length === 0 ? (
          <p className="text-center text-muted-foreground">No blog posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group border border-border rounded-2xl overflow-hidden bg-white">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={blog.featuredImage || '/placeholder.svg'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {blog.featured && <Badge>Featured</Badge>}
                    {blog.categories?.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                  )}
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{blog.author?.name || 'Fabble Team'}</span>
                    <span>•</span>
                    <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
