'use client';

import { useCart } from '@/lib/cart-context';
import { Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full px-4 pb-2">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
              <div className="space-y-4 pr-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="border border-border rounded-lg p-4">
                    <div className="flex gap-4">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.color} | Size: {item.size}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">৳{Math.floor(item.price)} x {item.quantity} = {Math.floor(item.price * item.quantity)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id, item.size, item.color)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">৳{totalPrice.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose} className="block">
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
                {/* <Button variant="outline" className="w-full bg-transparent" onClick={() => clearCart()}>
                  Clear Cart
                </Button> */}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
