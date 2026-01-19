'use client';

import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function FloatingCallButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="relative">
        {/* Animated ripple background */}
        <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-75" />
        
        {/* Main button */}
        <Button
          onClick={() => window.location.href = 'tel:+15551234567'}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Phone className="h-6 w-6" />
        </Button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium shadow-lg">
            Call Us: +1 (555) 123-4567
            <div className="absolute left-full ml-1 top-1/2 -translate-y-1/2 border-8 border-transparent border-l-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
