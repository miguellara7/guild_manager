'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface PurchaseFormProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface PurchaseData {
  plan: 'BASIC' | 'EXTENDED';
  additionalWorlds: number;
  fromCharacter: string;
  notes: string;
}

export default function PurchaseForm({ searchParams }: PurchaseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PurchaseData>({
    plan: 'BASIC',
    additionalWorlds: 0,
    fromCharacter: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill form from URL params (from mobile app)
  useEffect(() => {
    if (searchParams.plan) {
      setFormData(prev => ({
        ...prev,
        plan: searchParams.plan as 'BASIC' | 'EXTENDED',
        additionalWorlds: parseInt(searchParams.additionalWorlds as string) || 0,
        fromCharacter: searchParams.fromCharacter as string || '',
      }));
    }
  }, [searchParams]);

  const calculateTotal = () => {
    const basePrice = 200;
    const additionalWorldsPrice = formData.additionalWorlds * 200;
    return basePrice + additionalWorldsPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fromCharacter.trim()) {
      setError('Please enter the character name that will send the Tibia Coins');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscription/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: formData.plan,
          amount: calculateTotal(),
          additionalWorlds: formData.additionalWorlds,
          transferDetails: {
            fromCharacter: formData.fromCharacter.trim(),
            toCharacter: 'Guild Manacoins',
            timestamp: new Date().toISOString(),
            notes: formData.notes,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to create purchase ticket');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-800">Purchase Ticket Created!</CardTitle>
            <CardDescription>
              Your purchase ticket has been submitted for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-green-700 space-y-2 text-left">
                <li>1. Send <strong>{calculateTotal()} Tibia Coins</strong> to <strong>Guild Manacoins</strong></li>
                <li>2. From character: <strong>{formData.fromCharacter}</strong></li>
                <li>3. Our admin will verify your payment within 24 hours</li>
                <li>4. Your subscription will be activated automatically</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase Subscription</h1>
          <p className="text-xl text-gray-600">Subscribe with Tibia Coins</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select the monitoring plan that fits your needs
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Plan Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Subscription Plan</Label>
                <RadioGroup
                  value={formData.plan}
                  onValueChange={(value: 'BASIC' | 'EXTENDED') => 
                    setFormData(prev => ({ ...prev, plan: value }))
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="BASIC" id="basic" />
                    <div className="flex-1">
                      <Label htmlFor="basic" className="font-semibold">Basic Plan - 200 TC</Label>
                      <p className="text-sm text-gray-600">Monitor 1 world with full features</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="EXTENDED" id="extended" />
                    <div className="flex-1">
                      <Label htmlFor="extended" className="font-semibold">Extended Plan - 200 TC + extras</Label>
                      <p className="text-sm text-gray-600">Monitor multiple worlds (200 TC per additional world)</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Worlds */}
              {formData.plan === 'EXTENDED' && (
                <div className="space-y-2">
                  <Label htmlFor="additionalWorlds">Additional Worlds (200 TC each)</Label>
                  <Input
                    id="additionalWorlds"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.additionalWorlds}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalWorlds: parseInt(e.target.value) || 0 
                    }))}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Transfer Character */}
              <div className="space-y-2">
                <Label htmlFor="fromCharacter" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Transfer Character
                </Label>
                <Input
                  id="fromCharacter"
                  type="text"
                  placeholder="Character name sending the coins"
                  value={formData.fromCharacter}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromCharacter: e.target.value }))}
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-600">
                  Enter the character name that will send the Tibia Coins
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information for the admin"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Payment Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Send to:</strong> <span className="font-mono">Guild Manacoins</span></p>
                  <p><strong>Amount:</strong> {calculateTotal()} Tibia Coins</p>
                  <p><strong>From:</strong> {formData.fromCharacter || 'Your character'}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{formData.plan} Plan</span>
                    <span>200 TC</span>
                  </div>
                  {formData.plan === 'EXTENDED' && formData.additionalWorlds > 0 && (
                    <div className="flex justify-between">
                      <span>{formData.additionalWorlds} Additional Worlds</span>
                      <span>{formData.additionalWorlds * 200} TC</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{calculateTotal()} TC</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  'Creating Purchase Ticket...'
                ) : (
                  <>
                    Create Purchase Ticket
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
