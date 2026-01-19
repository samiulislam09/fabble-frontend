'use client';

import { Product } from '@/lib/products';
import ProductCard from './product-card';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';

interface ProductSliderProps {
  products: Product[];
  title?: string;
  infinite?: boolean;
}

export default function ProductSlider({ products, title, infinite = true }: ProductSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

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
    container?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
      image: product.images[0],
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft && !infinite}
              className="p-2 hover:bg-secondary/30 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight && !infinite}
              className="p-2 hover:bg-secondary/30 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
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
