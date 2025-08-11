"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout, Input, Label, Button, Card, CardHeader, CardTitle, CardContent } from "@nexus/ui";
import { ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { companyFormSchema, type CompanyFormValues } from "../validation";

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: profileData } = api.profile.getProfile.useQuery();

  const createCompanyMutation = api.companies.create.useMutation({
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
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      domain: "",
      industry: "",
    },
  });

  const onSubmit = (data: CompanyFormValues) => {
    setIsSubmitting(true);
    createCompanyMutation.mutate({
      name: data.name,
      domain: data.domain,
      industry: data.industry || undefined,
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
              <CardTitle>Add New Client</CardTitle>
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
                    {isSubmitting ? "Creating..." : "Create Client"}
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