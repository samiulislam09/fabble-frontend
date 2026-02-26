'use client';

import React from "react"

import { useCart, type CartItem } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, type CheckoutFormData } from './actions';
import { getAccessToken } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';

const resolveOrderId = (data: any, fallback?: string | number) => {
  const candidate =
    data?.id ??
    data?.orderId ??
    data?.order?.id ??
    data?.order?._id ??
    data?._id ??
    data?.orderNumber ??
    data?.order?.orderNumber ??
    fallback;

  if (candidate === null || candidate === undefined || candidate === '') {
    return undefined;
  }

  return candidate;
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    shippingZone: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [zoneError, setZoneError] = useState(false);

  const formatVariantLabel = (item: CartItem) => {
    const labels: string[] = [];
    if (item.variantValue) {
      labels.push(`${item.variantType || 'Variant'}: ${item.variantValue}`);
    } else {
      if (item.color && item.color !== 'Default') {
        labels.push(`Color: ${item.color}`);
      }
      if (item.size && item.size !== 'Default' && item.size !== 'One Size') {
        labels.push(`Size: ${item.size}`);
      }
    }
    return labels.length ? labels.join(' • ') : 'Standard';
  };

  useEffect(() => {
    if (!user) return;
    const nameParts = user.name ? user.name.split(' ') : [];
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || nameParts[0] || '',
      lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
      phone: prev.phone || user.mobile || ''
    }));
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const missingFields: string[] = [];
      if (!formData.firstName.trim()) missingFields.push('First Name');
      if (!formData.lastName.trim()) missingFields.push('Last Name');
      if (!formData.phone.trim()) missingFields.push('Phone');
      if (!formData.shippingZone) {
        setZoneError(true);
        missingFields.push('Delivery Zone');
      }
      if (!formData.address.trim()) missingFields.push('Street Address');

      if (missingFields.length > 0) {
        setIsProcessing(false);
        return;
      }

      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setIsProcessing(false);
        return;
      }

      // Call server action to create order
      const result = await createOrder(formData, items.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        variantType: item.variantType,
        variantValue: item.variantValue,
        unitPrice: item.price
      })), getAccessToken());

      if (!result.success) {
        throw new Error(result.error || 'Failed to place order');
      }

      // Clear cart and redirect to success page
      clearCart();
      setIsProcessing(false);

      // Redirect to order success page with order ID
      const resolvedOrderId = resolveOrderId(result.data, result.orderId);
      if (typeof window !== 'undefined') {
        const orderPayload = result.data?.order ?? result.data?.data ?? result.data;
        if (orderPayload) {
          sessionStorage.setItem('orderSuccessData', JSON.stringify(orderPayload));
        }
        if (resolvedOrderId) {
          sessionStorage.setItem(
            'orderSuccess',
            JSON.stringify({ id: String(resolvedOrderId), createdAt: Date.now() })
          );
        }
      }
      router.push(`/order-success/${resolvedOrderId ?? result.orderId}`);
    } catch (error) {
      console.error('Order placement error:', error);
      setIsProcessing(false);
    }
  };

  const shippingCharge = formData.shippingZone === 'OUTSIDE_DHAKA' ? 110 : 80;
  const orderTotal = totalPrice + shippingCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some items to proceed with checkout</p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Billing Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>



                  <div className="space-y-2">
                    <Label>Delivery Zone <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'INSIDE_DHAKA', label: 'Inside Dhaka', charge: '৳80' },
                        { value: 'OUTSIDE_DHAKA', label: 'Outside Dhaka', charge: '৳110' },
                      ].map(({ value, label, charge }) => {
                        const selected = formData.shippingZone === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, shippingZone: value }));
                              setZoneError(false);
                            }}
                            className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
                              ${selected
                                ? 'border-primary bg-primary/10 text-primary'
                                : zoneError
                                  ? 'border-destructive bg-destructive/5 text-foreground hover:border-primary hover:bg-primary/5'
                                  : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
                              }`}
                          >
                            <span>{label}</span>
                            <span className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-muted-foreground'}`}>{charge}</span>
                          </button>
                        );
                      })}
                    </div>
                    {zoneError && (
                      <p className="text-xs text-destructive mt-1">Please select a delivery zone to continue.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Items */}
              <ScrollArea className="h-80">
                <div className="space-y-4 pr-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b border-border">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatVariantLabel(item)}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          {item.quantity} × ৳{item.price.toFixed(2)} = ৳{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">৳{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">৳{shippingCharge.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    ৳{((totalPrice + (totalPrice > 50 ? 0 : 10)) * 0.1).toFixed(2)}
                  </span>
                </div> */}
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ৳{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Continue Shopping */}
              <Link href="/shop" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
