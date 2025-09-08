'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  Settings,
  BarChart3,
  Globe,
  Clock,
  TrendingUp,
  User,
  Bell,
  Calendar,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface GuildMemberStats {
  guildMembersOnline: number;
  enemiesOnline: number;
  myRecentDeaths: number;
  guildRecentDeaths: number;
}

interface OnlinePlayer {
  id: string;
  name: string;
  level: number;
  vocation: string;
  type: 'GUILD_MEMBER' | 'EXTERNAL_ENEMY';
  isOnline: boolean;
}

interface MyDeath {
  id: string;
  level: number;
  type: 'PVP' | 'PVE';
  killers: string[];
  timestamp: string;
  description: string;
}

interface GuildMemberDashboardProps {
  user: SerializedUserWithRelations;
}

export default function GuildMemberDashboard({ user }: GuildMemberDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<GuildMemberStats | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [myDeaths, setMyDeaths] = useState<MyDeath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchMemberData, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const fetchMemberData = async () => {
    try {
      const [statsRes, onlineRes, deathsRes] = await Promise.all([
        fetch('/api/guild/member-stats'),
        fetch('/api/guild/online-players'),
        fetch('/api/guild/my-deaths'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (onlineRes.ok) {
        const onlineData = await onlineRes.json();
        setOnlinePlayers(onlineData);
      }

      if (deathsRes.ok) {
        const deathsData = await deathsRes.json();
        setMyDeaths(deathsData);
      }
    } catch (error) {
      console.error('Failed to fetch member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStats = stats;
  const currentOnline = onlinePlayers;
  const currentMyDeaths = myDeaths;

  const StatCard = ({ title, value, icon: Icon, description, color = 'blue' }: any) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const OnlinePlayerCard = ({ player }: { player: OnlinePlayer }) => (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      player.type === 'GUILD_MEMBER' 
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    )}>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <div>
          <p className="font-medium text-sm">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            Level {player.level} {player.vocation}
          </p>
        </div>
      </div>
      <Badge variant="outline" className={cn(
        "text-xs",
        player.type === 'GUILD_MEMBER' ? "text-green-700" : "text-red-700"
      )}>
        {player.type === 'GUILD_MEMBER' ? 'Guild' : 'Enemy'}
      </Badge>
    </div>
  );

  const DeathCard = ({ death }: { death: MyDeath }) => (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      death.type === 'PVP' 
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
    )}>
      <div className="flex items-center space-x-3">
        <AlertTriangle className={cn(
          "w-4 h-4",
          death.type === 'PVP' ? "text-red-500" : "text-orange-500"
        )} />
        <div>
          <p className="font-medium text-sm">Level {death.level}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(death.timestamp).toLocaleDateString()} • {death.killers.join(', ')}
          </p>
        </div>
      </div>
      <Badge variant={death.type === 'PVP' ? 'destructive' : 'secondary'} className="text-xs">
        {death.type}
      </Badge>
    </div>
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <User className="w-8 h-8 text-green-500" />
            <span>Guild Member Portal</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.characterName}! Stay updated with your guild activities.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>{user.guild?.name}</span>
          </Badge>
          <Badge variant="secondary">{user.world}</Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Member
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Guild Online"
          value={currentStats?.guildMembersOnline || 0}
          icon={Users}
          description="Guild members online now"
          color="green"
        />
        <StatCard
          title="Enemies Online"
          value={currentStats?.enemiesOnline || 0}
          icon={Sword}
          description="Enemy players detected"
          color="red"
        />
        <StatCard
          title="My Deaths"
          value={currentStats?.myRecentDeaths || 0}
          icon={AlertTriangle}
          description="Last 7 days"
          color="orange"
        />
        <StatCard
          title="Guild Deaths"
          value={currentStats?.guildRecentDeaths || 0}
          icon={Activity}
          description="Guild deaths today"
          color="blue"
        />
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>My Character</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Character</span>
              <span className="font-medium">{user.characterName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">World</span>
              <span className="font-medium">{user.world}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Guild</span>
              <span className="font-medium">{user.guild?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="font-medium text-sm">
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No new notifications</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="font-medium text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Deaths</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Alerts Set</span>
              <span className="font-medium">-</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deaths">My Deaths</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span>Online Players</span>
                </CardTitle>
                <CardDescription>
                  Guild members and enemies currently online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentOnline.slice(0, 6).map((player) => (
                  <OnlinePlayerCard key={player.id} player={player} />
                ))}
                {currentOnline.length > 6 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All ({currentOnline.length} online)
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span>Guild Activity</span>
                </CardTitle>
                <CardDescription>
                  Recent guild member activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Activity feed coming soon</p>
                  <p className="text-sm">Member logins, deaths, and updates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deaths">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>My Death History</span>
              </CardTitle>
              <CardDescription>
                Your recent deaths and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentMyDeaths.length > 0 ? (
                currentMyDeaths.map((death) => (
                  <DeathCard key={death.id} death={death} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p>No recent deaths</p>
                  <p className="text-sm">Stay safe out there!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                <span>Alert Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Alert management coming soon</p>
                <p className="text-sm">Custom notifications for enemies, deaths, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
