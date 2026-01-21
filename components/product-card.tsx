'use client';

import Link from 'next/link';
import { Product } from '@/lib/products';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void; // Optional, can handle internally
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState(product.images[0]);
  const { items, addItem } = useCart();
  const { openCart } = useUI();

  // Check if product is in cart (by any size/color combination)
  const isInCart = items.some((item) => item.id === product.id.toString());

  const parsePrice = (price: string | number) => typeof price === 'string' ? parseFloat(price) : price;
  const price = parsePrice(product.price);
  const comparePrice = product.comparePrice ? parsePrice(product.comparePrice) : null;

  // Use isFeatured as Trending for now, or check Logic
  const isTrending = product.isFeatured;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem({
        id: product.id.toString(),
        name: product.name,
        price: price,
        quantity: 1,
        size: 'M',
        color: 'Default',
        image: product.images[0],
      });
      // openCart(); // silent add for card
    }
  };

  // Using tags for sizes/colors mock if needed or just defaults

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="relative overflow-hidden bg-secondary/20 aspect-square rounded-2xl mb-4">
          <img
            src={mainImage || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Trend Badge */}
          {isTrending && (
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full z-10">
              Trending
            </span>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 delay-75">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-md bg-white hover:bg-gray-100 h-10 w-10"
                onClick={(e) => {
                  e.preventDefault();
                  setIsWishlisted(!isWishlisted);
                }}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
              </Button>
              {/* <Link href={`/product/${product.id}`}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md bg-white hover:bg-gray-100 h-10 w-10"
                  title="View Details"
                >
                  <Eye className="h-5 w-5 text-foreground" />
                </Button>
              </Link> */}
            </div>

            {/* Add to Cart Button Centered on Hover */}
            {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300 w-[calc(100%-2rem)]">
              <Button
                className="w-full rounded-xl shadow-lg"
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                {isInCart ? 'In Cart' : 'Add to Cart'}
              </Button>
            </div> */}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">৳{price.toFixed(2)}</span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">৳{comparePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
