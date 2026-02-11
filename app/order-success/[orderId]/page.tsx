'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { getAccessToken } from '@/lib/auth';

interface OrderItem {
    id: number | string;
    productId: number | string;
    variantId?: number | string | null;
    quantity: number;
    price: number;
    unitPrice?: number;
    size?: string;
    color?: string;
    variantType?: string;
    variantValue?: string;
    product?: {
        name?: string;
        images?: string[];
    };
    variant?: {
        size?: string;
        color?: string;
    };
}

interface OrderDetails {
    id: number | string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
    customerNotes?: string;
    items: OrderItem[];
    createdAt: string;
}

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : typeof value === 'number' ? value : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
};

const SUCCESS_TTL_MS = 10 * 60 * 1000;

const normalizeOrder = (raw: any): OrderDetails | null => {
    if (!raw) {
        return null;
    }

    const candidate = raw.order ?? raw.data?.order ?? raw.data ?? raw;
    if (!candidate) {
        return null;
    }

    const itemsRaw = Array.isArray(candidate.items) ? candidate.items : [];
    const items: OrderItem[] = itemsRaw.map((item: any, index: number) => {
        const price = toNumber(item.price ?? item.unitPrice ?? item.unit_price, 0);
        const quantity = Math.max(1, toNumber(item.quantity, 1));

        const variant = item.variant ?? {
            size: item.size,
            color: item.color,
        };

        const product = item.product ?? {
            name: item.productName ?? item.name,
            images: item.images ?? item.productImages,
        };

        return {
            id: item.id ?? item._id ?? item.productId ?? item.product_id ?? index,
            productId: item.productId ?? item.product_id ?? item.product?.id ?? item.id ?? index,
            variantId: item.variantId ?? item.variant_id ?? item.variant?.id ?? null,
            quantity,
            price,
            unitPrice: item.unitPrice ?? item.unit_price ?? price,
            size: item.size,
            color: item.color,
            variantType: item.variantType ?? item.variant_type ?? item.variant?.variantType?.name ?? null,
            variantValue: item.variantValue ?? item.variant_value ?? item.variant?.value ?? null,
            product,
            variant,
        };
    });

    const shippingAddressRaw = candidate.shippingAddress ?? candidate.shipping_address ?? null;
    const shippingAddress =
        typeof shippingAddressRaw === 'string'
            ? shippingAddressRaw
            : [shippingAddressRaw?.line1, shippingAddressRaw?.line2].filter(Boolean).join(', ') ||
            candidate.address ||
            '';

    const subtotal = toNumber(candidate.subtotal, NaN);
    const shippingCharge = toNumber(candidate.shippingCost ?? candidate.shipping_cost ?? candidate.shippingCharge ?? candidate.shipping_charge, 0);
    const totalAmount = toNumber(
        candidate.totalAmount ??
        candidate.total ??
        candidate.amount ??
        (Number.isFinite(subtotal) ? subtotal + shippingCharge : NaN),
        0
    );

    return {
        id: candidate.id ?? candidate._id ?? candidate.orderNumber ?? '',
        orderNumber: candidate.orderNumber ?? candidate.order_number ?? candidate.orderNo ?? '',
        status: candidate.status ?? candidate.orderStatus ?? candidate.order_status ?? 'pending',
        totalAmount,
        shippingAddress,
        shippingCity:
            candidate.shippingCity ?? candidate.shipping_city ?? shippingAddressRaw?.city ?? candidate.city ?? '',
        shippingCountry:
            candidate.shippingCountry ??
            candidate.shipping_country ??
            shippingAddressRaw?.country ??
            candidate.country ??
            '',
        shippingMethod: candidate.shippingMethod ?? candidate.shipping_method ?? 'standard',
        shippingCost: shippingCharge,
        paymentMethod: candidate.paymentMethod ?? candidate.payment_method ?? 'COD',
        customerNotes: candidate.customerNotes ?? candidate.notes ?? undefined,
        items,
        createdAt: candidate.createdAt ?? candidate.created_at ?? candidate.created ?? '',
    };
};

export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatVariantLabel = (item: OrderItem) => {
        const labels: string[] = [];
        if (item.variantValue) {
            labels.push(`${item.variantType || 'Variant'}: ${item.variantValue}`);
        } else {
            if (item.variant?.color || item.color) {
                labels.push(`Color: ${item.variant?.color || item.color}`);
            }
            if (item.variant?.size || item.size) {
                labels.push(`Size: ${item.variant?.size || item.size}`);
            }
        }
        return labels.length ? labels.join(' • ') : '';
    };

    useEffect(() => {
        async function fetchOrderDetails() {
            let usedLocal = false;

            if (typeof window !== 'undefined') {
                const storedMeta = sessionStorage.getItem('orderSuccess');
                const storedOrder = sessionStorage.getItem('orderSuccessData');
                const meta = storedMeta ? JSON.parse(storedMeta) : null;
                const matchesId = meta?.id && String(meta.id) === String(orderId);
                const withinTtl = meta?.createdAt && Date.now() - meta.createdAt < SUCCESS_TTL_MS;

                if (!matchesId || !withinTtl) {
                    sessionStorage.removeItem('orderSuccess');
                    sessionStorage.removeItem('orderSuccessData');
                    setError('This order confirmation has expired.');
                    setLoading(false);
                    return;
                }

                if (storedOrder) {
                    try {
                        const parsed = JSON.parse(storedOrder);
                        const normalized = normalizeOrder(parsed);
                        if (normalized) {
                            usedLocal = true;
                            setOrder(normalized);
                            setLoading(false);
                        }
                    } catch (parseError) {
                        console.error('Failed to parse cached order:', parseError);
                    }
                }
            }

            try {
                if (!orderId || Number.isNaN(Number(orderId))) {
                    if (!usedLocal) {
                        setError('Invalid order identifier');
                        setLoading(false);
                    }
                    return;
                }

                const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
                const accessToken = getAccessToken();
                const response = accessToken
                    ? await authFetch(`/user/orders/${orderId}`)
                    : await fetch(`${apiUrl}/orders/${orderId}`, {
                        credentials: 'include',
                    });

                if (!response.ok) {
                    if (!usedLocal) {
                        let message = 'Failed to fetch order details';
                        try {
                            const errorData = await response.json();
                            if (errorData?.message) {
                                message = errorData.message;
                            }
                        } catch {
                            // Ignore JSON parse errors
                        }
                        setError(message);
                        setLoading(false);
                    }
                    return;
                }

                const data = await response.json();
                const normalized = normalizeOrder(data);
                if (!normalized) {
                    throw new Error('Order response missing details');
                }
                setOrder(normalized);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('orderSuccessData', JSON.stringify(data));
                    sessionStorage.setItem(
                        'orderSuccess',
                        JSON.stringify({ id: String(orderId), createdAt: Date.now() })
                    );
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                if (!usedLocal) {
                    setError('Could not load order details');
                }
            } finally {
                if (!usedLocal) {
                    setLoading(false);
                }
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
                                    {(() => {
                                        const date = order.createdAt ? new Date(order.createdAt) : null;
                                        const label =
                                            date && !Number.isNaN(date.getTime())
                                                ? date.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                                : '—';
                                        return <p className="font-semibold text-foreground">{label}</p>;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-semibold text-foreground capitalize">{order.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="font-semibold text-foreground">
                                        {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : '—'}
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
                                                    {formatVariantLabel(item) && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatVariantLabel(item)}
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
                                        ৳{order.shippingCost.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">৳{order.totalAmount.toFixed(2)}</span>
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
