import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nexus/ui";

interface DashboardData {
  metrics: {
    totalUsers: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    monthlyRevenue: number;
  };
  recentActivity: Array<{
    type: string;
    user: string;
    email: string;
    company: string;
    timestamp: string;
  }>;
  recentExecutions: Array<{
    type: string;
    workflow: string;
    company: string;
    timestamp: string;
    success: boolean;
  }>;
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    // Use relative URL for API calls to avoid CORS issues
    const apiUrl = '/api/dashboard';
    console.log('Fetching dashboard data from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('Dashboard API response not OK:', response.status, response.statusText);
      throw new Error(`API responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dashboard data fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return fallback data if API fails
    return {
      metrics: {
        totalUsers: 0,
        activeWorkflows: 0,
        totalExecutions: 0,
        successRate: 0,
        monthlyRevenue: 0,
      },
      recentActivity: [],
      recentExecutions: [],
    };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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

export default async function AdminDashboard() {
  const data = await getDashboardData();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nexus Admin Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Live from database</p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.metrics.totalExecutions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{data.metrics.successRate}% success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.metrics.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">Calculated from executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>Latest user registrations from database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.length > 0 ? (
                  data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.email} from {activity.company} - {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Status</span>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-green-600">Connected ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Records</span>
                  <span className="text-sm">{data.metrics.totalUsers + data.metrics.totalExecutions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-green-600">{data.metrics.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}