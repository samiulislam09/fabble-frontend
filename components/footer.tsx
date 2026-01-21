import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-foreground/95 text-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <Image height={100} width={100} src="/fabble.png" alt="Fabble" className="h-26 w-auto brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed">
              Curating premium fashion that celebrates individuality and timeless elegance.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-background hover:bg-background/20">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-background hover:bg-background/20">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-background hover:bg-background/20">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-background hover:bg-background/20">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-background/70 hover:text-background transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-background/70 hover:text-background transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-background/70 hover:text-background transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-background transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-background/70 hover:text-background transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-background transition">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-background transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-background transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li>
                <a href="mailto:fashionfabble@gmail.com" className="hover:text-background transition">
                  fashionfabble@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+8801624257024" className="hover:text-background transition">
                  +8801624257024
                </a>
              </li>
              <li className="text-background/70">
                280/3 Kollyanpur, Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <Separator className="bg-background/20" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 text-sm text-background/60">
          <p>&copy; 2025 Fabble. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-background transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-background transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-background transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
