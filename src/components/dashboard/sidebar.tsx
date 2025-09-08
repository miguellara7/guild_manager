'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Users,
  Shield,
  Bell,
  BarChart3,
  Settings,
  Crown,
  Sword,
  Eye,
  LogOut,
  Menu,
  X,
  Activity,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and statistics',
  },
  {
    name: 'Online Monitor',
    href: '/dashboard/online',
    icon: Activity,
    description: 'Real-time online status',
  },
  {
    name: 'Guild Members',
    href: '/dashboard/members',
    icon: Users,
    description: 'Manage guild members',
  },
  {
    name: 'Enemies',
    href: '/dashboard/enemies',
    icon: Sword,
    description: 'Track enemy players',
  },
  {
    name: 'Death Tracker',
    href: '/dashboard/deaths',
    icon: AlertTriangle,
    description: 'Recent deaths and PvP activity',
  },
  {
    name: 'Alerts',
    href: '/dashboard/alerts',
    icon: Bell,
    description: 'Notification settings',
  },
];

const adminNavigation = [
  {
    name: 'Guild Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Guild configuration',
  },
  {
    name: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    description: 'Billing and plans',
  },
];

const superAdminNavigation = [
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: Crown,
    description: 'System administration',
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === 'GUILD_ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0]; mobile?: boolean }) => (
    <Link
      href={item.href}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
        pathname === item.href
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
        mobile ? 'w-full' : ''
      )}
    >
      <item.icon
        className={cn(
          'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
          pathname === item.href
            ? 'text-white'
            : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
        )}
      />
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        {!mobile && (
          <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {item.description}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Guild Manager
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.world}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* User info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {session?.user?.characterName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.characterName}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      session?.user?.role === 'SUPER_ADMIN'
                        ? 'destructive'
                        : session?.user?.role === 'GUILD_ADMIN'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {session?.user?.role === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : session?.user?.role === 'GUILD_ADMIN'
                      ? 'Guild Admin'
                      : 'Member'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} mobile={isMobileMenuOpen} />
              ))}
            </div>

            {isAdmin && (
              <>
                <div className="pt-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Administration
                  </h3>
                  <div className="mt-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <NavLink key={item.name} item={item} mobile={isMobileMenuOpen} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {isSuperAdmin && (
              <>
                <div className="pt-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Super Admin
                  </h3>
                  <div className="mt-2 space-y-1">
                    {superAdminNavigation.map((item) => (
                      <NavLink key={item.name} item={item} mobile={isMobileMenuOpen} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
