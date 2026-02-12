import { getProducts, getNewArrivals, getSaleProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { getCarousels } from '@/lib/carousels';
import { getBrands } from '@/lib/brands';
import { getBlogs } from '@/lib/blogs';
import ProductCard from '@/components/product-card';
import ProductSlider from '@/components/product-slider';
import HeroSlider from '@/components/hero-slider';
import BrandSlider from '@/components/brand-slider';
import BlogGrid from '@/components/blog-grid';
import NewsletterSignup from '@/components/newsletter-signup';
import { CategoryCard } from '@/components/category-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const productsResponse = await getProducts();
  const products = productsResponse?.products || [];

  const categoriesResponse = await getCategories();
  const categories = categoriesResponse?.categories || [];

  const carousels = await getCarousels();
  const brands = await getBrands();
  const blogs = await getBlogs();
  const newArrivals = await getNewArrivals();
  const saleProducts = await getSaleProducts();

  const trendingProducts = products.filter((p) => p.isFeatured);
  const bestSellerProducts = products.filter((p) => p.isFeatured);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider Section */}
      <HeroSlider carousels={carousels} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <div className="mb-12">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Just Landed</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">New Arrivals</h2>
            </div>
            <ProductSlider products={newArrivals} infinite />
          </section>
        )}

        {/* Trending Products */}
        <section>
          <div className="mb-12">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">What's Hot</p>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Trending Now</h2>
          </div>
          <ProductSlider products={trendingProducts} infinite />
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Curated Selection', description: 'Hand-picked pieces from premium brands' },
            { title: 'Free Shipping', description: 'On orders over $50 to anywhere' },
            { title: 'Easy Returns', description: '30-day return policy for peace of mind' },
          ].map((feature, idx) => (
            <div key={idx} className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-foreground/60">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Category Section */}
        <section>
          <div className="mb-12 flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Shop Collections</p>
            <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Find your perfect look from our carefully curated collections.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.filter(c => c.parentId === null).slice(0, 4).map((category, index) => (
              <div key={category.id} className={index % 2 === 1 ? "md:translate-y-8" : ""}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </section>

        {/* Brands Section */}
        {/* {brands.length > 0 && (
          <section>
            <BrandSlider brands={brands} title="Our Brands" />
          </section>
        )} */}

        {/* Best Sellers */}
        <section>
          <div className="mb-12">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Customer Favorites</p>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Best Sellers</h2>
          </div>
          <ProductSlider products={bestSellerProducts} infinite />
        </section>

        {/* Clearance / Sale Section */}
        {/* {saleProducts.length > 0 && (
          <section>
            <div className="mb-12">
              <p className="text-sm font-semibold text-destructive tracking-widest uppercase mb-2">Limited Time Offers</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">Clearance & Sale</h2>
            </div>
            <ProductSlider products={saleProducts} infinite />
          </section>
        )} */}

        {/* All Products */}
        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div>
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Complete Collection</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">All Products</h2>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="whitespace-nowrap bg-transparent">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.slice(0, 8).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Blog Section */}
        {/* {blogs.length > 0 && (
          <section>
            <div className="mb-12 flex flex-col items-center text-center">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Read Our Journal</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Latest Stories</h2>
            </div>
            <BlogGrid blogs={blogs} />
          </section>
        )} */}

        {/* Newsletter Section */}
        <section className="relative rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 p-12 md:p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Stay Updated</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">Join Our Community</h2>
            </div>

            <p className="text-lg text-foreground/70">
              Subscribe for exclusive offers, new collection launches, and style inspiration delivered to your inbox.
            </p>

            <NewsletterSignup />
          </div>
        </section>
      </div>
    </div>
  );
}

