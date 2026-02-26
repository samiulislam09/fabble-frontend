import React from "react"
import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { UIProvider } from '@/lib/ui-context'
import SiteShell from '@/components/site-shell'
import './globals.css'

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });

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
      <body suppressHydrationWarning className={`${manrope.variable} ${cormorant.variable} font-sans antialiased bg-background text-foreground`}>
        <UIProvider>
          <AuthProvider>
            <CartProvider>
              <SiteShell categories={categories}>
                {children}
              </SiteShell>
            </CartProvider>
          </AuthProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  )
}
