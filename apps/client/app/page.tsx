import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nexus/ui";
import { PrismaClient, ExecutionStatus } from "@prisma/client";
import { ClientGuard } from "@nexus/auth";

const prisma = new PrismaClient();

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
  try {
    console.log("Starting client dashboard data fetch...");
    
    // Get basic company info first (for demo, use first company)
    const company = await prisma.company.findFirst();
    console.log("Company found:", company?.name);
    
    if (!company) {
      console.log("No company found, returning fallback data");
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
    
    // Get workflows for this company
    const workflows = await prisma.workflow.findMany({
      where: { companyId: company.id }
    });
    console.log(`Found ${workflows.length} workflows`);
    
    // Get executions for these workflows
    const workflowIds = workflows.map(w => w.id);
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: { in: workflowIds } },
      orderBy: { startedAt: 'desc' },
      take: 30
    });
    console.log(`Found ${executions.length} executions`);
    
    // Calculate metrics (success = completed status)
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter((e: { status: ExecutionStatus }) => e.status === ExecutionStatus.completed).length;
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
    const estimatedSavings = successfulExecutions * 50; // $50 per successful execution
    
    const result = {
      company: {
        name: company.name,
        id: company.id
      },
      metrics: {
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalExecutions,
        successRate,
        estimatedSavings,
        averageExecutionTime: 0 // Simplified for now
      },
      billing: {
        monthlyUsage: totalExecutions,
        monthlyLimit: 1000,
        costPerExecution: 2.50,
        currentCost: totalExecutions * 2.50
      },
      recentExecutions: executions.slice(0, 10).map(execution => ({
        workflowName: workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown',
        success: execution.status === ExecutionStatus.completed,
        timestamp: execution.startedAt.toISOString(),
        executionTime: execution.duration || 0
      })),
      workflows: workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        status: workflow.isActive ? 'active' : 'inactive',
        executionCount: executions.filter((e: { workflowId: string }) => e.workflowId === workflow.id).length,
        lastExecution: executions.find((e: { workflowId: string, startedAt: Date }) => e.workflowId === workflow.id)?.startedAt?.toISOString() || null
      }))
    };
    
    console.log("Client dashboard data fetched successfully");
    return result;
    
  } catch (error) {
    console.error("Client dashboard error:", error);
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


export default async function ClientDashboard() {
  const data = await getClientDashboardData();
  return (
    <ClientGuard>
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
    </ClientGuard>
  );
}