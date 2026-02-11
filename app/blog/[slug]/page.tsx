import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface BlogDetail {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  tags?: string[];
  categories?: string[];
  author?: { name?: string | null };
}

interface PageProps {
  params: { slug: string };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
  const response = await fetch(`${apiUrl}/blogs/${params.slug}`, { cache: 'no-store' });

  if (!response.ok) {
    return notFound();
  }

  const data = await response.json().catch(() => ({}));
  const blog: BlogDetail | null = data?.data?.blog || data?.blog || null;

  if (!blog) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/blog" className="text-sm text-primary font-semibold uppercase tracking-widest">
          Back to Journal
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {blog.categories?.map((cat) => (
              <Badge key={cat} variant="outline">{cat}</Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">{blog.title}</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{blog.author?.name || 'Fabble Team'}</span>
            <span>•</span>
            <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Recently'}</span>
          </div>
        </div>

        <div className="aspect-video bg-muted overflow-hidden rounded-2xl">
          <img
            src={blog.featuredImage || '/placeholder.svg'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {blog.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">{blog.excerpt}</p>
        )}

        <article
          className="prose prose-lg max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {blog.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
