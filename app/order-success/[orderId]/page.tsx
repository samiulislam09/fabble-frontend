'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface OrderItem {
    id: number;
    productId: number;
    variantId: number;
    quantity: number;
    price: number;
    product?: {
        name: string;
        images?: string[];
    };
    variant?: {
        size?: string;
        color?: string;
    };
}

interface OrderDetails {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingMethod: string;
    paymentMethod: string;
    customerNotes?: string;
    items: OrderItem[];
    createdAt: string;
}

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrderDetails() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:5001/api';
                const response = await fetch(`${apiUrl}/orders/${orderId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();
                setOrder(data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Could not load order details');
            } finally {
                setLoading(false);
            }
        }

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="max-w-md">
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <CardTitle className="text-3xl">Order Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-center">
                            {error || 'We could not find the order details.'}
                        </p>
                        <Link href="/" className="block">
                            <Button className="w-full">Return to Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                        <div className="text-5xl">✓</div>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Number</p>
                                    <p className="font-semibold text-foreground">#{order.orderNumber || order.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Date</p>
                                    <p className="font-semibold text-foreground">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold text-foreground capitalize">{order.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="font-semibold text-foreground">
                                        {order.paymentMethod.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="pb-6 border-b border-border">
                                <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                                <p className="font-medium text-foreground">{order.shippingAddress}</p>
                                <p className="text-foreground">
                                    {order.shippingCity}, {order.shippingCountry}
                                </p>
                            </div>

                            {/* Order Items */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-4">Items Ordered</p>
                                <ScrollArea className="h-80">
                                    <div className="space-y-4 pr-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 pb-4 border-b border-border last:border-0"
                                            >
                                                <img
                                                    src={item.product?.images?.[0] || '/placeholder.svg'}
                                                    alt={item.product?.name || 'Product'}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground text-sm">
                                                        {item.product?.name || `Product #${item.productId}`}
                                                    </p>
                                                    {item.variant && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.variant.color && `${item.variant.color}`}
                                                            {item.variant.size && ` | Size: ${item.variant.size}`}
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-semibold text-primary mt-1">
                                                        {item.quantity} × ৳{item.price.toFixed(2)} = ৳
                                                        {(item.quantity * item.price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium text-foreground">
                                        ৳{order.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium text-foreground">
                                        {order.shippingMethod === 'STANDARD' ? 'FREE' : '৳10.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                                    <span className="text-foreground">Total</span>
                                    <span className="text-primary">৳{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-border">
                                <Link href="/shop" className="block">
                                    <Button className="w-full">Continue Shopping</Button>
                                </Link>
                                <Link href="/" className="block">
                                    <Button variant="outline" className="w-full">
                                        Return to Home
                                    </Button>
                                </Link>
                            </div>

                            {/* Additional Info */}
                            <div className="bg-muted rounded-lg p-4 text-sm">
                                <p className="text-muted-foreground">
                                    <strong>Note:</strong> You will receive an order confirmation email shortly. If
                                    you have any questions about your order, please contact our customer support.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
