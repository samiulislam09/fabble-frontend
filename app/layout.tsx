import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { UIProvider } from '@/lib/ui-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import FloatingCallButton from '@/components/floating-call-button'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'StyleHub - Premium Clothing Store',
  description: 'Discover the latest in fashion with our curated collection of premium clothing',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

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
          <CartProvider>
            <Header categories={categories} />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <FloatingCallButton />
          </CartProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  )
}
