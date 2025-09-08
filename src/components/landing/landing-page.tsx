'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedThemeToggle } from '@/components/ui/theme-toggle';
import {
  Shield,
  Sword,
  Users,
  Bell,
  Eye,
  Zap,
  Crown,
  Target,
  Activity,
  Globe,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Eye,
    title: 'Real-time Player Tracking',
    description: 'Monitor guild members and enemies across all worlds with instant online status updates.',
  },
  {
    icon: Bell,
    title: 'Death Notifications',
    description: 'Instant alerts for PvP deaths, PvE deaths, and customizable notification rules.',
  },
  {
    icon: Target,
    title: 'Enemy Monitoring',
    description: 'Track enemy guilds, get alerts when they come online, and never miss a hunt.',
  },
  {
    icon: Activity,
    title: 'Advanced Analytics',
    description: 'Detailed statistics, death analysis, and guild performance insights.',
  },
  {
    icon: Shield,
    title: 'Multi-Guild Support',
    description: 'Manage main guilds and academy guilds from a single dashboard.',
  },
  {
    icon: Globe,
    title: 'Multi-World Coverage',
    description: 'Monitor players across multiple Tibia worlds with flexible subscription plans.',
  },
];

const pricing = [
  {
    name: 'Basic',
    price: '$20',
    period: '/month',
    tibiaCoins: '750 TC',
    description: 'Perfect for single guild monitoring',
    features: [
      '1 World monitoring',
      'Unlimited guild members',
      'Real-time notifications',
      'Death tracking (PvP/PvE)',
      'Enemy guild monitoring',
      'Mobile app access',
    ],
    popular: false,
  },
  {
    name: 'Extended',
    price: '$20',
    period: '/additional world',
    tibiaCoins: '750 TC each',
    description: 'Scale across multiple worlds',
    features: [
      'Add unlimited worlds',
      'All Basic features',
      'Advanced analytics',
      'Priority support',
      'Custom alert rules',
      'API access',
    ],
    popular: true,
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sword className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Tibia Guild Manager
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <AnimatedThemeToggle />
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            🎮 Built for the Tibia Community
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Professional Guild
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Management</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor your guild members, track enemies, and receive instant death notifications 
            with our powerful real-time Tibia guild management platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg">
                Start Managing Your Guild
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Everything You Need for Guild Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for Tibia guild leaders and members
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Pay with USD or Tibia Coins - your choice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricing.map((plan, index) => (
            <Card key={index} className={`relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {plan.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    or {plan.tibiaCoins}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-200/20 dark:border-blue-700/20">
          <CardContent className="text-center py-16 px-8">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Dominate Your Server?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of guild leaders who trust Tibia Guild Manager 
              to stay ahead of the competition.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-lg">
                Start Your Free Trial
                <Zap className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sword className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Tibia Guild Manager
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 Tibia Guild Manager. Built with ❤️ for the Tibia community.
          </p>
        </div>
      </footer>
    </div>
  );
}
