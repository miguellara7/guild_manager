'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Settings,
  Globe,
  Plus,
  Trash2,
  Shield,
  Sword,
  Users,
  AlertTriangle,
  Check,
  X,
  Search,
} from 'lucide-react';
import { SerializedUserWithRelations } from '@/lib/serialization';
import { cn } from '@/lib/utils';

interface WorldSubscription {
  id: string;
  world: string;
  isActive: boolean;
  maxGuilds: number;
  guildCount: number;
  createdAt: string;
}

interface GuildConfiguration {
  id: string;
  worldSubscriptionId: string;
  world: string;
  guildName: string;
  type: 'MAIN' | 'ALLY' | 'ENEMY';
  priority: number;
  isActive: boolean;
  playerCount: number;
  lastSync: string;
}

interface GuildSettingsPageProps {
  user: SerializedUserWithRelations;
}

export default function GuildSettingsPage({ user }: GuildSettingsPageProps) {
  const [worldSubscriptions, setWorldSubscriptions] = useState<WorldSubscription[]>([]);
  const [guildConfigurations, setGuildConfigurations] = useState<GuildConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWorldName, setNewWorldName] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [selectedWorld, setSelectedWorld] = useState('');
  const [selectedGuildType, setSelectedGuildType] = useState<'MAIN' | 'ALLY' | 'ENEMY'>('ALLY');
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [worldValidation, setWorldValidation] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [worldsRes, guildsRes] = await Promise.all([
        fetch('/api/guild/world-subscriptions'),
        fetch('/api/guild/guild-configurations'),
      ]);

      if (worldsRes.ok) {
        const worldsData = await worldsRes.json();
        setWorldSubscriptions(worldsData);
      }

      if (guildsRes.ok) {
        const guildsData = await guildsRes.json();
        setGuildConfigurations(guildsData);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateWorldName = async (worldName: string) => {
    if (!worldName.trim()) return;

    try {
      const response = await fetch(`/api/guild/validate-world?world=${encodeURIComponent(worldName.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setWorldValidation(prev => ({
          ...prev,
          [worldName.trim()]: data.valid
        }));
      }
    } catch (error) {
      console.error('Failed to validate world:', error);
      setWorldValidation(prev => ({
        ...prev,
        [worldName.trim()]: false
      }));
    }
  };

  const addWorldSubscription = async () => {
    if (!newWorldName.trim()) return;

    // Validate world first
    await validateWorldName(newWorldName.trim());
    
    const isValid = worldValidation[newWorldName.trim()];
    if (isValid === false) {
      alert('World not found in Tibia. Please check the world name.');
      return;
    }

    try {
      const response = await fetch('/api/guild/world-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ world: newWorldName.trim() }),
      });

      if (response.ok) {
        setNewWorldName('');
        setWorldValidation({});
        fetchSettings();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add world');
      }
    } catch (error) {
      console.error('Failed to add world:', error);
      alert('Failed to add world');
    }
  };

  const searchGuilds = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const selectedWorldData = worldSubscriptions.find(w => w.id === selectedWorld);
    if (!selectedWorldData) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/guild/search-guilds?q=${encodeURIComponent(query)}&world=${encodeURIComponent(selectedWorldData.world)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Failed to search guilds:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const addGuildConfiguration = async () => {
    if (!newGuildName.trim() || !selectedWorld) return;

    try {
      const response = await fetch('/api/guild/guild-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldSubscriptionId: selectedWorld,
          guildName: newGuildName.trim(),
          type: selectedGuildType,
        }),
      });

      if (response.ok) {
        setNewGuildName('');
        setSelectedWorld('');
        setSelectedGuildType('ALLY');
        setGuildSearchQuery('');
        setSearchResults([]);
        fetchSettings();
      } else {
        const errorData = await response.json();
        console.error('Failed to add guild:', errorData.error);
      }
    } catch (error) {
      console.error('Failed to add guild:', error);
    }
  };

  const selectGuildFromSearch = (guild: any) => {
    setNewGuildName(guild.name);
    setGuildSearchQuery(guild.name);
    setSearchResults([]);
  };

  const toggleWorldStatus = async (worldId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/guild/world-subscriptions/${worldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchSettings();
      }
    } catch (error) {
      console.error('Failed to toggle world status:', error);
    }
  };

  const toggleGuildStatus = async (guildId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/guild/guild-configurations/${guildId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchSettings();
      }
    } catch (error) {
      console.error('Failed to toggle guild status:', error);
    }
  };

  const deleteGuildConfiguration = async (guildId: string, guildName: string) => {
    if (!confirm(`Are you sure you want to delete ${guildName}? This will remove all guild members and cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/guild/guild-configurations/${guildId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSettings();
      } else {
        const error = await response.json();
        console.error('Failed to delete guild:', error.error);
      }
    } catch (error) {
      console.error('Failed to delete guild:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MAIN':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'ALLY':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'ENEMY':
        return <Sword className="w-4 h-4 text-red-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ALLY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ENEMY':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
            <Settings className="w-8 h-8 text-blue-500" />
            <span>Guild Settings</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your worlds and guild tracking settings
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {user.subscription?.plan || 'Basic'}
            </Badge>
            <span>Subscription Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Worlds Allowed</p>
              <p className="text-2xl font-bold">
                {worldSubscriptions.filter(w => w.isActive).length} / {user.subscription?.worldLimit || 1}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guilds Tracked</p>
              <p className="text-2xl font-bold">
                {guildConfigurations.filter(g => g.isActive).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {user.subscription?.status || 'Active'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="worlds" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="worlds">World Management</TabsTrigger>
          <TabsTrigger value="guilds">Guild Tracking</TabsTrigger>
          <TabsTrigger value="passwords">Guild Passwords</TabsTrigger>
        </TabsList>

        <TabsContent value="worlds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>World Subscriptions</span>
              </CardTitle>
              <CardDescription>
                Manage the Tibia worlds you want to monitor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add World Form */}
              <div className="space-y-2">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="newWorld">World Name</Label>
                    <div className="relative">
                      <Input
                        id="newWorld"
                        placeholder="e.g., Antica, Refugia, Quintera"
                        value={newWorldName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewWorldName(value);
                          if (value.trim().length > 2) {
                            validateWorldName(value.trim());
                          }
                        }}
                        className={cn(
                          worldValidation[newWorldName.trim()] === false && 'border-red-500',
                          worldValidation[newWorldName.trim()] === true && 'border-green-500'
                        )}
                      />
                      {worldValidation[newWorldName.trim()] === true && (
                        <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                      )}
                      {worldValidation[newWorldName.trim()] === false && (
                        <X className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={addWorldSubscription}
                    disabled={!newWorldName.trim() || worldSubscriptions.length >= (user.subscription?.worldLimit || 1) || worldValidation[newWorldName.trim()] === false}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add World
                  </Button>
                </div>
                {worldValidation[newWorldName.trim()] === false && (
                  <p className="text-sm text-red-600">
                    World &quot;{newWorldName.trim()}&quot; not found in Tibia. Please check the spelling.
                  </p>
                )}
                {worldValidation[newWorldName.trim()] === true && (
                  <p className="text-sm text-green-600">
                    ✓ World &quot;{newWorldName.trim()}&quot; found in Tibia
                  </p>
                )}
              </div>

              {/* Worlds Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>World</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Guilds</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worldSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No worlds configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      worldSubscriptions.map((world) => (
                        <TableRow key={world.id}>
                          <TableCell className="font-medium">{world.world}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              'text-xs',
                              world.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            )}>
                              {world.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {world.guildCount} / {world.maxGuilds}
                          </TableCell>
                          <TableCell>
                            {new Date(world.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWorldStatus(world.id, world.isActive)}
                            >
                              {world.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
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
        </TabsContent>

        <TabsContent value="guilds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>Guild Configurations</span>
              </CardTitle>
              <CardDescription>
                Configure which guilds to track as allies or enemies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Guild Form */}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="guildWorld">World</Label>
                  <Select value={selectedWorld} onValueChange={setSelectedWorld}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select world" />
                    </SelectTrigger>
                    <SelectContent>
                      {worldSubscriptions.filter(w => w.isActive).map((world) => (
                        <SelectItem key={world.id} value={world.id}>
                          {world.world}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="guildName">Guild Name</Label>
                  <div className="relative">
                    <Input
                      id="guildName"
                      placeholder="Search or type guild name"
                      value={guildSearchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setGuildSearchQuery(value);
                        setNewGuildName(value);
                        if (selectedWorld) {
                          searchGuilds(value);
                        }
                      }}
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((guild) => (
                        <div
                          key={guild.id}
                          className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onClick={() => selectGuildFromSearch(guild)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{guild.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {guild.description && guild.description !== 'No description available' ? 
                                  guild.description.substring(0, 60) + (guild.description.length > 60 ? '...' : '') :
                                  'No description'
                                }
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                📍 {guild.world} • 👥 {guild.memberCount || 0} members
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              TibiaData
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchLoading && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground">Searching...</div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="guildType">Type</Label>
                  <Select value={selectedGuildType} onValueChange={(value: 'MAIN' | 'ALLY' | 'ENEMY') => setSelectedGuildType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">Main Guild</SelectItem>
                      <SelectItem value="ALLY">Allied Guild</SelectItem>
                      <SelectItem value="ENEMY">Enemy Guild</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addGuildConfiguration}
                    disabled={!newGuildName.trim() || !selectedWorld}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guild
                  </Button>
                </div>
              </div>

              {/* Guilds Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guild</TableHead>
                      <TableHead>World</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Players</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guildConfigurations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No guild configurations
                        </TableCell>
                      </TableRow>
                    ) : (
                      guildConfigurations.map((guild) => (
                        <TableRow key={guild.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(guild.type)}
                              <span className="font-medium">{guild.guildName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{guild.world}</TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', getTypeColor(guild.type))}>
                              {guild.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              'text-xs',
                              guild.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            )}>
                              {guild.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{guild.playerCount}</TableCell>
                          <TableCell>
                            {new Date(guild.lastSync).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleGuildStatus(guild.id, guild.isActive)}
                                title={guild.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {guild.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteGuildConfiguration(guild.id, guild.guildName)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete guild configuration"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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

        <TabsContent value="passwords">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>Guild Password Management</span>
              </CardTitle>
              <CardDescription>
                Set passwords for your guilds to allow member access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GuildPasswordManager guildConfigurations={guildConfigurations} onPasswordUpdate={fetchSettings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Guild Password Manager Component
function GuildPasswordManager({ guildConfigurations, onPasswordUpdate }: {
  guildConfigurations: GuildConfiguration[];
  onPasswordUpdate: () => void;
}) {
  const [passwords, setPasswords] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [updating, setUpdating] = useState<{[key: string]: boolean}>({});

  const handlePasswordUpdate = async (guildId: string, guildName: string, password: string) => {
    if (!password.trim()) {
      alert('Password cannot be empty');
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [guildId]: true }));
      
      const response = await fetch('/api/guild/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, password }),
      });

      if (response.ok) {
        alert(`Password updated for ${guildName}`);
        setPasswords(prev => ({ ...prev, [guildId]: '' }));
        onPasswordUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to update password: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setUpdating(prev => ({ ...prev, [guildId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Guild Password Security</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Guild passwords allow members of tracked guilds to login using their character name. 
              Set strong passwords and share them securely with your guild members.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {guildConfigurations.map((guild) => (
          <Card key={guild.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{guild.guildName}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>World: {guild.world}</span>
                    <Badge variant={guild.type === 'ALLY' ? 'default' : guild.type === 'ENEMY' ? 'destructive' : 'secondary'}>
                      {guild.type}
                    </Badge>
                    <span>{guild.playerCount} members</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 min-w-0 flex-1 max-w-md">
                  <Input
                    type={showPassword[guild.id] ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={passwords[guild.id] || ''}
                    onChange={(e) => setPasswords(prev => ({ ...prev, [guild.id]: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(prev => ({ ...prev, [guild.id]: !prev[guild.id] }))}
                    title={showPassword[guild.id] ? 'Hide password' : 'Show password'}
                  >
                    {showPassword[guild.id] ? '👁️' : '👁️‍🗨️'}
                  </Button>
                  <Button
                    onClick={() => handlePasswordUpdate(guild.id, guild.guildName, passwords[guild.id] || '')}
                    disabled={!passwords[guild.id]?.trim() || updating[guild.id]}
                    size="sm"
                  >
                    {updating[guild.id] ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {guildConfigurations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No guilds configured yet.</p>
            <p className="text-sm">Add guilds in the Guild Tracking tab first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
