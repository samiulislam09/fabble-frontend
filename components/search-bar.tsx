'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/lib/products';

interface SearchBarProps {
  isMobile?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ isMobile = false, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/products-proxy')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(err => console.error('Failed to load products for search', err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);

    if (value.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = allProducts.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.description.toLowerCase().includes(value.toLowerCase()) ||
      product.category.name.toLowerCase().includes(value.toLowerCase())
    );

    setResults(searchResults);
    setIsOpen(true);
  };

  if (isMobile) {
    return (
      <div className="w-full px-4 py-3">
        <div className="relative">
          <div className="relative">
            <Input
              placeholder="Search products..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Mobile Results */}
          {isOpen && results.length > 0 && (
            <ScrollArea className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-96 z-50">
              <div className="divide-y divide-border">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                    }}
                    className="flex gap-3 px-4 py-3 hover:bg-muted transition"
                  >
                    <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 mx-8 max-w-md" ref={searchRef}>
      <div className="relative">
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Desktop Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-96 z-50 overflow-hidden">
          <ScrollArea className="h-96">
            <div className="p-2">
              {results.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="flex gap-3 px-3 py-2 hover:bg-muted rounded-lg transition"
                >
                  <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
              {results.length > 5 && (
                <Link
                  href={`/shop?search=${query}`}
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="block text-center px-3 py-2 text-sm text-primary hover:bg-muted rounded-lg transition font-medium"
                >
                  View all results ({results.length})
                </Link>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground z-50">
          No products found
        </div>
      )}
    </div>
  );
}
