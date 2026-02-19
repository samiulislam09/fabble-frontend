import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { UIProvider } from '@/lib/ui-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import FloatingCallButton from '@/components/floating-call-button'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <UIProvider>
          <AuthProvider>
            <CartProvider>
              <Header categories={categories} />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <FloatingCallButton />
            </CartProvider>
          </AuthProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  )
}
