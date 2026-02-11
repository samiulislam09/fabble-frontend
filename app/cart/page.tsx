'use client';

import React from 'react';
import Link from 'next/link';
import { useCart, type CartItem } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

    const formatVariantLabel = (item: CartItem) => {
        const labels: string[] = [];
        if (item.variantValue) {
            // Handle composite variants if needed, though they are stored as a single string usually
            // If the backend sends "Color / Size" as variantValue, we display it directly.
            // We can also check variantType.
            if (item.variantType && item.variantType !== 'Variant') {
                labels.push(`${item.variantType}: ${item.variantValue}`);
            } else {
                labels.push(item.variantValue);
            }
        } else {
            // Fallback for legacy or simple items
            if (item.color && item.color !== 'Default') {
                labels.push(`Color: ${item.color}`);
            }
            if (item.size && item.size !== 'Default' && item.size !== 'One Size') {
                labels.push(`Size: ${item.size}`);
            }
        }
        return labels.length ? labels.join(' • ') : null;
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <div className="bg-muted/30 p-8 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-md">
                    Looks like you haven't added anything to your cart yet. Browse our products to find something you love.
                </p>
                <Link href="/shop">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50 hidden md:table-header-group">
                                <tr className="text-left text-sm text-muted-foreground">
                                    <th className="p-4 font-medium">Product</th>
                                    <th className="p-4 font-medium text-center">Quantity</th>
                                    <th className="p-4 font-medium text-right">Total</th>
                                    <th className="p-4 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((item) => (
                                    <tr key={`${item.id}-${item.size}-${item.color}`} className="group">
                                        <td className="p-4">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden border">
                                                    <img
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <Link href={`/product/${item.productId || item.id}`} className="font-semibold hover:text-primary transition-colors line-clamp-2">
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {formatVariantLabel(item) || 'Standard'}
                                                    </p>
                                                    <p className="text-sm font-medium mt-1 md:hidden">৳{item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 md:gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right hidden md:table-cell">
                                            <div className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</div>
                                            <div className="text-xs text-muted-foreground">৳{item.price.toFixed(2)} each</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                onClick={() => removeItem(item.id, item.size, item.color)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="ghost" asChild>
                            <Link href="/shop" className="flex items-center">
                                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                Continue Shopping
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                            Clear Cart
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4">
                    <div className="bg-muted/10 rounded-lg border p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">৳{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-muted-foreground italic">Calculated at checkout</span>
                            </div>
                            {/* <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-muted-foreground italic">Calculated at checkout</span>
                            </div> */}

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>৳{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button size="lg" className="w-full mt-8" asChild>
                            <Link href="/checkout">
                                Proceed to Checkout
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>

                        <div className="mt-6 text-xs text-center text-muted-foreground space-y-2">
                            <p>Secure Checkout - 100% Protected</p>
                            <div className="flex justify-center gap-2 opacity-50">
                                {/* Add payment icons if available/wanted */}
                                <span>VISA</span>
                                <span>Mastercard</span>
                                <span>Amex</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
