'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Database,
  Server,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function SystemMonitoring() {
  const systemStatus = {
    database: { status: 'healthy', lastCheck: '2 minutes ago' },
    tibiaDataApi: { status: 'healthy', lastCheck: '1 minute ago' },
    deathTracker: { status: 'running', lastCheck: '30 seconds ago' },
    backgroundJobs: { status: 'healthy', lastCheck: '5 minutes ago' },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
          <CardDescription>
            Monitor the health and status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">PostgreSQL</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(systemStatus.database.status)}>
                    {getStatusIcon(systemStatus.database.status)}
                    <span className="ml-1">{systemStatus.database.status}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus.database.lastCheck}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">TibiaData API</p>
                    <p className="text-sm text-muted-foreground">External API</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(systemStatus.tibiaDataApi.status)}>
                    {getStatusIcon(systemStatus.tibiaDataApi.status)}
                    <span className="ml-1">{systemStatus.tibiaDataApi.status}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus.tibiaDataApi.lastCheck}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Death Tracker</p>
                    <p className="text-sm text-muted-foreground">Background Service</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(systemStatus.deathTracker.status)}>
                    {getStatusIcon(systemStatus.deathTracker.status)}
                    <span className="ml-1">{systemStatus.deathTracker.status}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus.deathTracker.lastCheck}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Background Jobs</p>
                    <p className="text-sm text-muted-foreground">Scheduled Tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(systemStatus.backgroundJobs.status)}>
                    {getStatusIcon(systemStatus.backgroundJobs.status)}
                    <span className="ml-1">{systemStatus.backgroundJobs.status}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus.backgroundJobs.lastCheck}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Status
            </Button>
            <Button variant="outline" size="sm">
              View Logs
            </Button>
            <Button variant="outline" size="sm">
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            System performance and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Performance monitoring coming soon</p>
            <p className="text-sm">CPU, Memory, API response times, and more</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


