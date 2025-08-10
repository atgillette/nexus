import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nexus/ui";

interface ClientDashboardData {
  company: {
    name: string;
    id: string;
  };
  metrics: {
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    estimatedSavings: number;
    averageExecutionTime: number;
  };
  billing: {
    monthlyUsage: number;
    monthlyLimit: number;
    costPerExecution: number;
    currentCost: number;
  };
  recentExecutions: Array<{
    workflowName: string;
    success: boolean;
    timestamp: string;
    executionTime: number;
  }>;
  workflows: Array<{
    id: string;
    name: string;
    status: string;
    executionCount: number;
    lastExecution: string | null;
  }>;
}

async function getClientDashboardData(): Promise<ClientDashboardData> {
  // Use absolute URL for server-side rendering
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://nexus-delta-vert.vercel.app' 
      : 'http://localhost:3002');
  
  try {
    const response = await fetch(`${baseUrl}/api/dashboard-simple`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching client dashboard data:', error);
    // Return fallback data if API fails
    return {
      company: { name: "Demo Company", id: "demo" },
      metrics: {
        activeWorkflows: 0,
        totalExecutions: 0,
        successRate: 0,
        estimatedSavings: 0,
        averageExecutionTime: 0
      },
      billing: {
        monthlyUsage: 0,
        monthlyLimit: 1000,
        costPerExecution: 2.50,
        currentCost: 0
      },
      recentExecutions: [],
      workflows: []
    };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function ClientDashboard() {
  const data = await getClientDashboardData();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nexus Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {data.company.name}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ROI Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.metrics.estimatedSavings)}</div>
              <p className="text-xs text-muted-foreground">From successful executions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.successRate}%</div>
              <p className="text-xs text-muted-foreground">Of total executions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.billing.currentCost)}</div>
              <p className="text-xs text-muted-foreground">{data.billing.monthlyUsage} / {data.billing.monthlyLimit} executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Status and Performance */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Your automation processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Daily Data Processing</p>
                    <p className="text-xs text-muted-foreground">Last run: 2 hours ago</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Customer Report Generation</p>
                    <p className="text-xs text-muted-foreground">Last run: 5 hours ago</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Invoice Processing</p>
                    <p className="text-xs text-muted-foreground">Last run: 1 day ago</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Scheduled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Campaign Automation</p>
                    <p className="text-xs text-muted-foreground">Last run: 3 days ago</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Paused</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Efficiency Score</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Resource Utilization</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Error Recovery</span>
                    <span className="text-sm text-muted-foreground">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>Latest workflow runs and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Daily Data Processing</p>
                    <p className="text-xs text-muted-foreground">Completed in 4m 23s</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Customer Report Generation</p>
                    <p className="text-xs text-muted-foreground">Completed in 2m 15s</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Invoice Processing</p>
                    <p className="text-xs text-muted-foreground">Failed - Connection timeout</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Email Campaign Automation</p>
                    <p className="text-xs text-muted-foreground">Completed in 45s</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}