'use client';

import { Product } from '@/lib/products';
import ProductCard from './product-card';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

// Helper to parse images - handles comma-separated string or array
const parseImages = (images: string | string[]): string[] => {
  if (Array.isArray(images)) {
    if (images.length === 1 && images[0].includes(',')) {
      return images[0].split(',').map(img => img.trim()).filter(Boolean);
    }
    return images.flatMap(img => 
      img.includes(',') ? img.split(',').map(i => i.trim()).filter(Boolean) : [img]
    );
  }
  if (typeof images === 'string') {
    return images.split(',').map(img => img.trim()).filter(Boolean);
  }
  return [];
};

interface ProductSliderProps {
  products: Product[];
  title?: string;
  infinite?: boolean;
  autoPlay?: boolean;
}

export default function ProductSlider({ products, title, infinite = true, autoPlay = true }: ProductSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const { addItem } = useCart();

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

      if (infinite && containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        if (newScrollLeft <= 0) {
          containerRef.current.scrollLeft = scrollWidth - clientWidth;
        } else if (newScrollLeft >= scrollWidth - clientWidth) {
          containerRef.current.scrollLeft = 0;
        } else {
          containerRef.current.scrollLeft = newScrollLeft;
        }
      } else {
        containerRef.current.scrollLeft = newScrollLeft;
      }
      checkScroll();
    }
  };

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;

    const handleScroll = () => checkScroll();

    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && infinite && !isHovered) {
      autoPlayRef.current = setInterval(() => {
        scroll('right');
      }, 4000); // Slide every 4 seconds
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, infinite, isHovered]);

  const handleAddToCart = (product: Product) => {
    // Helper to safely parse float
    const parsePrice = (price: string | number) => typeof price === 'string' ? parseFloat(price) : price;
    const productImages = parseImages(product.images);

    addItem({
      id: product.id.toString(),
      name: product.name,
      price: parsePrice(product.price),
      quantity: 1,
      size: 'M', // Default as not in API
      color: 'Default', // Default as not in API
      image: productImages[0] || '',
      productId: product.id,
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {title ? (
          <h2 className="text-3xl font-serif font-bold text-foreground">{title}</h2>
        ) : <div />} {/* Spacer if no title to keep arrows right */}

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft && !infinite}
            className="p-2 bg-secondary/50 hover:bg-secondary rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight && !infinite}
            className="p-2 bg-secondary/50 hover:bg-secondary rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar py-4"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 xl:w-1/5">
              <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
