
import { getProducts, getProduct } from '@/lib/products';
import ProductDetailsClient from './page.client';
import { Metadata } from 'next';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const product = await getProduct(id);

  console.log(product, "product");

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Fabble`,
    description: product.metaDescription || product.shortDescription,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  // Fetch all products to find related ones (simplified recommendation logic)
  // In a real app, you might have a dedicated related products endpoint
  const productsResponse = await getProducts();
  const allProducts = productsResponse?.products || [];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-foreground">Product not found</p>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
