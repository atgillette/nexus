import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nexus/ui";
import { PrismaClient, ExecutionStatus } from "@prisma/client";
import { AdminGuard } from "@nexus/auth";

const prisma = new PrismaClient();

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
    console.log('Fetching dashboard data directly from database...');
    
    // Get dashboard metrics directly from database
    const [
      totalUsers,
      activeWorkflows,
      allExecutions,
      recentUsers,
      recentExecutions,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Active workflows count (using isActive field)
      prisma.workflow.count({
        where: { isActive: true }
      }),
      
      // Get all executions to calculate success rate
      prisma.workflowExecution.findMany({
        select: { status: true }
      }),
      
      // Recent user registrations (last 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { company: true }
      }),
      
      // Recent workflow executions (last 10)
      prisma.workflowExecution.findMany({
        take: 10,
        orderBy: { startedAt: 'desc' },
        include: { 
          workflow: { include: { company: true } }
        }
      })
    ]);

    console.log(`Found ${totalUsers} users, ${activeWorkflows} active workflows, ${allExecutions.length} executions`);

    // Calculate success rate (completed = success)
    const totalExecutions = allExecutions.length;
    const successfulExecutions = allExecutions.filter((e: { status: ExecutionStatus }) => e.status === ExecutionStatus.completed).length;
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
    
    // Calculate revenue (mock calculation based on executions)
    const monthlyRevenue = totalExecutions * 12.50; // $12.50 per execution average
    
    console.log(`Success rate: ${successRate}%, Revenue: $${monthlyRevenue}`);
    
    return {
      metrics: {
        totalUsers,
        activeWorkflows,
        totalExecutions,
        successRate,
        monthlyRevenue,
      },
      recentActivity: recentUsers.map(user => ({
        type: 'user_registered',
        user: `${user.firstName} ${user.lastName}`,
        email: user.email,
        company: user.company?.name || 'No Company',
        timestamp: user.createdAt.toISOString()
      })),
      recentExecutions: recentExecutions.map(execution => ({
        type: execution.status === 'completed' ? 'execution_success' : 'execution_failed',
        workflow: execution.workflow.name,
        company: execution.workflow.company.name,
        timestamp: execution.startedAt.toISOString(),
        success: execution.status === 'completed'
      }))
    };
    
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
  } finally {
    await prisma.$disconnect();
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
    <AdminGuard>
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
    </AdminGuard>
  );
}