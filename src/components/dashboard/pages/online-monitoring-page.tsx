'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Users,
  Sword,
  Settings,
  Plus,
  RefreshCw,
  Filter,
  Search,
  Crown,
  Shield,
  Wand2,
  Zap,
  Target,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface OnlinePlayer {
  id: string;
  name: string;
  level: number;
  vocation: string;
  type: 'GUILD_MEMBER' | 'EXTERNAL_ALLY' | 'EXTERNAL_ENEMY';
  guild: string;
  lastSeen: string;
  category?: string;
  isOnline: boolean;
}

interface LevelCategory {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  priority: number;
}

interface OnlineMonitoringPageProps {
  user: SerializedUserWithRelations;
}

const DEFAULT_CATEGORIES: LevelCategory[] = [
  { id: '1', name: 'Makers', minLevel: 50, maxLevel: 250, color: 'blue', priority: 1 },
  { id: '2', name: 'Bombs', minLevel: 400, maxLevel: 600, color: 'orange', priority: 2 },
  { id: '3', name: 'Mains', minLevel: 700, maxLevel: 9999, color: 'purple', priority: 3 },
  { id: '4', name: 'Others', minLevel: 0, maxLevel: 49, color: 'gray', priority: 4 },
];

const VOCATION_ORDER = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer'];
const VOCATION_ICONS: Record<string, any> = {
  'Elite Knight': Crown,
  'Royal Paladin': Target,
  'Elder Druid': Shield,
  'Master Sorcerer': Wand2,
};

export default function OnlineMonitoringPage({ user }: OnlineMonitoringPageProps) {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [categories, setCategories] = useState<LevelCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allies' | 'enemies'>('allies');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryMin, setNewCategoryMin] = useState('');
  const [newCategoryMax, setNewCategoryMax] = useState('');

  useEffect(() => {
    fetchOnlinePlayers();
    
    if (autoRefresh) {
      const interval = setInterval(fetchOnlinePlayers, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOnlinePlayers = async () => {
    try {
      const response = await fetch('/api/guild/online-monitoring');
      if (response.ok) {
        const data = await response.json();
        setOnlinePlayers(data);
      }
    } catch (error) {
      console.error('Failed to fetch online players:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorizePlayer = (player: OnlinePlayer): string => {
    for (const category of categories.sort((a, b) => a.priority - b.priority)) {
      if (player.level >= category.minLevel && player.level <= category.maxLevel) {
        return category.name;
      }
    }
    return 'Uncategorized';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GUILD_MEMBER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EXTERNAL_ALLY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'EXTERNAL_ENEMY':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category.color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getVocationIcon = (vocation: string) => {
    const Icon = VOCATION_ICONS[vocation] || Users;
    return <Icon className="w-4 h-4" />;
  };

  const addCategory = () => {
    if (!newCategoryName || !newCategoryMin || !newCategoryMax) return;

    const newCategory: LevelCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      minLevel: parseInt(newCategoryMin),
      maxLevel: parseInt(newCategoryMax),
      color: 'blue',
      priority: categories.length + 1,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryMin('');
    setNewCategoryMax('');
  };

  // Filter players
  const filteredPlayers = onlinePlayers.filter(player => {
    const matchesSearch = searchTerm === '' || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.guild.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' ||
      (filterType === 'allies' && player.type === 'EXTERNAL_ALLY') ||
      (filterType === 'enemies' && player.type === 'EXTERNAL_ENEMY');

    return matchesSearch && matchesType;
  });

  // Group by category and vocation
  const groupedPlayers = categories.reduce((acc, category) => {
    const categoryPlayers = filteredPlayers
      .filter(player => categorizePlayer(player) === category.name)
      .sort((a, b) => {
        // Sort by vocation order first, then by level desc
        const vocA = VOCATION_ORDER.indexOf(a.vocation);
        const vocB = VOCATION_ORDER.indexOf(b.vocation);
        if (vocA !== vocB) return vocA - vocB;
        return b.level - a.level;
      });

    if (categoryPlayers.length > 0) {
      acc[category.name] = categoryPlayers;
    }
    return acc;
  }, {} as Record<string, OnlinePlayer[]>);

  const totalOnline = filteredPlayers.length;
  const guildOnline = filteredPlayers.filter(p => p.type === 'GUILD_MEMBER').length;
  const alliesOnline = filteredPlayers.filter(p => p.type === 'EXTERNAL_ALLY').length;
  const enemiesOnline = filteredPlayers.filter(p => p.type === 'EXTERNAL_ENEMY').length;

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
            <Activity className="w-8 h-8 text-green-500" />
            <span>Online Monitoring</span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of {user.world} - Last update: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
            Auto Refresh
          </Button>
          <Button onClick={fetchOnlinePlayers} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
          {user.role === 'GUILD_ADMIN' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Level Categories</DialogTitle>
                  <DialogDescription>
                    Create custom level categories for better organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2 grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Min Level</Label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={newCategoryMin}
                        onChange={(e) => setNewCategoryMin(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Max Level</Label>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={newCategoryMax}
                        onChange={(e) => setNewCategoryMax(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={addCategory} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalOnline}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allied Players</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{guildOnline}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allies</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alliesOnline}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enemies</CardTitle>
            <Sword className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{enemiesOnline}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players or guilds..."
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
                variant={filterType === 'allies' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('allies')}
              >
                Allies
              </Button>
              <Button
                variant={filterType === 'enemies' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilterType('enemies')}
              >
                Enemies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Players by Category */}
      <div className="space-y-6">
        {Object.entries(groupedPlayers).map(([categoryName, players]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className={cn('text-sm', getCategoryColor(categoryName))}>
                  {categoryName}
                </Badge>
                <span className="text-lg">({players.length} online)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Character</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Vocation</TableHead>
                      <TableHead>Guild</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-mono text-sm">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold">{player.level}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getVocationIcon(player.vocation)}
                            <span className="text-sm">{player.vocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{player.guild}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', getTypeColor(player.type))}>
                            {player.type === 'GUILD_MEMBER' ? 'Member' :
                             player.type === 'EXTERNAL_ALLY' ? 'Ally' : 'Enemy'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalOnline === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No players online
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No players are currently online in {user.world}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

