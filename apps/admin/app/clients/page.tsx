"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout, Input } from "@nexus/ui";
import { Plus, Search, Edit2, ArrowUpDown } from "lucide-react";
import { api } from "@nexus/trpc/react";
import type { RouterOutputs } from "@nexus/trpc";

function formatRevenue(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${Math.floor(amount)}`;
  }
}

export default function ClientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch companies with search
  const { data: companies, isLoading, error } = api.companies.getDashboardMetrics.useQuery();
  const { data: profileData } = api.profile.getProfile.useQuery();

  // Filter companies based on search query
  type Company = RouterOutputs["companies"]["getDashboardMetrics"][number];
  const filteredCompanies = companies?.filter((company: Company) => {
    const query = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      company.domain.toLowerCase().includes(query) ||
      (company.industry && company.industry.toLowerCase().includes(query))
    );
  }) || [];

  if (isLoading) {
    return (
      <AppLayout title="Clients" activeNavItem="clients">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading clients...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Clients" activeNavItem="clients">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading clients: {error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Clients"
      activeNavItem="clients"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6">
          {/* Header with title and Add Client button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your client companies and their configurations
              </p>
            </div>
            <button
              onClick={() => router.push('/clients/new')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clients table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs border-b border-border">
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Client Name
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Contract Start
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Workflows
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Nodes
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Executions
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Exceptions
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Revenue
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Time Saved
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      <button className="flex items-center hover:text-foreground transition-colors">
                        Money Saved
                        <ArrowUpDown className="ml-1 w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-muted-foreground font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies && filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company: Company) => (
                      <tr
                        key={company.id}
                        className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-blue-600 dark:text-blue-400 font-medium">
                          {company.name}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {new Date(company.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {company.workflows}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {company.nodes}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {company.executions.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {company.exceptions}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {formatRevenue(company.revenue)}
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          {company.timeSaved}h
                        </td>
                        <td className="px-5 py-4 text-foreground">
                          ${company.moneySaved.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => router.push(`/clients/${company.id}/edit`)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            title="Edit client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-5 py-8 text-center text-muted-foreground">
                        {searchQuery ? "No clients found matching your search." : "No clients found."}
                      </td>
                    </tr>
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