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
  Sword,
  UserX,
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  Clock,
  Target,
  Skull,
  RefreshCw,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface EnemyPlayer {
  id: string;
  name: string;
  level: number;
  vocation: string;
  guild: string;
  status: 'online' | 'offline';
  lastSeen: string;
  kills24h: number;
  deaths24h: number;
  threat: 'high' | 'medium' | 'low';
  addedDate: string;
  isActive: boolean;
}

interface EnemyTrackingPageProps {
  user: SerializedUserWithRelations;
}

export default function EnemyTrackingPage({ user }: EnemyTrackingPageProps) {
  const [enemies, setEnemies] = useState<EnemyPlayer[]>([]);
  const [filteredEnemies, setFilteredEnemies] = useState<EnemyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [filterThreat, setFilterThreat] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchEnemyPlayers();
  }, []);

  useEffect(() => {
    filterEnemies();
  }, [enemies, searchTerm, filterStatus, filterThreat]);

  const fetchEnemyPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guild/enemies');
      if (response.ok) {
        const data = await response.json();
        setEnemies(data);
      }
    } catch (error) {
      console.error('Failed to fetch enemy players:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllGuilds = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/guild/sync-all', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Sync completed:', result);
        // Refresh enemy data after sync
        await fetchEnemyPlayers();
      } else {
        console.error('Sync failed:', await response.text());
      }
    } catch (error) {
      console.error('Failed to sync guilds:', error);
    } finally {
      setSyncing(false);
    }
  };

  const filterEnemies = () => {
    let filtered = enemies;

    if (searchTerm) {
      filtered = filtered.filter(enemy =>
        enemy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enemy.guild.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enemy.vocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(enemy => enemy.status === filterStatus);
    }

    if (filterThreat !== 'all') {
      filtered = filtered.filter(enemy => enemy.threat === filterThreat);
    }

    setFilteredEnemies(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
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
            <Sword className="w-8 h-8 text-red-500" />
            <span>Enemy Tracking</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor enemy guilds and players from configured enemy guilds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={syncAllGuilds}
            disabled={syncing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
            <span>{syncing ? 'Syncing...' : 'Sync Guilds'}</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700">
                <UserX className="w-4 h-4" />
                <span>Add Enemy</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Enemy Player</DialogTitle>
                <DialogDescription>
                  Add a new enemy player to track their activity.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="enemyName">Character Name</Label>
                  <Input id="enemyName" placeholder="Enter enemy character name" />
                </div>
                <div>
                  <Label htmlFor="enemyGuild">Guild Name (Optional)</Label>
                  <Input id="enemyGuild" placeholder="Enter enemy guild name" />
                </div>
                <div>
                  <Label htmlFor="threatLevel">Threat Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select threat level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Threat</SelectItem>
                      <SelectItem value="medium">Medium Threat</SelectItem>
                      <SelectItem value="low">Low Threat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">Add Enemy</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enemies</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{enemies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Enemies</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enemies.filter(e => e.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enemies.filter(e => e.threat === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Kills</CardTitle>
            <Skull className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {enemies.reduce((sum, e) => sum + e.kills24h, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Enemy Management</CardTitle>
          <CardDescription>
            Search, filter, and monitor enemy players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enemies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'online' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('online')}
              >
                Online
              </Button>
              <Button
                variant={filterThreat === 'high' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilterThreat(filterThreat === 'high' ? 'all' : 'high')}
              >
                High Threat
              </Button>
            </div>
          </div>

          {/* Enemies Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Character</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Guild</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Kills (24h)</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnemies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {enemies.length === 0 ? (
                        <div className="space-y-2">
                          <p>No enemy players found</p>
                          <p className="text-sm">Configure enemy guilds in Settings and sync to populate data</p>
                        </div>
                      ) : (
                        'No enemies match your search'
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnemies.map((enemy) => (
                    <TableRow key={enemy.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Sword className="w-4 h-4 text-red-500" />
                          <span className="font-medium">{enemy.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{enemy.level}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{enemy.guild || 'Unknown'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            enemy.status === 'online' ? "bg-red-500 animate-pulse" : "bg-gray-400"
                          )} />
                          <Badge className={cn('text-xs', getStatusColor(enemy.status))}>
                            {enemy.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getThreatColor(enemy.threat))}>
                          {enemy.threat}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {enemy.kills24h > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {enemy.kills24h}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatLastSeen(enemy.lastSeen)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

