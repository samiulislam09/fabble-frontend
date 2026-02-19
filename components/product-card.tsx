'use client';

import Link from 'next/link';
import { Product } from '@/lib/products';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void; // Optional, can handle internally
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const productImages = parseImages(product.images);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState(productImages[0] || '');
  const { items, addItem } = useCart();
  const { openCart } = useUI();
  const { user } = useAuth();

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
        image: productImages[0] || '',
        productId: product.id,
      });
      // openCart(); // silent add for card
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    const response = await authFetch('/wishlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id })
    });

    if (response.ok) {
      setIsWishlisted(true);
    }
  };

  // Using tags for sizes/colors mock if needed or just defaults

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-secondary/5 aspect-[3/4] rounded-lg mb-4">
          <img
            src={mainImage || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay Gradient for Text Contrast (Subtle) */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />

          {/* Floating Actions (Top Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-foreground" />
            </Button>
          </div>

          {/* Quick Add Button (Bottom) */}
          {/* <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              className="w-full bg-white/90 backdrop-blur-md text-foreground hover:bg-white hover:text-primary shadow-lg"
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? 'In Cart' : 'Quick Add'}
            </Button>
          </div> */}

          {/* Badges */}
          {isTrending && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-xs font-medium px-2 py-0.5 shadow-sm">
                Trending
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-foreground text-base leading-snug group-hover:underline decoration-1 underline-offset-4 transition-all">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">৳{price.toFixed(2)}</span>
            {comparePrice && (
              <span className="text-muted-foreground line-through text-xs">৳{comparePrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
