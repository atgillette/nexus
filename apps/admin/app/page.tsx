"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout, TimeFilter, MetricCardSkeleton, TableSkeleton } from "@nexus/ui";
import { ArrowUp, ArrowDown } from "lucide-react";
import { api } from "@nexus/trpc/react";

function formatRevenue(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${Math.floor(amount)}`;
  }
}



export default function AdminDashboard() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('last-7');
  const { data, isLoading, error, isFetching } = api.dashboard.getAdminDashboard.useQuery({
    timeFilter: selectedTimeFilter
  });
  const { data: profileData } = api.profile.getProfile.useQuery();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <AppLayout title="Dashboard Overview" activeNavItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard Overview" activeNavItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading dashboard: {error.message}</p>
            {error.data?.code === 'UNAUTHORIZED' && (
              <p className="mt-2">
                <a href="/auth/login" className="text-blue-600 hover:underline">
                  Please log in
                </a>
              </p>
            )}
            {error.data?.code === 'FORBIDDEN' && (
              <p className="mt-2 text-sm text-gray-600">Admin access required</p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Dashboard Overview" activeNavItem="dashboard">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No data available</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard Overview"
      activeNavItem="dashboard"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6">
          {/* Time filters */}
          <TimeFilter
            selectedFilter={selectedTimeFilter}
            onFilterChange={setSelectedTimeFilter}
          />
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {isFetching && !isLoading ? (
              // Show skeletons while refetching (time filter change)
              Array.from({ length: 5 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))
            ) : (
              // Show actual data
              <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Total Workflows
                  <span className="ml-2 flex items-center text-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12%
                  </span>
                </p>
              </div>
              <h3 className="text-2xl font-semibold">{data.metrics.activeWorkflows.toLocaleString()}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Total Exceptions
                  <span className="ml-2 flex items-center text-red-500">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    -8%
                  </span>
                </p>
              </div>
              <h3 className="text-2xl font-semibold">{Math.floor(data.metrics.totalExecutions * 0.13)}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Time Saved
                  <span className="ml-2 flex items-center text-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +24%
                  </span>
                </p>
              </div>
              <h3 className="text-2xl font-semibold">{data.metrics.timeSaved || 0}h</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Revenue
                  <span className="ml-2 flex items-center text-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +16%
                  </span>
                </p>
              </div>
              <h3 className="text-2xl font-semibold">{formatRevenue(data.metrics.monthlyRevenue)}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  Active Clients
                  <span className="ml-2 flex items-center text-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +5%
                  </span>
                </p>
              </div>
              <h3 className="text-2xl font-semibold">{data.metrics.activeClients || 0}</h3>
            </div>
              </>
            )}
          </div>
          {/* Clients table */}
          {isFetching && !isLoading ? (
            <TableSkeleton />
          ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">All Clients</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-md flex items-center text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Client
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs border-b border-gray-200 dark:border-gray-700">
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Client Name
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Contract Start
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Workflows
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Nodes
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Executions
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Exceptions
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Revenue
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Time Saved
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        Money Saved
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies?.slice(0, 5).map((company, index) => {
                    // Mock data for demonstration - in real app this would come from TRPC
                    const workflows = Math.floor(Math.random() * 50) + 10;
                    const nodes = Math.floor(Math.random() * 200) + 50;
                    const executions = Math.floor(Math.random() * 2000) + 500;
                    const exceptions = Math.floor(executions * 0.1);
                    const revenue = Math.floor(Math.random() * 50000) + 10000;
                    const timeSaved = Math.floor(Math.random() * 500) + 100;
                    const moneySaved = Math.floor(timeSaved * 150);
                    
                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <td className="px-5 py-4 text-blue-600 dark:text-blue-400">
                          {company.name}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {workflows}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {nodes}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {executions.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {exceptions}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          ${revenue.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          {timeSaved}h
                        </td>
                        <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                          ${moneySaved.toLocaleString()}
                        </td>
                      </tr>
                    );
                  }) || []}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}