'use client';

import React from "react"

import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [locations, setLocations] = useState<{ division: string; district: string }[]>([]);

  useEffect(() => {
    fetch('/cities.json')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  const uniqueDivisions = Array.from(new Set(locations.map(l => l.division)));
  const availableDistricts = locations
    .filter(l => l.division === formData.state)
    .map(l => l.district);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const userToken = localStorage.getItem('x_auth_token'); // Assuming token is stored here based on apiRoute.ts

      const payload = {
        items: items.map(item => ({
          productId: item.productId || parseInt(item.id), // Fallback if id is numeric, though productId should be there now
          variantId: item.variantId || 0,
          quantity: item.quantity
        })),
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingCountry: "Bangladesh",
        shippingMethod: "STANDARD", // Hardcoded for simplified flow or add selector
        paymentMethod: "CASH_ON_DELIVERY", // Hardcoded or add selector
        customerNotes: "Please call before delivery", // Could be a form field
        couponCode: "" // Could be a form field
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:5001'}/api/orders/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      setIsProcessing(false);
      setOrderPlaced(true);
      clearCart();
      toast({
        title: 'Order Placed Successfully',
        description: 'Your order has been received. You will receive an email confirmation shortly.',
      });
    } catch (error) {
      console.error('Order placement error:', error);
      setIsProcessing(false);
      toast({
        title: 'Order Failed',
        description: 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <CardTitle className="text-3xl">Order Placed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">Thank you for your purchase. Your order has been confirmed and will be shipped soon.</p>
            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-muted-foreground">Order Number: #OS{Math.random().toString(36).substring(7).toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">Total: ${totalPrice.toFixed(2)}</p>
            </div>
            <Link href="/" className="block">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
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



                  <div className="grid grid-cols-3 w-full gap-2">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="country">Country</Label>
                      <Select value={"Bangladesh"}>
                        <SelectTrigger id="country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Division</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, city: '' }))}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueDivisions.map((division) => (
                            <SelectItem key={division} value={division}>{division}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">District</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                        disabled={!formData.state}
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
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
                          {item.color} | Size: {item.size}
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
                  <span className="font-medium text-foreground">
                    {totalPrice > 50 ? 'FREE' : '৳10.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    ৳{((totalPrice + (totalPrice > 50 ? 0 : 10)) * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ৳{(totalPrice + (totalPrice > 50 ? 0 : 10) + (totalPrice + (totalPrice > 50 ? 0 : 10)) * 0.1).toFixed(2)}
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
