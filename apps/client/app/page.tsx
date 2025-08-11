"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, AppLayout, Button } from "@nexus/ui";
import { api } from "@nexus/trpc/react";
import { MessageSquare, CheckCircle, Circle, Clock, ArrowRight } from "lucide-react";

// Mock pipeline data
const pipelineItems = [
  { id: 1, title: "Discovery: Initial Survey", status: "completed", date: "Jan 15, 2025" },
  { id: 2, title: "Discovery: Process deep dive", status: "completed", date: "Jan 20, 2025" },
  { id: 3, title: "ADA Proposal Sent", status: "completed", date: "Jan 25, 2025" },
  { id: 4, title: "ADA Proposal Review", status: "in-progress", date: null },
  { id: 5, title: "ADA Contract Sent", status: "pending", date: null },
  { id: 6, title: "ADA Contract Signed", status: "pending", date: null },
  { id: 7, title: "Credentials collected", status: "pending", date: null },
  { id: 8, title: "Factory build initiated", status: "pending", date: null },
];

export default function ClientDashboard() {
  const { data, isLoading, error } = api.dashboard.getClientDashboard.useQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" activeNavItem="dashboard" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard" activeNavItem="dashboard" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading dashboard: {error.message}</p>
            {error.data?.code === 'UNAUTHORIZED' && (
              <p className="mt-2">
                <a href="/auth/login" className="text-primary hover:underline">
                  Please log in
                </a>
              </p>
            )}
            {error.data?.code === 'FORBIDDEN' && (
              <p className="mt-2 text-sm text-muted-foreground">Client access required</p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Dashboard" activeNavItem="dashboard" userRole="client">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Mock SE data - in real app this would come from the API
  const assignedSE = {
    name: "John Smith",
    role: "Solutions Engineer",
    avatar: null
  };

  return (
    <AppLayout
      title="Dashboard"
      activeNavItem="dashboard"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Company Header with SE Info */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.company.name}</h1>
          </div>
          
          {/* SE Info Section */}
          {assignedSE ? (
            <div className="flex items-center gap-4 bg-card rounded-lg p-4 shadow-sm border border-border">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                {/* Avatar placeholder */}
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">{assignedSE.name}</p>
                <p className="text-sm text-muted-foreground">{assignedSE.role}</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2" disabled>
                <MessageSquare className="w-4 h-4" />
                Message SE
              </Button>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground">No SE assigned</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pipeline Progress */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Pipeline Progress</h2>
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <div className="space-y-4 relative">
                {pipelineItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="mt-0.5 z-10">
                      {item.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : item.status === "in-progress" ? (
                        <Clock className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        item.status === "completed" ? "text-foreground" : 
                        item.status === "in-progress" ? "text-primary font-medium" : 
                        "text-muted-foreground"
                      }`}>
                        {item.title}
                      </p>
                      {item.date && (
                        <p className="text-xs text-muted-foreground mt-0.5">Completed {item.date}</p>
                      )}
                      {item.status === "in-progress" && (
                        <p className="text-xs text-primary mt-0.5">In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="space-y-6">
            {/* Time Saved */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Time Saved</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">24.5 hrs</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">168.2 hrs</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Money Saved */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Money Saved</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">$2,450</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">$16,820</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Active Workflows */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Workflows</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">12</div>
                      <p className="text-xs text-muted-foreground mt-1">Currently running</p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary hover:text-primary/80">
                      View workflows
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}