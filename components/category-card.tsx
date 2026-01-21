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
            className={cn("group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100", className)}
        >
            {/* Background Image */}
            <img
                src={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop"} // Fallback image
                alt={category.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay - Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                    {/* Decorative Line */}
                    <div className="mb-3 h-1 w-12 origin-left scale-0 bg-white transition-transform duration-500 group-hover:scale-100" />

                    <h3 className="text-2xl font-bold text-white md:text-3xl font-serif tracking-wide">
                        {category.name}
                    </h3>

                    {/* Subtitle/Description - optional if category has description or just generic text */}
                    <p className="mt-2 text-sm font-medium text-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        Explore Collection
                    </p>
                </div>

                {/* Action Icon */}
                <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:bottom-8 md:right-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-colors hover:bg-white hover:text-black">
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
