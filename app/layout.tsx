import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { UIProvider } from '@/lib/ui-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import FloatingCallButton from '@/components/floating-call-button'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });



import { getCategories } from '@/lib/categories';

// ... (imports remain)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categoriesResponse = await getCategories();
  const categories = categoriesResponse?.categories || [];

  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <UIProvider>
          <AuthProvider>
            <CartProvider>
              <Header categories={categories} />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <FloatingCallButton />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  )
}
