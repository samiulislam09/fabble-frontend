'use client';

import React, { useState, useEffect, useMemo } from "react"
import { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useUI } from '@/lib/ui-context';
import ProductCard from '@/components/product-card';
import { Heart, ShoppingCart, Check, XCircle } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { colorMap } from '@/lib/colors';
import { authFetch } from '@/lib/auth-fetch';

const parsePrice = (price: string | number) => typeof price === 'string' ? parseFloat(price) : price;

// Helper to parse images - handles comma-separated string or array
const parseImages = (images: string | string[] | undefined | null): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) {
        if (images.length === 1 && images[0] && images[0].includes(',')) {
            return images[0].split(',').map(img => img.trim()).filter(Boolean);
        }
        return images.flatMap(img =>
            img && img.includes(',') ? img.split(',').map(i => i.trim()).filter(Boolean) : [img]
        ).filter(Boolean);
    }
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
    const { user } = useAuth();

    const productImages = parseImages(product.images);

    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(productImages[0] || '');
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isWishlisted, setIsWishlisted] = useState(false);

    // --- Variant Logic ---
    const activeVariants = useMemo(() => Array.isArray(product.variants)
        ? product.variants.filter((variant) => variant?.isActive !== false)
        : [], [product.variants]);

    const hasVariants = activeVariants.length > 0;

    // Detect if variants are composite (contain " / ")
    const isCompositeWrap = useMemo(() => activeVariants.some(v => v.value.includes(' / ')), [activeVariants]);

    // Extract unique options for each position in the composite string
    const variantOptions = useMemo(() => {
        if (!hasVariants) return [];

        // Check if variants follow the "Type: Value" format (e.g. "Size: Small / Color: Red")
        // We check the first variant to decide the parsing strategy
        const sampleVariant = activeVariants[0];
        const isNewFormat = sampleVariant.value.includes(': ');

        if (isNewFormat) {
            // New Format: "Size: Small / Color: Red"
            // We assume all variants follow the same structure of types
            const parts = sampleVariant.value.split(' / ');
            const types = parts.map(p => p.split(': ')[0].trim());

            return types.map((type, typeIdx) => {
                // Collect all unique values for this type
                const values = Array.from(new Set(activeVariants.map(v => {
                    const vParts = v.value.split(' / ');
                    const relevantPart = vParts[typeIdx] || '';
                    return relevantPart.split(': ')[1]?.trim() || relevantPart;
                })));
                return { name: type, values };
            });
        } else {
            // Old Format: "Small / Red" (Legacy fallback)
            const splitValues = activeVariants.map(v => isCompositeWrap ? v.value.split(' / ') : [v.value]);
            const numOptions = splitValues[0]?.length || 0;

            const options = [];
            for (let i = 0; i < numOptions; i++) {
                const values = Array.from(new Set(splitValues.map(v => v[i])));
                let name = `Option ${i + 1}`;

                // Try to guess name
                const firstVal = values[0]?.toLowerCase();
                const isColor = values.some(v => colorMap[v.toLowerCase()]) || name.toLowerCase().includes('color');
                const isSize = ['s', 'm', 'l', 'xl', 'xxl'].some(s => firstVal === s || firstVal?.endsWith(s)) || name.toLowerCase().includes('size');

                if (isColor) name = "Color";
                else if (isSize) name = "Size";

                // Override if backend VariantType name is specific and unique (for simple case)
                if (!isCompositeWrap && numOptions === 1) {
                    const typeName = activeVariants[0]?.variantType?.name;
                    if (typeName && typeName !== 'Variant' && typeName !== 'Standard') name = typeName;
                }

                options.push({ name, values });
            }
            return options;
        }
    }, [activeVariants, isCompositeWrap, hasVariants]);

    // State for selected options { 0: "Red", 1: "S" }
    // Note: For new format, we store just the Value (e.g. "Red"), not "Color: Red"
    const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

    // Find selected variant based on options
    const selectedVariant = useMemo(() => {
        if (!hasVariants) return null;
        return activeVariants.find(v => {
            // Normalize variant value to array of just values
            // New Format: "Size: Small / Color: Red" -> ["Small", "Red"]
            // Old Format: "Small / Red" -> ["Small", "Red"]

            let vValues: string[];
            if (v.value.includes(': ')) {
                vValues = v.value.split(' / ').map(p => p.split(': ')[1]?.trim() || p);
            } else {
                vValues = isCompositeWrap ? v.value.split(' / ') : [v.value];
            }

            return variantOptions.every((_, idx) => vValues[idx] === selectedOptions[idx]);
        }) || null;
    }, [activeVariants, selectedOptions, variantOptions, isCompositeWrap, hasVariants]);

    // Initialize selections
    useEffect(() => {
        if (hasVariants && Object.keys(selectedOptions).length === 0) {
            // Default to first variant's options
            const defaultVariant = activeVariants.find(v => v.isDefault) || activeVariants[0];
            if (defaultVariant) {
                let vValues: string[];
                if (defaultVariant.value.includes(': ')) {
                    vValues = defaultVariant.value.split(' / ').map(p => p.split(': ')[1]?.trim() || p);
                } else {
                    vValues = isCompositeWrap ? defaultVariant.value.split(' / ') : [defaultVariant.value];
                }

                const initial: Record<number, string> = {};
                vValues.forEach((val, idx) => initial[idx] = val);
                setSelectedOptions(initial);
            }
        }
    }, [hasVariants, activeVariants, isCompositeWrap]);


    useEffect(() => {
        if (selectedVariant?.image) {
            setMainImage(selectedVariant.image);
        }
    }, [selectedVariant?.image]);

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

    const handleOptionSelect = (optionIndex: number, value: string) => {
        const newOptions = { ...selectedOptions, [optionIndex]: value };

        // Intelligence: If the new combination is invalid (doesn't exist), try to find a valid one
        const potentialVariant = activeVariants.find(v => {
            let vValues: string[];
            if (v.value.includes(': ')) {
                vValues = v.value.split(' / ').map(p => p.split(': ')[1]?.trim() || p);
            } else {
                vValues = isCompositeWrap ? v.value.split(' / ') : [v.value];
            }
            return vValues[optionIndex] === value;
        });

        if (potentialVariant) {
            // Check validity of current other options + new option
            const isValidCombination = activeVariants.some(v => {
                let vValues: string[];
                if (v.value.includes(': ')) {
                    vValues = v.value.split(' / ').map(p => p.split(': ')[1]?.trim() || p);
                } else {
                    vValues = isCompositeWrap ? v.value.split(' / ') : [v.value];
                }

                return variantOptions.every((_, idx) =>
                    idx === optionIndex ? value === vValues[idx] : newOptions[idx] === vValues[idx]
                );
            });

            if (!isValidCombination) {
                // If invalid, switch to the potential variant's other options
                let potValues: string[];
                if (potentialVariant.value.includes(': ')) {
                    potValues = potentialVariant.value.split(' / ').map(p => p.split(': ')[1]?.trim() || p);
                } else {
                    potValues = isCompositeWrap ? potentialVariant.value.split(' / ') : [potentialVariant.value];
                }

                potValues.forEach((val, idx) => {
                    if (idx !== optionIndex) newOptions[idx] = val;
                });
            }
        }

        setSelectedOptions(newOptions);
    };

    const handleAddToCart = () => {
        if (hasVariants && !selectedVariant) return;

        const price = parsePrice(selectedVariant?.price ?? product.price);

        // Map options to standard fields if possible
        const sizeOptionIdx = variantOptions.findIndex(o => o.name === 'Size');
        const colorOptionIdx = variantOptions.findIndex(o => o.name === 'Color');

        const size = sizeOptionIdx >= 0 ? selectedOptions[sizeOptionIdx] : (selectedVariant ? 'One Size' : 'One Size');
        const color = colorOptionIdx >= 0 ? selectedOptions[colorOptionIdx] : 'Default';

        addItem({
            id: product.id.toString(),
            name: product.name,
            price: price,
            quantity,
            size,
            color,
            image: selectedVariant?.image || productImages[0] || '',
            productId: product.id,
            variantId: selectedVariant?.id,
            variantType: selectedVariant?.variantType?.name || 'Variant',
            variantValue: selectedVariant?.value,
        });
        openCart();
    };

    const price = parsePrice(selectedVariant?.price ?? product.price);
    const comparePrice = selectedVariant?.comparePrice
        ? parsePrice(selectedVariant.comparePrice)
        : (product.comparePrice ? parsePrice(product.comparePrice) : null);
    const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
    const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div
                        className="relative overflow-hidden bg-muted rounded-lg aspect-square group cursor-zoom-in"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        <img
                            src={mainImage || "/placeholder.svg"}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                            style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                        />
                        {!isZoomed && <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                        {discount > 0 && (
                            <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-sm font-bold px-4 py-2 rounded-full">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    {productImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img)}
                                    className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${mainImage === img ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <img src={img || "/placeholder.svg"} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < 4 ? '★' : '☆'}</span>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">4.5 out of 5 (10 reviews)</span>
                        </div>
                    </div>

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
                        <p className="text-sm text-green-600 font-medium">{stockQuantity > 0 ? '✓ In Stock' : '✗ Out of Stock'}</p>
                    </div>



                    {hasVariants && (
                        <div className="space-y-4">
                            {variantOptions.map((option, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm font-semibold text-foreground mb-3">{option.name}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {option.values.map((val) => {
                                            const isSelected = selectedOptions[idx] === val;
                                            const isColor = option.name === 'Color';

                                            // Check availability of this specific value in combination with other selected options?
                                            // For simplicity, just render.



                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleOptionSelect(idx, val)}
                                                    className={`px-4 py-2 rounded-lg border-2 transition font-medium ${isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border bg-white text-foreground hover:border-primary'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {selectedVariant && (
                                <p className="text-sm text-muted-foreground">Selected: {selectedVariant.value}</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-foreground hover:bg-muted transition">−</button>
                            <span className="px-6 py-2 font-semibold">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(quantity + 1, 10))} disabled={quantity >= 10} className="px-4 py-2 text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                        </div>
                        <Button
                            size="lg"
                            className={`flex-1 ${stockQuantity <= 0 ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                            onClick={handleAddToCart}
                            disabled={(hasVariants && !selectedVariant) || stockQuantity <= 0}
                        >
                            {stockQuantity <= 0 ? (
                                <>
                                    <XCircle className="h-5 w-5 mr-2" />
                                    Out of Stock
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                </>
                            )}
                        </Button>
                        <button
                            onClick={async () => {
                                if (!user) return;
                                const response = await authFetch('/wishlist/add', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ productId: product.id })
                                });
                                if (response.ok) {
                                    setIsWishlisted(true);
                                }
                            }}
                            className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition"
                        >
                            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                        </button>
                    </div>

                    <div className="border-t border-border pt-6 space-y-3">
                        <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" /><span className="text-sm text-foreground">7-day easy returns</span></div>
                        <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" /><span className="text-sm text-foreground">Secure checkout</span></div>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="mb-16 max-w-4xl">
                <h2 className="text-2xl font-bold text-foreground mb-6 font-serif">Description</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-lg">
                        {product.description}
                    </p>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-8">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
