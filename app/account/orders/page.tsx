'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth-fetch';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  _count?: { items: number };
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    authFetch('/user/orders')
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        const list = data?.data?.orders || [];
        setOrders(list);
      })
      .finally(() => setLoadingOrders(false));
  }, [user]);

  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to view your orders</h1>
          <Link href="/login">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingOrders ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You have no orders yet.</p>
                <Link href="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                      <p className="text-lg font-semibold text-foreground">৳{Number(order.totalAmount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {order.status?.toLowerCase() || 'pending'}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {order.paymentStatus?.toLowerCase() || 'pending'}
                      </Badge>
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
