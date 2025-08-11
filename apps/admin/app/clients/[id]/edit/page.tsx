"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout, Button } from "@nexus/ui";
import { ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { ClientForm } from "../../components/ClientForm";
import type { CompanyFormValues } from "../../validation";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: seUsers } = api.users.getUsers.useQuery({ role: "se" });
  const { data: company, isLoading, error } = api.companies.getByIdWithDetails.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const utils = api.useUtils();

  // Update company mutation
  const updateCompanyMutation = api.companies.updateWithDetails.useMutation({
    onSuccess: () => {
      // Invalidate relevant queries to refresh the cache
      utils.companies.getByIdWithDetails.invalidate({ id: clientId });
      utils.companies.list.invalidate();
      utils.companies.getDashboardMetrics.invalidate();
      router.push("/clients");
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error updating client: ${error.message}`);
    },
  });

  // Form submission handler
  const onSubmit = (data: CompanyFormValues) => {
    setIsSubmitting(true);
    
    
    // Extract domain from URL
    const domain = data.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    
    // Prepare departments data
    const departmentsData = data.departments.length > 0 
      ? data.departments.map(dept => ({ 
          id: dept.id, // Preserve the department ID
          name: dept.name.trim() 
        }))
      : [];
    
    // Prepare users data
    const usersData = data.users.length > 0
      ? data.users.map(user => {
          const nameParts = user.name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const department = data.departments.find(d => d.id === user.departmentId);
          
          
          // Important: preserve the user ID if it exists
          return {
            id: user.id, // Don't filter by 'cl' prefix here - let the backend handle it
            firstName,
            lastName,
            email: user.email,
            phone: user.phone || undefined,
            departmentName: department?.name || undefined,
            emailNotifications: user.emailNotifications,
            smsNotifications: user.smsNotifications,
            billingAccess: user.billingAccess,
            adminAccess: user.adminAccess,
          };
        })
      : [];
    
    // Prepare SE assignments data
    const seData = data.solutionsEngineers.length > 0
      ? data.solutionsEngineers.map((se, index) => ({
          userId: se.userId,
          isPrimary: index === 0, // First SE is primary
        }))
      : [];
    
    const submitData = {
      id: clientId,
      name: data.name,
      domain: domain,
      departments: departmentsData,
      users: usersData,
      solutionsEngineers: seData,
    };
    
    
    updateCompanyMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <AppLayout title="Edit Client" activeNavItem="clients">
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
      <AppLayout title="Edit Client" activeNavItem="clients">
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
      title="Edit Client"
      activeNavItem="clients"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6 max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push("/clients")}
            className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </button>

          <ClientForm
            editingClient={company}
            seUsers={seUsers}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting || updateCompanyMutation.isPending}
            onCancel={() => router.push("/clients")}
          />
        </div>
      </div>
    </AppLayout>
  );
}