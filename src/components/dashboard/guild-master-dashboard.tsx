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
  Crown,
  Settings,
  BarChart3,
  Globe,
  Zap,
  Clock,
  TrendingUp,
  UserPlus,
  Target,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface GuildDashboardStats {
  totalMembers: number;
  onlineMembers: number;
  onlineEnemies: number;
  recentDeaths: number;
  pvpDeaths: number;
  pveDeaths: number;
  averageLevel: number;
  highestLevel: number;
}

interface OnlinePlayer {
  id: string;
  name: string;
  level: number;
  vocation: string;
  type: 'GUILD_MEMBER' | 'EXTERNAL_ENEMY' | 'EXTERNAL_FRIEND';
  lastSeen: string;
  isOnline: boolean;
}

interface RecentDeath {
  id: string;
  playerName: string;
  level: number;
  type: 'PVP' | 'PVE';
  killers: string[];
  timestamp: string;
  description: string;
}

interface GuildMasterDashboardProps {
  user: SerializedUserWithRelations;
}

export default function GuildMasterDashboard({ user }: GuildMasterDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<GuildDashboardStats | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [recentDeaths, setRecentDeaths] = useState<RecentDeath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, onlineRes, deathsRes] = await Promise.all([
        fetch('/api/guild/stats'),
        fetch('/api/guild/online-players'),
        fetch('/api/guild/recent-deaths'),
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
        setRecentDeaths(deathsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStats = stats;
  const currentOnline = onlinePlayers;
  const currentDeaths = recentDeaths;

  const StatCard = ({ title, value, icon: Icon, trend, description, color = 'blue' }: any) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}% from yesterday</span>
          </div>
        )}
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
        <div className={cn(
          "w-3 h-3 rounded-full animate-pulse",
          player.isOnline ? "bg-green-500" : "bg-gray-400"
        )} />
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
        {player.type === 'GUILD_MEMBER' ? 'Member' : 'Enemy'}
      </Badge>
    </div>
  );

  const DeathCard = ({ death }: { death: RecentDeath }) => (
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
          <p className="font-medium text-sm">{death.playerName}</p>
          <p className="text-xs text-muted-foreground">
            Level {death.level} • {new Date(death.timestamp).toLocaleDateString()}
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
            <Shield className="w-8 h-8 text-blue-500" />
            <span>Guild Command Center</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.characterName}! Manage your guild and track your enemies.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>{user.guild?.name}</span>
          </Badge>
          <Badge variant="secondary">{user.world}</Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Guild Master
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Guild Members"
          value={currentStats?.totalMembers || 0}
          icon={Users}
          description="Total members in guild"
          color="blue"
        />
        <StatCard
          title="Online Now"
          value={currentStats?.onlineMembers || 0}
          icon={Activity}
          trend={5}
          description="Members currently online"
          color="green"
        />
        <StatCard
          title="Online Enemies"
          value={currentStats?.onlineEnemies || 0}
          icon={Sword}
          description="Enemy players detected"
          color="red"
        />
        <StatCard
          title="Recent Deaths"
          value={currentStats?.recentDeaths || 0}
          icon={AlertTriangle}
          description="Last 24 hours"
          color="orange"
        />
      </div>

      {/* Guild Performance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Guild Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Level</span>
              <span className="font-bold text-lg">{currentStats?.averageLevel || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Highest Level</span>
              <span className="font-bold text-lg text-purple-600">{currentStats?.highestLevel || 0}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>PvP Deaths</span>
                <span className="text-red-600">{currentStats?.pvpDeaths || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>PvE Deaths</span>
                <span className="text-orange-600">{currentStats?.pveDeaths || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Guild Member
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Add Enemy Player
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Create Alert Rule
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Guild Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant="default">Basic</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Worlds</span>
                <span className="font-medium">1 / 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="font-medium">30 days</span>
              </div>
              <Button className="w-full" size="sm">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="enemies">Enemies</TabsTrigger>
          <TabsTrigger value="deaths">Deaths</TabsTrigger>
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
                {currentOnline.slice(0, 5).map((player) => (
                  <OnlinePlayerCard key={player.id} player={player} />
                ))}
                {currentOnline.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All ({currentOnline.length} online)
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Recent Deaths</span>
                </CardTitle>
                <CardDescription>
                  Latest deaths from your guild members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentDeaths.slice(0, 5).map((death) => (
                  <DeathCard key={death.id} death={death} />
                ))}
                {currentDeaths.length > 5 && (
                  <Button variant="outline" size="sm" className="w-full">
                    View All Deaths
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Guild Members</CardTitle>
              <CardDescription>
                Manage and monitor your guild members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Guild members page coming soon</p>
                <p className="text-sm">Complete member management interface</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enemies">
          <Card>
            <CardHeader>
              <CardTitle>Enemy Tracking</CardTitle>
              <CardDescription>
                Monitor enemy guilds and players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Sword className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enemy tracking page coming soon</p>
                <p className="text-sm">Advanced enemy monitoring tools</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deaths">
          <Card>
            <CardHeader>
              <CardTitle>Death Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of guild member deaths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Death analysis page coming soon</p>
                <p className="text-sm">PvP/PvE statistics and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
