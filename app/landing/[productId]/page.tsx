import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/products';
import LandingProductClient from './landing-client';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} — Order Now`,
    description: product.shortDescription || product.metaDescription || `Order ${product.name} with cash on delivery.`,
    robots: { index: false, follow: false },
  };
}

export default async function ProductLandingPage({ params }: PageProps) {
  const { productId } = await params;
  const [product, productsResponse] = await Promise.all([
    getProduct(productId),
    getProducts(),
  ]);

  if (!product) notFound();

  const allProducts = productsResponse?.products ?? [];
  const related = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive && p.isVisible)
    .slice(0, 4);

  return <LandingProductClient product={product} relatedProducts={related} />;
}
