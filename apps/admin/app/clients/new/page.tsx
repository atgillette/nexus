"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@nexus/ui";
import { ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { ClientForm } from "../components/ClientForm";
import type { CompanyFormValues } from "../validation";

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: seUsers } = api.users.getUsers.useQuery({ role: "se" });

  // Create company mutation
  const createCompanyMutation = api.companies.create.useMutation({
    onSuccess: () => {
      router.push("/clients");
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error creating client: ${error.message}`);
    },
  });

  // Form submission handler
  const onSubmit = (data: CompanyFormValues) => {
    setIsSubmitting(true);
    
    // Extract domain from URL
    const domain = data.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    
    // Prepare departments data (only send name, not id)
    const departmentsData = data.departments.length > 0 
      ? data.departments.map(dept => ({ 
          name: dept.name.trim() 
        }))
      : undefined;
    
    // Prepare users data
    const usersData = data.users.length > 0
      ? data.users.map(user => {
          const nameParts = user.name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const department = data.departments.find(d => d.id === user.departmentId);
          
          return {
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
      : undefined;
    
    // Prepare SE assignments data
    const seData = data.solutionsEngineers.length > 0
      ? data.solutionsEngineers.map((se, index) => ({
          userId: se.userId,
          isPrimary: index === 0, // First SE is primary
        }))
      : undefined;
    
    createCompanyMutation.mutate({
      name: data.name,
      domain: domain,
      industry: undefined,
      departments: departmentsData,
      users: usersData,
      solutionsEngineers: seData,
    });
  };

  return (
    <AppLayout
      title="Add New Client"
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
            editingClient={null}
            seUsers={seUsers}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting || createCompanyMutation.isPending}
            onCancel={() => router.push("/clients")}
          />
        </div>
      </div>
    </AppLayout>
  );
}