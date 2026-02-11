'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { authFetch } from '@/lib/auth-fetch';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product?: {
    name?: string;
    images?: string[];
  };
  variant?: {
    value?: string;
    variantType?: { name?: string };
  };
}

interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress?: string;
  shippingCity?: string;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderDetailPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    authFetch(`/user/orders/${orderId}`)
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        setOrder(data?.data?.order || null);
      })
      .finally(() => setLoading(false));
  }, [user, orderId]);

  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to view your order</h1>
          <Link href="/login">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Order Details</h1>
            <p className="text-muted-foreground">Order #{order?.orderNumber || orderId}</p>
          </div>
          <Link href="/account/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Loading order...</p>
            ) : order ? (
              <>
                <p className="text-sm text-muted-foreground">Status: {order.status}</p>
                <p className="text-sm text-muted-foreground">Payment: {order.paymentStatus}</p>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-lg font-semibold text-foreground">Total: ৳{Number(order.totalAmount).toFixed(2)}</p>
                {order.shippingAddress && (
                  <p className="text-sm text-muted-foreground">Ship to: {order.shippingAddress}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Order not found.</p>
            )}
          </CardContent>
        </Card>

        {order && order.items?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => {
                const image = item.product?.images?.[0] || '/placeholder.svg';
                const variantLabel = item.variant?.variantType?.name
                  ? `${item.variant.variantType.name}: ${item.variant.value}`
                  : item.variant?.value;
                return (
                  <div key={item.id} className="flex gap-4 border border-border rounded-lg p-4">
                    <img src={image} alt={item.product?.name || 'Item'} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product?.name || 'Item'}</p>
                      {variantLabel && <p className="text-sm text-muted-foreground">{variantLabel}</p>}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-foreground">৳{Number(item.unitPrice).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
