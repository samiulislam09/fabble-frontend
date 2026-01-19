
import { getProducts } from '@/lib/products';
import ProductDetailsClient from './page.client';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = params;
  const productsResponse = await getProducts();
  const products = productsResponse?.products || [];

  const product = products.find((p) => p.id.toString() === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-foreground">Product not found</p>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
