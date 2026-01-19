'use client';

import { Product } from '@/lib/products';
import { Category } from '@/lib/categories';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown } from 'lucide-react';
// import { categoryMap } from '@/lib/category-map'; // Removed unused import

// Helper to safely parse float
const parsePrice = (price: string | number) => typeof price === 'string' ? parseFloat(price) : price;

interface ShopClientProps {
    initialProducts: Product[];
    initialCategories: Category[];
}

export default function ShopClient({ initialProducts, initialCategories }: ShopClientProps) {
    const searchParams = useSearchParams();
    const { addItem } = useCart();
    const { toast } = useToast();

    const products = initialProducts;

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [priceRange, setPriceRange] = useState([0, 250]);
    const [selectedColor, setSelectedColor] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    // Use passed categories (filter validation could happen here if needed)
    // Flatten categories or just use top level? Usually sidebar shows structure or flat list.
    // For now, let's just use the top-level categories passed.
    // user might want all flat for simple filter or nested. 
    // The previous code was flat list of names. Let's keep it simple: filter by top level category name.

    const categories = initialCategories.filter(c => c.parentId === null);

    const subcategories: string[] = []; // Placeholder as subcategory missing in new Type

    const colors = Array.from(new Set(products.flatMap((p) => p.tags.filter(t => ['red', 'blue', 'green', 'black', 'white', 'gray'].includes(t.toLowerCase()))))); // Mocking colors from tags or just empty

    // Filter products
    let filteredProducts = products.filter((product) => {
        const categoryMatch = !selectedCategory || product.category.name === selectedCategory;
        const subcategoryMatch = true; // !selectedSubcategory || product.subcategory === selectedSubcategory; // Disabled subcat for now
        const price = parsePrice(product.price);
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        // const colorMatch = !selectedColor || product.colors.includes(selectedColor); // colors not in new Type
        const colorMatch = true;
        return categoryMatch && subcategoryMatch && priceMatch && colorMatch;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);

        switch (sortBy) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            // case 'rating': return b.rating - a.rating; // No rating in new Type
            // case 'trending': return (b.rating - a.rating);
            default: // newest
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const handleAddToCart = (product: Product) => {
        // Need to adapt Product to CartItem type
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: parsePrice(product.price),
            quantity: 1,
            size: 'M', // Default
            color: 'Default',
            image: product.images[0],
        });
        toast({
            title: 'Added to cart',
            description: `${product.name} has been added to your cart`,
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">Shop</h1>
                <p className="text-muted-foreground">Showing {sortedProducts.length} products</p>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white rounded-lg border border-border p-6 space-y-6">
                        {/* Category Filter */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Category</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedSubcategory('');
                                    }}
                                    className={`block w-full text-left px-3 py-2 rounded-lg transition ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                        }`}
                                >
                                    All Categories
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.name);
                                            setSelectedSubcategory('');
                                        }}
                                        className={`block w-full text-left px-3 py-2 rounded-lg transition ${selectedCategory === category.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                            <div className="space-y-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="250"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>৳{priceRange[0].toFixed(0)}</span>
                                    <span>৳{priceRange[1].toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => {
                                setSelectedCategory('');
                                setSelectedSubcategory('');
                                setPriceRange([0, 250]);
                                setSelectedColor('');
                                setSortBy('newest');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Products Section */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between bg-white rounded-lg border border-border p-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 hover:bg-muted rounded transition"
                        >
                            Filters <ChevronDown className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {sortedProducts.map((product) => (
                                <div key={product.id}>
                                    <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-lg text-muted-foreground mb-4">No products found</p>
                            <Button onClick={() => {
                                setSelectedCategory('');
                                setPriceRange([0, 250]);
                            }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
