'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  Shield,
  Crown,
  User,
  Calendar,
  Globe,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserManagement() {
  // Mock user data - in real app, fetch from API
  const users = [
    {
      id: '1',
      characterName: 'Knight Slayer',
      world: 'Antica',
      role: 'GUILD_ADMIN',
      guildName: 'Elite Knights',
      subscriptionStatus: 'ACTIVE',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      characterName: 'Mage Master',
      world: 'Refugia',
      role: 'GUILD_MEMBER',
      guildName: 'Mystic Order',
      subscriptionStatus: 'INACTIVE',
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-05T00:00:00Z',
    },
    {
      id: '3',
      characterName: 'Paladin Pro',
      world: 'Antica',
      role: 'GUILD_MEMBER',
      guildName: 'Elite Knights',
      subscriptionStatus: 'PENDING_PAYMENT',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-10T00:00:00Z',
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-red-500" />;
      case 'GUILD_ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'GUILD_ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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

  const formatRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'GUILD_ADMIN':
        return 'Guild Admin';
      case 'GUILD_MEMBER':
        return 'Member';
      default:
        return role;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING_PAYMENT':
        return 'Pending';
      case 'INACTIVE':
        return 'Inactive';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </CardTitle>
          <CardDescription>
            Manage users, roles, and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Filter
              </Button>
              <Button variant="outline">
                Export
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {users.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => u.subscriptionStatus === 'ACTIVE').length}
                </div>
                <div className="text-sm text-muted-foreground">Active Subs</div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {users.filter(u => u.subscriptionStatus === 'PENDING_PAYMENT').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {users.filter(u => u.role === 'GUILD_ADMIN').length}
                </div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Guild</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{user.characterName}</div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span>{user.world}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getRoleColor(user.role))}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{formatRole(user.role)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.guildName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getStatusColor(user.subscriptionStatus))}>
                        {formatStatus(user.subscriptionStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatDate(user.lastLogin)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


