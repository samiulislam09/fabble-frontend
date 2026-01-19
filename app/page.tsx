import { getProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import ProductCard from '@/components/product-card';
import ProductSlider from '@/components/product-slider';
import HeroSlider from '@/components/hero-slider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const productsResponse = await getProducts();
  const products = productsResponse?.products || [];

  const categoriesResponse = await getCategories();
  const categories = categoriesResponse?.categories || [];

  const trendingProducts = products.filter((p) => p.isFeatured); // Mapping isFeatured to trending for now as isTrending isn't on API types explicitly or usage needs verification
  const bestSellerProducts = products.filter((p) => p.isFeatured); // Reuse featured for demo if fields missing
  const allProducts = products;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">

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
          <div className="mb-12">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Shop</p>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">By Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.filter(c => c.parentId === null).slice(0, 4).map((category) => (
              <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`}>
                <div className="group relative h-64 md:h-72 rounded-2xl overflow-hidden cursor-pointer">
                  <img
                    src={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop"} // Fallback image if null
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6">
                    <h3 className="text-white text-2xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers */}
        <section>
          <div className="mb-12">
            <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">Customer Favorites</p>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground">Best Sellers</h2>
          </div>
          <ProductSlider products={bestSellerProducts} infinite />
        </section>

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

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 max-w-xs px-5 py-3 rounded-xl border border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
