import { Blog } from '@/lib/blogs';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface BlogGridProps {
    blogs: Blog[];
}

export default function BlogGrid({ blogs }: BlogGridProps) {
    if (blogs.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                            {blog.featuredImage ? (
                                <img
                                    src={blog.featuredImage}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                    <span className="text-4xl">📰</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                {blog.publishedAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {blog.readingTime && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{blog.readingTime} min read</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {blog.title}
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                {blog.excerpt}
                            </p>

                            <div className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Read Article <span>→</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
