'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Globe,
  Crown,
  Calendar,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentForm from './payment-form';
import PaymentHistory from './payment-history';

interface SubscriptionManagerProps {
  userId: string;
}

interface SubscriptionStatus {
  status: string;
  plan: string | null;
  worldLimit: number;
  expiresAt: string | null;
  isExpired: boolean;
  daysRemaining: number;
  recentPayments: any[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tibiaCoinsPrice: number;
  usdPrice: number;
  worldLimit: number;
  features: string[];
  duration: number;
}

export default function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_PAYMENT':
        return 'Pending Payment';
      case 'INACTIVE':
        return 'Inactive';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription and billing with Tibia Coins
          </p>
        </div>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={cn('text-xs', getStatusColor(subscription.status))}>
                  {formatStatus(subscription.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">
                  {subscription.plan ? `${subscription.plan} Plan` : 'No active plan'}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Worlds Limit</p>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{subscription.worldLimit}</span>
                </div>
              </div>

              {subscription.expiresAt && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">
                        {new Date(subscription.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className={cn(
                        'font-medium',
                        subscription.daysRemaining <= 7 ? 'text-red-500' : 'text-green-500'
                      )}>
                        {subscription.daysRemaining} days
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Active Subscription
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose a plan to start monitoring your guild
              </p>
            </div>
          )}

          {subscription?.isExpired && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription has expired. Please renew to continue using the service.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {/* Available Plans */}
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                {plan.id === 'basic' && (
                  <Badge className="absolute -top-3 left-4 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {plan.tibiaCoinsPrice}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Coins className="w-3 h-3 mr-1" />
                        Tibia Coins
                      </div>
                      <div className="text-xs text-muted-foreground">
                        (${plan.usdPrice} USD)
                      </div>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {plan.duration} days • {plan.worldLimit} world{plan.worldLimit > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full"
                    variant={plan.id === 'basic' ? 'default' : 'outline'}
                  >
                    {subscription?.plan === plan.id.toUpperCase() ? 'Extend Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistory payments={subscription?.recentPayments || []} />
        </TabsContent>
      </Tabs>

      {/* Payment Form Modal/Drawer */}
      {showPaymentForm && selectedPlan && (
        <PaymentForm
          planId={selectedPlan}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setShowPaymentForm(false);
            setSelectedPlan(null);
            fetchSubscriptionData();
          }}
        />
      )}
    </div>
  );
}


