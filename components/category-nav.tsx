'use client';

import Link from 'next/link';
import { Category } from '@/lib/categories';

interface CategoryNavProps {
  categories?: Category[];
}


export default function CategoryNav({ categories = [] }: CategoryNavProps) {
  console.log('Categories:', categories);
  // Filter top-level categories (parentId is null)
  const topLevelCategories = categories.filter(c => c.parentId === null);

  return (
    <nav className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 py-3">
        {topLevelCategories.map((category) => (
          <div key={category.id} className="relative group">
            <Link
              href={`/shop?category=${category.name}`}
              className="text-sm font-medium text-foreground hover:text-primary transition whitespace-nowrap py-3"
            >
              {category.name}
            </Link>

            {/* Hover Dropdown - Only show if it has children or content */}
            {category.children && category.children.length > 0 && (
              <div className="absolute left-0 top-full w-64 bg-background border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-5 translate-y-2 group-hover:translate-y-0">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Shop by Type</p>
                  <div className="space-y-2">
                    {category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/shop?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                        className="block text-sm text-foreground/80 hover:text-primary hover:translate-x-1 transition-all duration-200"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
