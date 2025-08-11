"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@nexus/ui";
import { api } from "@nexus/trpc/react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export default function ReportingPage() {
  const router = useRouter();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading, error } = api.dashboard.getExecutionLogs.useQuery({
    workflowId: selectedWorkflowId || undefined,
    page: currentPage,
    pageSize: 20
  });

  if (isLoading) {
    return (
      <AppLayout title="Reporting" activeNavItem="reporting" userRole="client">
        <div className="pt-16">
          <div className="p-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 w-64 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-10 w-48 bg-muted rounded-lg animate-pulse"></div>
            </div>

            {/* Table skeleton */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs border-b border-border bg-muted/50">
                      <th className="px-5 py-3">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                      </th>
                      <th className="px-5 py-3">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-5 py-4">
                          <div className="h-4 w-36 bg-muted rounded animate-pulse"></div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination skeleton */}
            <div className="mt-6 flex items-center justify-between">
              <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse"></div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
                <div className="h-8 w-8 bg-muted rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Reporting" activeNavItem="reporting" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading execution logs: {error.message}</p>
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
      <AppLayout title="Reporting" activeNavItem="reporting" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const selectedWorkflow = data.workflows.find(w => w.id === selectedWorkflowId);
  const displayWorkflowName = selectedWorkflow?.name || "All Workflows";

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setCurrentPage(1); // Reset to first page when changing filter
    setDropdownOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <AppLayout
      title="Reporting"
      activeNavItem="reporting"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6">
          {/* Header with workflow selector */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Workflow Execution Logs</h1>
            
            {/* Workflow Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-foreground">{displayWorkflowName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleWorkflowSelect("")}
                      className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground transition-colors"
                    >
                      All Workflows
                    </button>
                    {data.workflows.map(workflow => (
                      <button
                        key={workflow.id}
                        onClick={() => handleWorkflowSelect(workflow.id)}
                        className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground transition-colors"
                      >
                        {workflow.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      Timestamp
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      Workflow
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      Execution Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                        No execution logs found{selectedWorkflowId ? ' for this workflow' : ''}.
                      </td>
                    </tr>
                  ) : (
                    data.logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 text-foreground">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {log.workflowName}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * data.pagination.pageSize) + 1} to{' '}
                {Math.min(currentPage * data.pagination.pageSize, data.pagination.totalCount)} of{' '}
                {data.pagination.totalCount} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (data.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= data.pagination.totalPages - 2) {
                      pageNum = data.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}