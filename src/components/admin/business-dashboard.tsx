'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Crown,
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Globe,
  Activity,
  Coins,
  Target,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentVerificationPanel from './payment-verification-panel';

interface BusinessMetrics {
  revenue: {
    monthly: number;
    quarterly: number;
    yearly: number;
    growth: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    churn: number;
  };
  subscriptions: {
    active: number;
    pending: number;
    cancelled: number;
    revenue: number;
  };
  payments: {
    pending: number;
    completed: number;
    failed: number;
    totalVolume: number;
  };
}

interface Customer {
  id: string;
  characterName: string;
  guildName: string;
  world: string;
  subscriptionPlan: string;
  status: string;
  revenue: number;
  joinDate: string;
  lastActive: string;
}

interface PendingPayment {
  id: string;
  customerName: string;
  guildName: string;
  amount: number;
  tibiaCoins: number;
  submittedAt: string;
  screenshot?: string;
}

export default function BusinessDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      // Fetch business metrics
      const metricsResponse = await fetch('/api/admin/business-metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch customers
      const customersResponse = await fetch('/api/admin/customers');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData);
      }

      // Fetch pending payments
      const paymentsResponse = await fetch('/api/admin/pending-payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPendingPayments(paymentsData);
      }
    } catch (error) {
      console.error('Failed to fetch business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const currentMetrics = metrics;
  const currentCustomers = customers;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
              <Crown className="w-10 h-10 text-yellow-500" />
              <span>Business Control Center</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Tibia Guild Manager SaaS - Complete business overview
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2">
            Super Admin
          </Badge>
        </div>

        {/* Revenue Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Monthly Revenue</CardTitle>
              <DollarSign className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(currentMetrics?.revenue.monthly || 0)}</div>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                <span>+{currentMetrics?.revenue.growth || 0}% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Customers</CardTitle>
              <Users className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics?.customers.active || 0}</div>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <Target className="h-3 w-3" />
                <span>{currentMetrics?.customers.new || 0} new this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Subscriptions</CardTitle>
              <CreditCard className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics?.subscriptions.active || 0}</div>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <CheckCircle className="h-3 w-3" />
                <span>{currentMetrics?.subscriptions.pending || 0} pending approval</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pending Payments</CardTitle>
              <Clock className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics?.payments.pending || 0}</div>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <AlertTriangle className="h-3 w-3" />
                <span>Require verification</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800">
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <Coins className="w-4 h-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Customer Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your SaaS customers and their subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Guild</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{customer.characterName}</div>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                <span>{customer.world}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{customer.guildName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.subscriptionPlan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', getStatusColor(customer.status))}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(customer.revenue)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(customer.lastActive)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentVerificationPanel />
          </TabsContent>

          <TabsContent value="revenue">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Financial performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(currentMetrics?.revenue.monthly || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Quarterly Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(currentMetrics?.revenue.quarterly || 0)}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Yearly Revenue</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(currentMetrics?.revenue.yearly || 0)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Business growth indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revenue Growth</span>
                      <span className="text-sm font-medium text-green-600">
                        +{currentMetrics?.revenue.growth || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((currentMetrics?.revenue.growth || 0) * 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Customer Retention</span>
                      <span className="text-sm font-medium text-blue-600">
                        {(100 - (currentMetrics?.customers.churn || 0)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${100 - (currentMetrics?.customers.churn || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>System Health & Monitoring</span>
                </CardTitle>
                <CardDescription>
                  Monitor system performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>System monitoring dashboard</p>
                  <p className="text-sm">Server status, API performance, and alerts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
