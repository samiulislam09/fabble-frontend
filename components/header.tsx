'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import { useMediaQuery } from '@/hooks/use-mobile';
import CartSidebar from './cart-sidebar';
import CategoryNav from './category-nav';
import SearchBar from './search-bar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Category } from '@/lib/categories';

interface HeaderProps {
  categories?: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const { totalItems } = useCart();
  const { isCartOpen, openCart, closeCart, setIsCartOpen } = useUI(); // Variable declared here
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                Fabble
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            {!isMobile && <SearchBar />}

            {/* Right Navigation */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              {isMobile && (
                <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-secondary/50">
                      <Search className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <SearchBar isMobile onSearch={() => setIsSearchOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}

              {/* Language Selector */}
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs font-medium hover:bg-secondary/50">
                    {language}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-20 p-1">
                  {['EN', 'ES', 'FR', 'DE'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full text-left px-3 py-2 text-xs rounded transition ${language === lang ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground hover:bg-secondary/50'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </PopoverContent>
              </Popover> */}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative hover:bg-secondary/50"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center text-[0.6rem]">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-secondary/50">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <nav className="space-y-1 mt-8">
                      <Link href="/" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        Home
                      </Link>
                      <Link href="/shop" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        Shop All
                      </Link>
                      <Link href="/shop?category=Men" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        Men
                      </Link>
                      <Link href="/shop?category=Women" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        Women
                      </Link>
                      <Link href="/shop?category=Kids" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        Kids
                      </Link>
                      <Link href="/about" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                        About
                      </Link>
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          {/* Category Navigation - Hidden on mobile */}
          {!isMobile && <CategoryNav categories={categories} />}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
