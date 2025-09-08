'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const paymentSchema = z.object({
  fromCharacter: z
    .string()
    .min(1, 'Character name is required')
    .max(30, 'Character name must be less than 30 characters'),
  additionalWorlds: z
    .number()
    .min(0)
    .max(10)
    .optional(),
  transferTimestamp: z
    .string()
    .min(1, 'Transfer date and time is required'),
  screenshot: z
    .string()
    .optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  planId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentForm({ planId, onClose, onSuccess }: PaymentFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [planData, setPlanData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      additionalWorlds: planId === 'extended' ? 1 : undefined,
    },
  });

  const additionalWorlds = watch('additionalWorlds');

  // Mock plan data - in real app, fetch from API
  const plans = {
    basic: {
      name: 'Basic Plan',
      tibiaCoinsPrice: 750,
      usdPrice: 20,
      worldLimit: 1,
      duration: 30,
    },
    extended: {
      name: 'Extended World',
      tibiaCoinsPrice: 750,
      usdPrice: 20,
      worldLimit: 1,
      duration: 30,
    },
  };

  const currentPlan = plans[planId as keyof typeof plans];
  const totalAmount = planId === 'extended' 
    ? (currentPlan?.tibiaCoinsPrice || 0) * (additionalWorlds || 1)
    : currentPlan?.tibiaCoinsPrice || 0;

  const receivingCharacter = "Guild Manager Bot"; // This would be configured

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Screenshot must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setValue('screenshot', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId.toUpperCase(),
          amount: totalAmount,
          additionalWorlds: planId === 'extended' ? additionalWorlds : undefined,
          transferDetails: {
            fromCharacter: data.fromCharacter,
            toCharacter: receivingCharacter,
            timestamp: new Date(data.transferTimestamp).toISOString(),
            screenshot: data.screenshot,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentId(result.paymentId);
        setStep(3);
      } else {
        setError(result.error || 'Failed to submit payment');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span>Pay with Tibia Coins</span>
          </DialogTitle>
          <DialogDescription>
            Complete your subscription payment using Tibia Coins
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Payment Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to complete your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-500 text-white text-xs">1</Badge>
                    <div>
                      <p className="font-medium">Transfer Tibia Coins</p>
                      <p className="text-sm text-muted-foreground">
                        Send <strong>{totalAmount} Tibia Coins</strong> to character{' '}
                        <strong className="text-blue-600">{receivingCharacter}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-500 text-white text-xs">2</Badge>
                    <div>
                      <p className="font-medium">Take Screenshot</p>
                      <p className="text-sm text-muted-foreground">
                        Capture the successful transfer confirmation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-500 text-white text-xs">3</Badge>
                    <div>
                      <p className="font-medium">Submit Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Fill out the form with transfer details
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Make sure to send the exact amount of{' '}
                    <strong>{totalAmount} Tibia Coins</strong> to avoid processing delays.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>{currentPlan?.name}</span>
                  <span>{currentPlan?.tibiaCoinsPrice} TC</span>
                </div>
                
                {planId === 'extended' && additionalWorlds && additionalWorlds > 1 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Additional worlds × {additionalWorlds - 1}</span>
                    <span>{(additionalWorlds - 1) * (currentPlan?.tibiaCoinsPrice || 0)} TC</span>
                  </div>
                )}
                
                <hr />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{totalAmount} TC</span>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  ≈ ${planId === 'extended' ? (additionalWorlds || 1) * (currentPlan?.usdPrice || 0) : currentPlan?.usdPrice} USD
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                I've Sent the Payment
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromCharacter">Your Character Name</Label>
                <Input
                  id="fromCharacter"
                  placeholder="Character that sent the coins"
                  disabled={loading}
                  {...register('fromCharacter')}
                  className={errors.fromCharacter ? 'border-red-500' : ''}
                />
                {errors.fromCharacter && (
                  <p className="text-sm text-red-500">{errors.fromCharacter.message}</p>
                )}
              </div>

              {planId === 'extended' && (
                <div className="space-y-2">
                  <Label htmlFor="additionalWorlds">Number of Additional Worlds</Label>
                  <Input
                    id="additionalWorlds"
                    type="number"
                    min="1"
                    max="10"
                    disabled={loading}
                    {...register('additionalWorlds', { valueAsNumber: true })}
                    className={errors.additionalWorlds ? 'border-red-500' : ''}
                  />
                  {errors.additionalWorlds && (
                    <p className="text-sm text-red-500">{errors.additionalWorlds.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="transferTimestamp">Transfer Date & Time</Label>
                <Input
                  id="transferTimestamp"
                  type="datetime-local"
                  disabled={loading}
                  {...register('transferTimestamp')}
                  className={errors.transferTimestamp ? 'border-red-500' : ''}
                />
                {errors.transferTimestamp && (
                  <p className="text-sm text-red-500">{errors.transferTimestamp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload screenshot of the transfer confirmation
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="screenshot-upload"
                    disabled={loading}
                  />
                  <Label htmlFor="screenshot-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" disabled={loading}>
                      Choose File
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment Submitted Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your payment is now being reviewed by our administrators
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {paymentId}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(paymentId || '')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-medium">{totalAmount} Tibia Coins</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next?</strong><br />
                Our administrators will verify your payment within 24 hours. 
                You'll receive a notification once your subscription is activated.
              </AlertDescription>
            </Alert>

            <Button onClick={onSuccess} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


