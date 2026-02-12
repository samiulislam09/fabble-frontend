'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    category: Category;
    className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
    return (
        <Link
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className={cn(
                "group relative flex aspect-[4/3] flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1",
                className
            )}
        >
            {/* Abstract Decorative Background */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-700 group-hover:bg-primary/10" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-secondary/10 blur-3xl transition-all duration-700 group-hover:bg-secondary/20" />

            {/* Content */}
            <div className="relative z-10 flex h-full w-full flex-col justify-between">
                <div>
                    <span className="inline-block rounded-full bg-white/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors group-hover:bg-white/80">
                        Collection
                    </span>
                </div>

                <div className="text-center">
                    <h3 className="font-serif text-2xl font-medium text-foreground tracking-tight transition-transform duration-300 group-hover:scale-105">
                        {category.name}
                    </h3>
                    <div className="mt-3 h-px w-8 mx-auto bg-primary/20 transition-all duration-500 group-hover:w-16 group-hover:bg-primary/50" />
                </div>

                <div className="flex justify-center opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                        Shop Now <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
