import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, Globe, Heart, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold">About StyleHub</h1>
          <p className="text-xl opacity-90">
            Discover a world of fashion where quality meets style, and every piece tells a story.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Our Story */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-foreground/80 text-lg leading-relaxed mb-4">
                StyleHub was founded in 2015 with a simple mission: to make premium fashion accessible to everyone. What started as a small boutique in New York City has grown into a global online destination for fashion enthusiasts.
              </p>
              <p className="text-foreground/80 text-lg leading-relaxed mb-4">
                We believe that fashion is more than just clothing—it's a form of self-expression. Every piece in our collection is carefully curated to ensure quality, style, and value for our customers.
              </p>
              <p className="text-foreground/80 text-lg leading-relaxed">
                Today, we serve thousands of customers worldwide, helping them discover their unique style and express themselves through fashion.
              </p>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1441986300352-7e3dee89fbfa?w=500&h=500&fit=crop"
                alt="StyleHub Store"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Quality',
                description: 'We are committed to offering only the highest quality products that stand the test of time.',
              },
              {
                icon: Globe,
                title: 'Sustainability',
                description: 'We work with ethical suppliers and promote sustainable fashion practices.',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We believe in building a community of fashion lovers and supporting each other.',
              },
              {
                icon: Award,
                title: 'Innovation',
                description: 'We continuously innovate to bring fresh styles and shopping experiences to our customers.',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="bg-white rounded-lg border border-border p-8 text-center space-y-4">
                  <Icon className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                  <p className="text-foreground/80">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white rounded-lg border border-border p-12">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">Why Choose StyleHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '1000+',
                label: 'Premium Products',
                description: 'Carefully selected items from renowned designers and brands',
              },
              {
                number: '50K+',
                label: 'Happy Customers',
                description: 'Join thousands of satisfied customers worldwide',
              },
              {
                number: '24/7',
                label: 'Customer Support',
                description: 'Our dedicated team is always ready to help',
              },
              {
                number: '30-Day',
                label: 'Returns',
                description: 'Shop with confidence with our hassle-free return policy',
              },
              {
                number: 'Free',
                label: 'Shipping',
                description: 'On all orders over $50',
              },
              {
                number: '100%',
                label: 'Secure',
                description: 'Safe and encrypted checkout process',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{item.number}</div>
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-sm text-foreground/80">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
              },
              {
                name: 'Michael Chen',
                role: 'Head of Design',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
              },
            ].map((member, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-foreground/80">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Contact our team anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-foreground">Email: info@stylehub.com</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-foreground">Phone: +1 (555) 123-4567</span>
          </div>
          <Link href="/shop">
            <Button size="lg">Start Shopping Now</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
