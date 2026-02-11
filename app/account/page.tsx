'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth-fetch';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ProfileFormData {
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  dateOfBirth: string;
  gender: string;
}

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    dateOfBirth: '',
    gender: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    authFetch('/users/me')
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (!data?.user) return;
        const profile = data.user;
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          mobile: profile.mobile || '',
          address: profile.address || '',
          city: profile.city || '',
          dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
          gender: profile.gender || ''
        });
      })
      .catch(() => undefined);
  }, [user]);

  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to view your account</h1>
          <p className="text-muted-foreground">Create an account to track orders and manage your profile.</p>
          <Link href="/login">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof ProfileFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formData.name || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined
    };

    const response = await authFetch('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setIsSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({
        title: 'Update failed',
        description: data?.message || 'Could not update profile.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Profile updated',
      description: 'Your account details have been saved.'
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Name</Label>
                  <Input
                    id="account-name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-mobile">Mobile</Label>
                  <Input id="account-mobile" value={formData.mobile} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-city">City</Label>
                  <Input
                    id="account-city"
                    value={formData.city}
                    onChange={handleChange('city')}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-address">Address</Label>
                <Input
                  id="account-address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-dob">Date of Birth</Label>
                  <Input
                    id="account-dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
