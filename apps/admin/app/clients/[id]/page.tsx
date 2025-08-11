"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout, Button, Card, CardContent } from "@nexus/ui";
import { ArrowLeft, Edit, Users, Workflow } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { AddWorkflowModal } from "../components/AddWorkflowModal";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "workflows">("overview");
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false);
  
  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: company, isLoading, error } = api.companies.getByIdWithDetails.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  // Mock workflows data for now - will be replaced with real TRPC endpoint
  const mockWorkflows = [
    {
      id: "workflow-1",
      name: "Lead Processing",
      department: "Sales",
      nodes: 12,
      executions: 234,
      exceptions: 2,
      timeSaved: 30,
      moneySaved: 75,
      status: "active",
      createdAt: "2025-01-15",
    },
    {
      id: "workflow-2", 
      name: "Onboarding",
      department: "HR",
      nodes: 8,
      executions: 45,
      exceptions: 0,
      timeSaved: 120,
      moneySaved: 180,
      status: "active",
      createdAt: "2025-01-10",
    },
  ];

  if (isLoading) {
    return (
      <AppLayout title="Client Details" activeNavItem="clients">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading client...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout title="Client Details" activeNavItem="clients">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">
              {error ? `Error loading client: ${error.message}` : "Client not found"}
            </p>
            <Button
              onClick={() => router.push("/clients")}
              className="mt-4"
            >
              Back to Clients
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Client Details"
      activeNavItem="clients"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => router.push("/clients")}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Clients
            </button>
            <span className="text-muted-foreground">›</span>
            <span className="text-foreground font-medium">{company.name}</span>
          </div>

          {/* Header with Edit button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
              <p className="text-muted-foreground mt-1">{company.url}</p>
            </div>
            <Button
              onClick={() => router.push(`/clients/${clientId}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Client
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("workflows")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "workflows"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Workflow className="w-4 h-4 mr-2 inline" />
                Client Workflows
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Assigned Support Engineers */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Assigned Support Engineers</h2>
                <div className="flex gap-4">
                  {company.solutionsEngineers.map((se, index) => (
                    <Card key={se.userId} className="w-64">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{se.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {index === 0 ? "Lead SE" : "Support SE"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Client Users */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Client Users</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-4 font-medium">Name</th>
                            <th className="text-left p-4 font-medium">Email</th>
                            <th className="text-left p-4 font-medium">Phone</th>
                            <th className="text-left p-4 font-medium">Billing</th>
                            <th className="text-left p-4 font-medium">Admin</th>
                            <th className="text-left p-4 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {company.users.map((user, index) => {
                            const nameParts = user.name.split(' ');
                            const firstName = nameParts[0] || '';
                            const lastName = nameParts.slice(1).join(' ') || '';
                            const department = company.departments.find(d => d.id === user.departmentId);
                            
                            return (
                              <tr key={user.id} className={index > 0 ? "border-t" : ""}>
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-muted-foreground">{user.email}</td>
                                <td className="p-4 text-muted-foreground">{user.phone || "—"}</td>
                                <td className="p-4">
                                  {user.billingAccess ? (
                                    <span className="text-green-600">✓</span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {user.adminAccess ? (
                                    <span className="text-green-600">✓</span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>
                                <td className="p-4 text-muted-foreground">
                                  {user.adminAccess ? "Primary contact" : 
                                   department ? `${department.name}` : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}

          {activeTab === "workflows" && (
            <div>
              {/* Workflows Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Workflows</h2>
                <Button onClick={() => setIsAddWorkflowOpen(true)}>
                  Add Workflow
                </Button>
              </div>

              {/* Workflows Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Create Date</th>
                          <th className="text-left p-4 font-medium">Department</th>
                          <th className="text-left p-4 font-medium">Workflow Name</th>
                          <th className="text-left p-4 font-medium"># of Nodes</th>
                          <th className="text-left p-4 font-medium"># of Executions</th>
                          <th className="text-left p-4 font-medium"># of Exceptions</th>
                          <th className="text-left p-4 font-medium">Time Saved</th>
                          <th className="text-left p-4 font-medium">$ Saved</th>
                          <th className="text-left p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockWorkflows.map((workflow, index) => (
                          <tr key={workflow.id} className={index > 0 ? "border-t" : ""}>
                            <td className="p-4">{workflow.createdAt}</td>
                            <td className="p-4">{workflow.department}</td>
                            <td className="p-4 font-medium text-primary">{workflow.name}</td>
                            <td className="p-4">{workflow.nodes}</td>
                            <td className="p-4 text-blue-600">{workflow.executions}</td>
                            <td className="p-4">{workflow.exceptions}</td>
                            <td className="p-4">
                              <div className="text-right">
                                {workflow.timeSaved}
                                <div className="text-xs text-muted-foreground">min</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-right">
                                {workflow.moneySaved}
                                <div className="text-xs text-muted-foreground">USD</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-primary">ROI Report</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Add Workflow Modal */}
      <AddWorkflowModal
        isOpen={isAddWorkflowOpen}
        onClose={() => setIsAddWorkflowOpen(false)}
        clientId={clientId}
        departments={company.departments}
        onSuccess={() => {
          setIsAddWorkflowOpen(false);
          // TODO: Refetch workflows data when real endpoint is implemented
        }}
      />
    </AppLayout>
  );
}