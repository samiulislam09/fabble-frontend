'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import FloatingCallButton from '@/components/floating-call-button';
import { type Category } from '@/lib/categories';

export default function SiteShell({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: Category[];
}) {
  const pathname = usePathname();
  const isLanding = pathname === '/landing' || pathname.startsWith('/landing/');

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingCallButton />
    </>
  );
}
