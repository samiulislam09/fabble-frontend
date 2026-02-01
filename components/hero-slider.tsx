'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel } from '@/lib/carousels';

interface HeroSliderProps {
  carousels?: Carousel[];
}

// Fallback slides if no data provided
const defaultSlides = [
  {
    id: 1,
    title: 'Elevate Your Wardrobe',
    subtitle: 'Premium Clothing Collection',
    description: 'Discover carefully curated pieces that combine timeless elegance with contemporary style. Express your individuality through fashion.',
    cta: 'Explore Collection',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=800&fit=crop',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fresh Styles',
    description: 'Check out our latest collection featuring the most trendy and comfortable pieces for the season.',
    cta: 'Shop New Arrivals',
    link: '/shop?sort=new',
    image: 'https://images.unsplash.com/photo-1595551900611-68613ce5583e?w=1200&h=800&fit=crop',
  }
];

export default function HeroSlider({ carousels = [] }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const slides = carousels.length > 0 ? carousels : defaultSlides;

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const slide = slides[currentSlide];

  console.log(slide);

  return (
    <section className={`relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden transition-all duration-500`}>
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${slide.image}')`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase text-white">{slide.subtitle}</p>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight text-white">
            {slide.title}
          </h1>
        </div>

        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto text-balance leading-relaxed animate-fade-in text-white">
          {slide.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
          <Link href={slide.link || '/shop'}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {slide.cta}
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
          />
        ))}
      </div>
    </section>
  );
}
