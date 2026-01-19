
import { getProducts } from '@/lib/products';
import { Suspense } from 'react';
import Loading from './loading';
import ShopClient from './page.client';

export default async function ShopPage() {
  const productsResponse = await getProducts();
  const products = productsResponse?.products || [];

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<Loading />}>
        <ShopClient initialProducts={products} />
      </Suspense>
    </div>
  );
}
