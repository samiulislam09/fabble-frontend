'use client';

import { Brand } from '@/lib/brands';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BrandSliderProps {
    brands: Brand[];
    title?: string;
    infinite?: boolean;
    autoPlay?: boolean;
}

export default function BrandSlider({ brands, title, infinite = true, autoPlay = true }: BrandSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

            if (infinite && containerRef.current) {
                const { scrollWidth, clientWidth } = containerRef.current;
                if (newScrollLeft <= 0) {
                    containerRef.current.scrollLeft = scrollWidth - clientWidth;
                } else if (newScrollLeft >= scrollWidth - clientWidth) {
                    containerRef.current.scrollLeft = 0;
                } else {
                    containerRef.current.scrollLeft = newScrollLeft;
                }
            } else {
                containerRef.current.scrollLeft = newScrollLeft;
            }
            checkScroll();
        }
    };

    const checkScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const container = containerRef.current;
        const handleScroll = () => checkScroll();
        container?.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        return () => {
            container?.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (autoPlay && infinite && !isHovered) {
            autoPlayRef.current = setInterval(() => {
                scroll('right');
            }, 4000);
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [autoPlay, infinite, isHovered]);

    if (brands.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                {title ? (
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary tracking-widest uppercase">Trusted Partners</p>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{title}</h2>
                    </div>
                ) : <div />}

                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft && !infinite}
                        className="p-3 bg-secondary/50 hover:bg-secondary rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight && !infinite}
                        className="p-3 bg-secondary/50 hover:bg-secondary rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                </div>
            </div>

            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    ref={containerRef}
                    className="flex gap-8 overflow-x-auto scroll-smooth no-scrollbar py-4 items-center"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.id}`}
                            className="flex-shrink-0 group flex flex-col items-center gap-3 w-32 sm:w-40"
                        >
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border border-border flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-primary/50">
                                {brand.logo ? (
                                    <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300" />
                                ) : (
                                    <span className="text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">{brand.name.charAt(0)}</span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{brand.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
