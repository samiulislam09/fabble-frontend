'use client';

import React, { useState, useEffect } from "react"
import { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/product-card';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { colorMap } from '@/lib/colors';

const parsePrice = (price: string | number) => typeof price === 'string' ? parseFloat(price) : price;

// Helper to parse images - handles comma-separated string or array
const parseImages = (images: string | string[] | undefined | null): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) {
        // If it's an array, check if first element contains commas (comma-separated string in array)
        if (images.length === 1 && images[0] && images[0].includes(',')) {
            return images[0].split(',').map(img => img.trim()).filter(Boolean);
        }
        // Check each element for comma-separated values and flatten
        return images.flatMap(img => 
            img && img.includes(',') ? img.split(',').map(i => i.trim()).filter(Boolean) : [img]
        ).filter(Boolean);
    }
    // If it's a string, split by comma
    if (typeof images === 'string') {
        return images.split(',').map(img => img.trim()).filter(Boolean);
    }
    return [];
};

interface ProductDetailsClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
    const { addItem } = useCart();
    const { openCart } = useUI();
    const { toast } = useToast();

    // Parse images to handle comma-separated strings
    const productImages = parseImages(product.images);
    

    const [selectedSize, setSelectedSize] = useState<string>(''); // Sizes not in new Product type?
    const [selectedColor, setSelectedColor] = useState<string>(''); // Colors not in new Product type?
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(productImages[0] || '');
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Mock sizes/colors if missing from API
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const colors = product.tags.filter(t => ['red', 'blue', 'green', 'black', 'white', 'gray'].includes(t.toLowerCase()));

    // Set defaults
    useEffect(() => {
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        if (colors.length > 0) setSelectedColor(colors[0]);
    }, []);

    // Scroll to top on page load (handled by nextjs usually but good to keep if needed)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [product.id]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const img = e.currentTarget;
        const { left, top, width, height } = img.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
        setIsZoomed(true);
    };

    const handleAddToCart = () => {
        const price = parsePrice(product.price);
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: price,
            quantity,
            size: selectedSize || 'One Size',
            color: selectedColor || 'Default',
            image: productImages[0] || '',
            productId: product.id,
            variantId: 0, // Defaulting to 0 as variants are mocked
        });
        toast({
            title: 'Added to cart',
            description: `${product.name} x${quantity} has been added to your cart`,
        });
        openCart();
    };

    const price = parsePrice(product.price);
    const comparePrice = product.comparePrice ? parsePrice(product.comparePrice) : null;
    const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Product Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image with Zoom */}
                    <div
                        className="relative overflow-hidden bg-muted rounded-lg aspect-square group cursor-zoom-in"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        <img
                            src={mainImage || "/placeholder.svg"}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
                                }`}
                            style={
                                isZoomed
                                    ? {
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    }
                                    : {}
                            }
                        />
                        {!isZoomed && <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                        {discount > 0 && (
                            <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-sm font-bold px-4 py-2 rounded-full">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {productImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img)}
                                    className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${mainImage === img ? 'border-primary' : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <img src={img || "/placeholder.svg"} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    {/* Title and Rating */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                        <div className="flex items-center gap-3">
                            {/* Mock stars/reviews as not in API */}
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < 4 ? '★' : '☆'}</span>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                4.5 out of 5 (10 reviews)
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-bold text-primary">৳{price.toFixed(2)}</span>
                            {comparePrice && (
                                <>
                                    <span className="text-lg line-through text-muted-foreground">৳{comparePrice.toFixed(2)}</span>
                                    <span className="text-lg font-semibold text-secondary">Save ৳{(comparePrice - price).toFixed(2)}</span>
                                </>
                            )}
                        </div>
                        <p className="text-sm text-green-600 font-medium">{product.stockQuantity > 0 ? '✓ In Stock' : '✗ Out of Stock'}</p>
                    </div>

                    {/* Description */}
                    <p className="text-foreground/80 leading-relaxed">{product.description}</p>

                    {/* Size Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">Size</label>
                        <div className="flex flex-wrap gap-3">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-2 rounded-lg border-2 transition font-medium ${selectedSize === size
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-white text-foreground hover:border-primary'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    {colors.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">Color</label>
                            <div className="flex flex-wrap gap-4">
                                <TooltipProvider>
                                    {colors.map((color) => {
                                        const hexColor = colorMap[color] || '#CCCCCC';
                                        return (
                                            <Tooltip key={color}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-12 h-12 rounded-full border-3 transition transform hover:scale-110 ${selectedColor === color
                                                            ? 'border-primary shadow-lg'
                                                            : 'border-border hover:border-primary/50'
                                                            }`}
                                                        style={{ backgroundColor: hexColor }}
                                                        title={color}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-foreground text-background">
                                                    <p className="font-semibold">{color}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Selected: {selectedColor}</p>
                        </div>
                    )}

                    {/* Quantity and Add to Cart */}
                    <div className="flex gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-2 text-foreground hover:bg-muted transition"
                            >
                                −
                            </button>
                            <span className="px-6 py-2 font-semibold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-2 text-foreground hover:bg-muted transition"
                            >
                                +
                            </button>
                        </div>
                        <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                        </Button>
                        {/* <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition"
                        >
                            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                        </button> */}
                    </div>

                    {/* Product Info */}
                    <div className="border-t border-border pt-6 space-y-3">
                        {/* <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-foreground">Free shipping on orders over ৳5550</span>
                        </div> */}
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-foreground">7-day easy returns</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-foreground">Secure checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-8">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
