'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Skull,
  TrendingDown,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  BarChart3,
  Users,
  Sword,
  Shield,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface Death {
  id: string;
  playerName: string;
  level: number;
  type: 'PVP' | 'PVE';
  killers: string[];
  timestamp: string;
  description: string;
  guild: string;
}

interface DeathStats {
  totalDeaths: number;
  pvpDeaths: number;
  pveDeaths: number;
  averageLevel: number;
  topKillers: Array<{
    name: string;
    kills: number;
  }>;
  deathsByDay: Array<{
    date: string;
    pvp: number;
    pve: number;
  }>;
}

interface DeathAnalysisPageProps {
  user: SerializedUserWithRelations;
}

export default function DeathAnalysisPage({ user }: DeathAnalysisPageProps) {
  const [deaths, setDeaths] = useState<Death[]>([]);
  const [stats, setStats] = useState<DeathStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'PVP' | 'PVE'>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchDeathData();
  }, [timeRange]);

  const fetchDeathData = async () => {
    try {
      setLoading(true);
      const [deathsRes, statsRes] = await Promise.all([
        fetch(`/api/guild/deaths?range=${timeRange}`),
        fetch(`/api/guild/death-stats?range=${timeRange}`),
      ]);

      if (deathsRes.ok) {
        const deathsData = await deathsRes.json();
        setDeaths(deathsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch death data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeaths = deaths.filter(death => {
    const matchesSearch = searchTerm === '' || 
      death.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      death.killers.some(killer => killer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || death.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PVP':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PVE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeRange = (range: string) => {
    switch (range) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Last 7 Days';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            <Skull className="w-8 h-8 text-red-500" />
            <span>Death Analysis</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze guild member deaths and PvP statistics for {user.guild?.name}
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d' | 'all') => setTimeRange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deaths</CardTitle>
              <Skull className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalDeaths}</div>
              <p className="text-xs text-muted-foreground">
                {formatTimeRange(timeRange)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PvP Deaths</CardTitle>
              <Sword className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pvpDeaths}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDeaths > 0 ? Math.round((stats.pvpDeaths / stats.totalDeaths) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PvE Deaths</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pveDeaths}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDeaths > 0 ? Math.round((stats.pveDeaths / stats.totalDeaths) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Level</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.averageLevel)}</div>
              <p className="text-xs text-muted-foreground">
                Death level average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="deaths" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deaths">Recent Deaths</TabsTrigger>
          <TabsTrigger value="killers">Top Killers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="deaths">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Recent Deaths</span>
              </CardTitle>
              <CardDescription>
                Detailed list of guild member deaths
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by player or killer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === 'PVP' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('PVP')}
                  >
                    PvP
                  </Button>
                  <Button
                    variant={filterType === 'PVE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('PVE')}
                  >
                    PvE
                  </Button>
                </div>
              </div>

              {/* Deaths Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Killers</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeaths.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {deaths.length === 0 ? 'No deaths recorded' : 'No deaths match your search'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeaths.map((death) => (
                        <TableRow key={death.id}>
                          <TableCell>
                            <div className="font-medium">{death.playerName}</div>
                            <div className="text-sm text-muted-foreground">{death.guild}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">{death.level}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', getTypeColor(death.type))}>
                              {death.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {death.killers.length > 0 ? (
                                <div className="space-y-1">
                                  {death.killers.slice(0, 3).map((killer, idx) => (
                                    <div key={idx} className="text-sm">
                                      {killer}
                                    </div>
                                  ))}
                                  {death.killers.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{death.killers.length - 3} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Unknown</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(death.timestamp)}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="killers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sword className="w-5 h-5 text-red-500" />
                <span>Top Killers</span>
              </CardTitle>
              <CardDescription>
                Players who have killed the most guild members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topKillers && stats.topKillers.length > 0 ? (
                <div className="space-y-4">
                  {stats.topKillers.map((killer, index) => (
                    <div key={killer.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                        </div>
                        <span className="font-medium">{killer.name}</span>
                      </div>
                      <Badge variant="destructive">
                        {killer.kills} kills
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sword className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No killer data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Death Trends</span>
              </CardTitle>
              <CardDescription>
                Death patterns and trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Trend charts coming soon</p>
                <p className="text-sm">Visual analytics and patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

