"use client";

import { useRouter } from "next/navigation";
import { AppLayout, Button } from "@nexus/ui";
import { api } from "@nexus/trpc/react";
import { Plus } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  return `${hours.toFixed(1)} hrs`;
}

export default function WorkflowROIPage() {
  const { data, isLoading, error } = api.dashboard.getWorkflowROI.useQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <AppLayout title="Workflow ROI" activeNavItem="workflow-roi" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading workflow ROI data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Workflow ROI" activeNavItem="workflow-roi" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading workflow ROI: {error.message}</p>
            {error.data?.code === 'UNAUTHORIZED' && (
              <p className="mt-2">
                <a href="/auth/login" className="text-primary hover:underline">
                  Please log in
                </a>
              </p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Workflow ROI" activeNavItem="workflow-roi" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Workflow ROI"
      activeNavItem="workflow-roi"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="p-6">
          {/* Header with New button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Workflow ROI</h1>
            <Button 
              className="flex items-center gap-2"
              disabled
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>

          {/* Summary Stats */}
          {data.summary.totalWorkflows > 0 && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.totalWorkflows}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.totalExecutions.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Time Saved</p>
                <p className="text-2xl font-bold text-foreground">{formatHours(data.summary.totalTimeSaved)}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Cost Saved</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.summary.totalCostSaved)}</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Create Date/Time
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Workflow Name
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      Description
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Nodes
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Executions
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Exceptions
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Time Saved
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <div className="flex items-center">
                        Cost Saved
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.workflows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                        No workflows found. Create your first workflow to start tracking ROI.
                      </td>
                    </tr>
                  ) : (
                    data.workflows.map((workflow) => (
                      <tr
                        key={workflow.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 text-foreground">
                          {new Date(workflow.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })} {new Date(workflow.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </td>
                        <td className="px-5 py-4 text-primary font-medium">
                          {workflow.name}
                        </td>
                        <td className="px-5 py-4 text-foreground max-w-xs truncate">
                          {workflow.description}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {workflow.nodes}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {workflow.executions.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {workflow.exceptions}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {formatHours(workflow.timeSaved)}
                        </td>
                        <td className="px-5 py-4 text-foreground font-medium">
                          {formatCurrency(workflow.costSaved)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}