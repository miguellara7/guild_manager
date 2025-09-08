'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Crown,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import BusinessDashboard from './business-dashboard';

interface AdminStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  monthlyRevenue: number;
  conversionRate: number;
  recentPayments: any[];
}

export default function AdminDashboard() {
  return <BusinessDashboard />;
}


