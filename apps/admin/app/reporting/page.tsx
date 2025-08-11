"use client";

import { useRouter } from "next/navigation";
import { AppLayout } from "@nexus/ui";
import { FileBarChart } from "lucide-react";

export default function ReportingPage() {
  const router = useRouter();

  return (
    <AppLayout
      title="Reporting"
      activeNavItem="reporting"
      userRole="admin"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <FileBarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground mb-4">
                Generate and view comprehensive reports and analytics
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  This page is under construction. Advanced reporting features will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}