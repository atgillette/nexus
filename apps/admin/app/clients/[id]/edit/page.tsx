"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout, Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@nexus/ui";
import { ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { companyFormSchema, type CompanyFormValues } from "../../validation";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: company, isLoading, error } = api.companies.getById.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const updateCompanyMutation = api.companies.update.useMutation({
    onSuccess: () => {
      router.push("/clients");
    },
    onError: (error) => {
      setIsSubmitting(false);
      // Set form error if it's a domain conflict
      if (error.message.includes("domain already exists")) {
        setError("domain", {
          type: "manual",
          message: "A company with this domain already exists",
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      domain: "",
      industry: "",
    },
  });

  // Populate form when company data is loaded
  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        domain: company.domain,
        industry: company.industry || "",
      });
    }
  }, [company, reset]);

  const onSubmit = (data: CompanyFormValues) => {
    setIsSubmitting(true);
    updateCompanyMutation.mutate({
      id: clientId,
      name: data.name,
      domain: data.domain,
      industry: data.industry || null,
    });
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
        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push("/clients")}
            className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name */}
                <div>
                  <Label htmlFor="name">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    className="mt-1"
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Domain */}
                <div>
                  <Label htmlFor="domain">
                    Domain <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="domain"
                    type="text"
                    {...register("domain")}
                    aria-invalid={!!errors.domain}
                    className="mt-1"
                    placeholder="example.com"
                  />
                  {errors.domain && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.domain.message}
                    </p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    type="text"
                    {...register("industry")}
                    aria-invalid={!!errors.industry}
                    className="mt-1"
                    placeholder="Technology, Healthcare, Finance, etc."
                  />
                  {errors.industry && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.industry.message}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/clients")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}