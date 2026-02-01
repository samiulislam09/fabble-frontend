'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function NewsletterSignup() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.status === 201) {
        toast({
          title: 'Subscription confirmed',
          description: 'Thanks for joining the newsletter.',
        });
        setEmail('');
        return;
      }

      const data = await response.json().catch(() => ({}));
      toast({
        title: 'Subscription failed',
        description: data?.error || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 max-w-xs px-5 py-3 rounded-xl border border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isSubmitting}
        required
      />
      <Button size="lg" className="whitespace-nowrap" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}
