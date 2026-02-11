'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth-context';
import { authFetch } from './auth-fetch';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
  productId?: number;
  variantId?: number;
  variantType?: string;
  variantValue?: string;
  cartItemId?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'cart';
const MERGE_FLAG_PREFIX = 'cart_merged_user_';

const CartContext = createContext<CartContextType | undefined>(undefined);

const parsePrice = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const loadLocalCart = () => {
  if (typeof window === 'undefined') return [] as CartItem[];
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as CartItem[];
  } catch {
    return [];
  }
};

const mapServerItem = (item: any): CartItem => {
  const variantTypeName = item?.variant?.variantType?.name || '';
  const variantType = variantTypeName.toLowerCase();
  const variantValue = item?.variant?.value || '';
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

  const productImages = Array.isArray(item?.product?.images)
    ? item.product.images
    : typeof item?.product?.images === 'string'
      ? [item.product.images]
      : [];

  const image = item?.variant?.image || productImages[0] || '';
  const price = parsePrice(item?.variant?.price || item?.product?.price);

  return {
    id: String(item?.product?.id ?? item?.productId ?? item?.id ?? ''),
    name: item?.product?.name || 'Product',
    price,
    quantity: item?.quantity || 1,
    size,
    color,
    image,
    productId: item?.product?.id,
    variantId: item?.variant?.id,
    variantType: variantTypeName || undefined,
    variantValue: variantValue || undefined,
    cartItemId: item?.id
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const isServerMode = !!user;

  const syncServerCart = async () => {
    const response = await authFetch('/cart');
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    const serverItems = Array.isArray(data?.data?.cartItems)
      ? data.data.cartItems.map(mapServerItem)
      : [];
    setItems(serverItems);
  };

  const mergeGuestCart = async () => {
    if (!user) return;
    const mergeKey = `${MERGE_FLAG_PREFIX}${user.id}`;
    const alreadyMerged = typeof window !== 'undefined' && localStorage.getItem(mergeKey) === 'true';
    if (alreadyMerged) return;

    const guestItems = loadLocalCart();
    if (guestItems.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(mergeKey, 'true');
      }
      return;
    }

    const payload = {
      items: guestItems.map((item) => ({
        productId: item.productId ? item.productId : Number.parseInt(item.id, 10),
        variantId: item.variantId || undefined,
        quantity: item.quantity
      }))
    };

    const response = await authFetch('/cart/bulk-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok && typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.setItem(mergeKey, 'true');
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      mergeGuestCart()
        .then(syncServerCart)
        .finally(() => setIsLoaded(true));
      return;
    }

    setItems(loadLocalCart());
    setIsLoaded(true);
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!isLoaded || isServerMode) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded, isServerMode]);

  const addItem = async (newItem: CartItem) => {
    if (isServerMode) {
      const response = await authFetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newItem.productId ? newItem.productId : Number.parseInt(newItem.id, 10),
          variantId: newItem.variantId || undefined,
          quantity: newItem.quantity
        })
      });

      if (response.ok) {
        await syncServerCart();
      }
      return;
    }

    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      return [...prev, newItem];
    });
  };

  const removeItem = async (id: string, size: string, color: string) => {
    if (isServerMode) {
      const target = items.find((item) => item.id === id && item.size === size && item.color === color);
      if (!target?.cartItemId) return;
      const response = await authFetch(`/cart/item/${target.cartItemId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await syncServerCart();
      }
      return;
    }

    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  };

  const updateQuantity = async (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id, size, color);
      return;
    }

    if (isServerMode) {
      const target = items.find((item) => item.id === id && item.size === size && item.color === color);
      if (!target?.cartItemId) return;
      const response = await authFetch(`/cart/item/${target.cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        await syncServerCart();
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (isServerMode) {
      const response = await authFetch('/cart/clear', { method: 'DELETE' });
      if (response.ok) {
        await syncServerCart();
      }
      return;
    }
    setItems([]);
  };

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
