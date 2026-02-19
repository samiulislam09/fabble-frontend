'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Menu, User, LogOut, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import { useMediaQuery } from '@/hooks/use-mobile';
import CartSidebar from './cart-sidebar';
import CategoryNav from './category-nav';
import SearchBar from './search-bar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Category } from '@/lib/categories';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  categories?: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { isCartOpen, openCart, closeCart } = useUI(); // Variable declared here
  const { user, logout, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const topLevelCategories = categories.filter((c) => c.parentId === null);
  const topLevelCategoriesWithChildren = topLevelCategories.filter(
    (c) => c.children && c.children.length > 0,
  );
  const topLevelCategoriesWithoutChildren = topLevelCategories.filter(
    (c) => !c.children || c.children.length === 0,
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <Image height={100} width={100} src="/fabble.png" alt="Fabble" className="h-18 w-auto" />
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
                    <DialogTitle className="sr-only">Search</DialogTitle>
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

              {!isLoading && !user && (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
              )}

              {!isLoading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-secondary/50">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative hover:bg-secondary/50"
              >
                <ShoppingCart className="h-10 w-10" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center text-[0.6rem]">
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
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation menu</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-8">
                      <nav className="space-y-1">
                        <Link href="/" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                          Home
                        </Link>
                        <Link href="/shop" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                          Shop All
                        </Link>
                        <Link href="/about" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                          About
                        </Link>
                        <Link href="/blog" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                          Blog
                        </Link>
                        {!isLoading && !user && (
                          <Link href="/login" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                            Sign In
                          </Link>
                        )}
                        {!isLoading && user && (
                          <>
                            <Link href="/account" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                              Account
                            </Link>
                            <Link href="/account/orders" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                              Orders
                            </Link>
                            <Link href="/wishlist" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition">
                              Wishlist
                            </Link>
                            <button
                              onClick={logout}
                              className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition"
                            >
                              Logout
                            </button>
                          </>
                        )}
                      </nav>

                      {topLevelCategories.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase px-1 mb-3">Shop by Category</p>
                          <div className="space-y-2">
                            {topLevelCategoriesWithoutChildren.map((category) => (
                              <Link
                                key={category.id}
                                href={`/shop?category=${encodeURIComponent(category.name)}`}
                                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/30 rounded-lg transition"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>

                          {topLevelCategoriesWithChildren.length > 0 && (
                            <Accordion type="single" collapsible className="mt-3 rounded-lg border border-border">
                              {topLevelCategoriesWithChildren.map((category) => (
                                <AccordionItem key={category.id} value={`category-${category.id}`} className="border-border">
                                  <AccordionTrigger className="px-4 py-3 text-sm font-medium text-foreground">
                                    {category.name}
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-2">
                                      <Link
                                        href={`/shop?category=${encodeURIComponent(category.name)}`}
                                        className="block text-sm font-medium text-foreground hover:text-primary transition"
                                      >
                                        View all {category.name}
                                      </Link>
                                      {category.children.map((sub) => (
                                        <Link
                                          key={sub.id}
                                          href={`/shop?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                                          className="block text-sm text-muted-foreground hover:text-primary transition"
                                        >
                                          {sub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          )}
                        </div>
                      )}
                    </div>
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
