'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth-fetch';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    images: string[];
    price: string | number;
  };
  variant?: {
    id: number;
    value: string;
    variantType?: { name?: string };
  } | null;
  effectivePrice?: string | number;
}

const parsePrice = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export default function WishlistPage() {
  const { user, isLoading } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const resolveVariantFields = (variant?: WishlistItem['variant'] | null) => {
    const variantTypeName = variant?.variantType?.name || '';
    const variantValue = variant?.value || '';
    const variantType = variantTypeName.toLowerCase();
    let size = 'One Size';
    let color = 'Default';

    if (variantValue) {
      if (variantType.includes('size')) {
        size = variantValue;
        color = '';
      } else if (variantType.includes('color')) {
        color = variantValue;
        size = '';
      } else {
        size = variantValue;
        color = '';
      }
    }

    return {
      size,
      color,
      variantType: variantTypeName || undefined,
      variantValue: variantValue || undefined
    };
  };

  const fetchWishlist = () => {
    setLoading(true);
    authFetch('/wishlist')
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        setItems(data?.data?.wishlistItems || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  const handleRemove = async (wishlistItemId: number) => {
    const response = await authFetch(`/wishlist/item/${wishlistItemId}`, { method: 'DELETE' });
    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
    }
  };

  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to view your wishlist</h1>
          <Link href="/login">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Wishlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading wishlist...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                <Link href="/shop">
                  <Button>Explore Products</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const price = parsePrice(item.effectivePrice ?? item.product.price);
                  const image = item.product.images?.[0] || '/placeholder.svg';
                  return (
                    <div key={item.id} className="border border-border rounded-lg p-4 flex gap-4">
                      <img src={image} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-foreground">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">৳{price.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              addItem({
                                id: String(item.product.id),
                                name: item.product.name,
                                price,
                                quantity: 1,
                                image,
                                productId: item.product.id,
                                variantId: item.variant?.id,
                                ...resolveVariantFields(item.variant)
                              })
                            }
                          >
                            Add to Cart
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRemove(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
