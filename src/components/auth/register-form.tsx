'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Globe, Lock, CreditCard } from 'lucide-react';

interface RegisterFormData {
  characterName: string;
  world: string;
  guildName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    characterName: '',
    world: '',
    guildName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: formData.characterName,
          world: formData.world,
          guildName: formData.guildName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Registration successful. Please login with your credentials.');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join Tibia Guild Manager</h1>
          <p className="text-xl text-gray-600">Start monitoring your guild today</p>
        </div>

        {/* Pricing Info */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Simple Pricing
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-blue-600">200 TC</span> per world/month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Real-time online monitoring
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Death tracking & alerts
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Enemy guild monitoring
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Mobile & web access
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">
                <strong>Payment:</strong> Send Tibia Coins to <span className="font-mono text-blue-600">Guild Manacoins</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                After registration, create a purchase ticket for manual verification
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Fill in your Tibia character details to get started
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="characterName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Character Name
                  </Label>
                  <Input
                    id="characterName"
                    type="text"
                    placeholder="Your main character"
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="world" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    World
                  </Label>
                  <Input
                    id="world"
                    type="text"
                    placeholder="e.g., Antica, Bona"
                    value={formData.world}
                    onChange={(e) => handleInputChange('world', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guildName" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Guild Name
                </Label>
                <Input
                  id="guildName"
                  type="text"
                  placeholder="Your guild name"
                  value={formData.guildName}
                  onChange={(e) => handleInputChange('guildName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Guild Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password for your guild"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">How it works:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Register with your character and guild details</li>
                  <li>2. Create a purchase ticket for your subscription</li>
                  <li>3. Send 200 TC to "Guild Manacoins"</li>
                  <li>4. We verify your payment and activate your account</li>
                  <li>5. Start monitoring your guild immediately!</li>
                </ol>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
