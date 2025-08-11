"use client";

import { useRouter } from "next/navigation";
import { AppLayout } from "@nexus/ui";
import { Users } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();

  return (
    <AppLayout
      title="Users"
      activeNavItem="users"
      userRole="client"
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
      onLogoutClick={() => router.push('/auth/logout')}
    >
      <div className="pt-16">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">User Management</h1>
              <p className="text-muted-foreground mb-4">
                Manage users and permissions for your organization
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  This page is under construction. User management features will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}