'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Sword,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  TrendingUp,
  Clock,
  Crown,
  Zap,
} from 'lucide-react';
import { DashboardStats } from '@/types';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface DashboardOverviewProps {
  user: SerializedUserWithRelations;
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
          <span className={cn(
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-red-500'
          )}>
            {change}
          </span>
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const OnlinePlayerCard = ({ player }: { player: any }) => (
  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <div>
        <p className="font-medium text-sm">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          Level {player.level} {player.vocation}
        </p>
      </div>
    </div>
    <Badge variant="outline" className="text-xs">
      {player.type === 'GUILD_MEMBER' ? 'Member' : 'Enemy'}
    </Badge>
  </div>
);

const RecentDeathCard = ({ death }: { death: any }) => (
  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
    <div className="flex items-center space-x-3">
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <div>
        <p className="font-medium text-sm">{death.player.name}</p>
        <p className="text-xs text-muted-foreground">
          Level {death.level} • {death.type === 'PVP' ? 'PvP Death' : 'PvE Death'}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs text-muted-foreground">
        {new Date(death.timestamp).toLocaleDateString()}
      </p>
      <Badge variant={death.type === 'PVP' ? 'destructive' : 'secondary'} className="text-xs">
        {death.type}
      </Badge>
    </div>
  </div>
);

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [recentDeaths, setRecentDeaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch online players
      const onlineResponse = await fetch('/api/dashboard/online-players');
      if (onlineResponse.ok) {
        const onlineData = await onlineResponse.json();
        setOnlinePlayers(onlineData.slice(0, 10)); // Show top 10
      }

      // Fetch recent deaths
      const deathsResponse = await fetch('/api/dashboard/recent-deaths');
      if (deathsResponse.ok) {
        const deathsData = await deathsResponse.json();
        setRecentDeaths(deathsData.slice(0, 10)); // Show recent 10
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const currentStats = stats;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.characterName}!
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No statistics available yet.</p>
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.characterName}! Here's your guild overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>{user.guild?.name}</span>
          </Badge>
          <Badge variant="secondary">
            {user.world}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={currentStats.totalPlayers}
          icon={Users}
          description="Guild members being tracked"
        />
        <StatCard
          title="Online Now"
          value={currentStats.onlinePlayers}
          change="+2 from yesterday"
          trend="up"
          icon={Activity}
          description="Members currently online"
        />
        <StatCard
          title="Online Enemies"
          value={currentStats.onlineEnemies}
          icon={Sword}
          description="Enemy players online"
        />
        <StatCard
          title="Recent Deaths"
          value={currentStats.recentDeaths}
          change="Last 24 hours"
          icon={AlertTriangle}
          description="PvP and PvE deaths tracked"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="online">Online Monitor</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Recent Deaths</span>
                </CardTitle>
                <CardDescription>
                  Latest PvP and PvE deaths from your guild
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentDeaths.length > 0 ? (
                  recentDeaths.map((death, index) => (
                    <RecentDeathCard key={index} death={death} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent deaths recorded</p>
                    <p className="text-sm">Your guild members are safe!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>Guild Activity</span>
                </CardTitle>
                <CardDescription>
                  Recent member activity and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Activity feed coming soon</p>
                  <p className="text-sm">Level ups, logins, and more</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span>Online Players</span>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of online guild members and enemies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {onlinePlayers.length > 0 ? (
                onlinePlayers.map((player, index) => (
                  <OnlinePlayerCard key={index} player={player} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No online players detected</p>
                  <p className="text-sm">Check back in a few moments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Active Alerts</span>
              </CardTitle>
              <CardDescription>
                Current alert rules and recent notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
                <p className="text-sm">Configure alerts to get notified</p>
                <Button className="mt-4" variant="outline" size="sm">
                  Setup Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
