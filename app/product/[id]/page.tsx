
import { getProducts, getProduct } from '@/lib/products';
import ProductDetailsClient from './page.client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.name} | Fabble`,
    description: product.metaDescription || product.shortDescription,
  };
}

export default async function ProductDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  // Facebook ad traffic → show dedicated landing page
  if (sp.fbclid) {
    redirect(`/landing/${id}`);
  }

  const product = await getProduct(id);

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
