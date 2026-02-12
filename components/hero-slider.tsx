'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel } from '@/lib/carousels';

interface HeroSliderProps {
  carousels?: Carousel[];
}

export default function HeroSlider({ carousels = [] }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // If no carousels, don't render anything
  if (!carousels || carousels.length === 0) {
    return null;
  }

  const slides = carousels;

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

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background with Transition */}
      {slides.map((slideItem, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear"
            style={{
              backgroundImage: `url('${slideItem.image}')`,
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          <div className="overflow-hidden">
            <p className="text-sm md:text-base font-medium text-white/90 tracking-[0.3em] uppercase animate-fade-in-up">
              {slide.subtitle}
            </p>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif text-white tracking-tight leading-[0.9] drop-shadow-2xl animate-fade-in-up delay-100">
            <span className="block">{slide.title}</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up delay-200">
            {slide.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8 animate-fade-in-up delay-300">
            <Link href={slide.link || '/shop'}>
              <Button size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-white/90 rounded-none tracking-widest uppercase font-semibold transition-all duration-300 hover:px-10">
                {slide.cta}
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white rounded-none tracking-widest uppercase font-semibold backdrop-blur-sm">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Navigation */}
      <div className="absolute bottom-12 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-[2px] transition-all duration-300 ${index === currentSlide ? 'bg-white w-12' : 'bg-white/30 w-6 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
              className="p-3 border border-white/20 hover:bg-white hover:text-black hover:border-white text-white transition-all duration-300 rounded-full backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => goToSlide((currentSlide + 1) % slides.length)}
              className="p-3 border border-white/20 hover:bg-white hover:text-black hover:border-white text-white transition-all duration-300 rounded-full backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
