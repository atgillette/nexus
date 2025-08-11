"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  AppLayout, 
  Input, 
  Label, 
  Button, 
  Card, 
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from "@nexus/ui";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import { 
  companyFormSchema,
  defaultFormValues,
  type CompanyFormValues 
} from "../validation";

export default function NewClientPage() {
  const router = useRouter();
  
  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: seUsers } = api.users.getUsers.useQuery({ role: "se" });

  // Initialize React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema) as ReturnType<typeof zodResolver>,
    defaultValues: defaultFormValues,
  });

  // Field arrays for dynamic fields
  const { fields: departmentFields, append: appendDepartment, remove: removeDepartment } = useFieldArray({
    control,
    name: "departments",
  });

  const { fields: userFields, append: appendUser, remove: removeUser } = useFieldArray({
    control,
    name: "users",
  });

  const { fields: seFields, append: appendSE, remove: removeSE } = useFieldArray({
    control,
    name: "solutionsEngineers",
  });

  // Watch SE selections to auto-populate emails
  const watchSEs = watch("solutionsEngineers");

  // Create company mutation
  const createCompanyMutation = api.companies.create.useMutation({
    onSuccess: () => {
      router.push("/clients");
    },
    onError: (error) => {
      alert(`Error creating client: ${error.message}`);
    },
  });

  // Form submission handler
  const onSubmit = (data: CompanyFormValues) => {
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

  // Auto-populate SE email when SE is selected
  const handleSEChange = (index: number, userId: string) => {
    setValue(`solutionsEngineers.${index}.userId`, userId);
    const selectedSE = seUsers?.find(se => se.id === userId);
    if (selectedSE) {
      setValue(`solutionsEngineers.${index}.email`, selectedSE.email);
    }
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

          <Card>
            <CardContent className="p-8">
              <h1 className="text-2xl font-semibold mb-8">Add New Client</h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">
                      Company Name<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      {...register("name")}
                      placeholder="Enter company name"
                      className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="url">
                      Company URL<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="url"
                      type="text"
                      {...register("url")}
                      placeholder="https://"
                      className={`mt-1 ${errors.url ? 'border-destructive' : ''}`}
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
                    )}
                  </div>
                </div>

                {/* Manage Departments */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Manage Departments</h2>
                  <div className="space-y-3">
                    {departmentFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          {...register(`departments.${index}.name`)}
                          placeholder="Department name"
                          className={`flex-1 ${errors.departments?.[index]?.name ? 'border-destructive' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDepartment(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        {errors.departments?.[index]?.name && (
                          <p className="text-sm text-destructive">{errors.departments[index]?.name?.message}</p>
                        )}
                      </div>
                    ))}
                    {errors.departments?.message && (
                      <p className="text-sm text-destructive">{errors.departments.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendDepartment({ id: `temp-${Date.now()}`, name: "" })}
                      className="whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </div>
                </div>

                {/* Users */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Users</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium">Name</th>
                          <th className="text-left pb-3 font-medium">Email</th>
                          <th className="text-left pb-3 font-medium">Phone</th>
                          <th className="text-left pb-3 font-medium">Department</th>
                          <th className="text-left pb-3 font-medium">Exceptions</th>
                          <th className="text-left pb-3 font-medium">Access</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {userFields.map((field, index) => (
                          <tr key={field.id} className="border-b">
                            <td className="py-3 pr-3">
                              <div>
                                <Input
                                  {...register(`users.${index}.name`)}
                                  placeholder="First Last"
                                  className={`w-full min-w-[150px] ${errors.users?.[index]?.name ? 'border-destructive' : ''}`}
                                />
                                {errors.users?.[index]?.name && (
                                  <p className="text-xs text-destructive mt-1">{errors.users[index]?.name?.message}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div>
                                <Input
                                  type="email"
                                  {...register(`users.${index}.email`)}
                                  placeholder="email@example.com"
                                  className={`w-full min-w-[150px] ${errors.users?.[index]?.email ? 'border-destructive' : ''}`}
                                />
                                {errors.users?.[index]?.email && (
                                  <p className="text-xs text-destructive mt-1">{errors.users[index]?.email?.message}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div>
                                <Input
                                  {...register(`users.${index}.phone`)}
                                  placeholder="(555) 555-5555"
                                  className={`w-full min-w-[120px] ${errors.users?.[index]?.phone ? 'border-destructive' : ''}`}
                                />
                                {errors.users?.[index]?.phone && (
                                  <p className="text-xs text-destructive mt-1">{errors.users[index]?.phone?.message}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <Controller
                                control={control}
                                name={`users.${index}.departmentId`}
                                render={({ field }) => (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full min-w-[150px]">
                                      <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {departmentFields.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id || ""}>
                                          {watch(`departments.${departmentFields.indexOf(dept)}.name`) || "Unnamed"}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Controller
                                    control={control}
                                    name={`users.${index}.emailNotifications`}
                                    render={({ field }) => (
                                      <Checkbox
                                        id={`email-${field.name}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <Label htmlFor={`email-users.${index}.emailNotifications`} className="text-sm">
                                    Email
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Controller
                                    control={control}
                                    name={`users.${index}.smsNotifications`}
                                    render={({ field }) => (
                                      <Checkbox
                                        id={`sms-${field.name}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <Label htmlFor={`sms-users.${index}.smsNotifications`} className="text-sm">
                                    SMS
                                  </Label>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Controller
                                    control={control}
                                    name={`users.${index}.billingAccess`}
                                    render={({ field }) => (
                                      <Checkbox
                                        id={`billing-${field.name}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <Label htmlFor={`billing-users.${index}.billingAccess`} className="text-sm whitespace-nowrap">
                                    Billing Access
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Controller
                                    control={control}
                                    name={`users.${index}.adminAccess`}
                                    render={({ field }) => (
                                      <Checkbox
                                        id={`admin-${field.name}`}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    )}
                                  />
                                  <Label htmlFor={`admin-users.${index}.adminAccess`} className="text-sm whitespace-nowrap">
                                    Admin Access
                                  </Label>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeUser(index)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.users?.message && (
                    <p className="text-sm text-destructive mt-2">{errors.users.message}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendUser({
                      id: `temp-${Date.now()}`,
                      name: "",
                      email: "",
                      phone: "",
                      departmentId: "",
                      emailNotifications: false,
                      smsNotifications: false,
                      billingAccess: false,
                      adminAccess: false,
                    })}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {/* Assign Solutions Engineers */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Assign Solutions Engineers</h2>
                  <div className="space-y-3">
                    {seFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="sr-only">Name</Label>
                          <Controller
                            control={control}
                            name={`solutionsEngineers.${index}.userId`}
                            render={({ field }) => (
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => handleSEChange(index, value)}
                              >
                                <SelectTrigger className={errors.solutionsEngineers?.[index]?.userId ? 'border-destructive' : ''}>
                                  <SelectValue placeholder="Select SE" />
                                </SelectTrigger>
                                <SelectContent>
                                  {seUsers?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.firstName} {user.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.solutionsEngineers?.[index]?.userId && (
                            <p className="text-xs text-destructive mt-1">{errors.solutionsEngineers[index]?.userId?.message}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <Label className="sr-only">Email</Label>
                          <div className="px-3 py-2 text-muted-foreground">
                            {watchSEs?.[index]?.email || "Select an SE to see email"}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSE(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {errors.solutionsEngineers?.message && (
                      <p className="text-sm text-destructive">{errors.solutionsEngineers.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendSE({ userId: "", email: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Solutions Engineer
                    </Button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
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
                    disabled={isSubmitting || createCompanyMutation.isPending}
                  >
                    {isSubmitting || createCompanyMutation.isPending ? "Creating..." : "Create Client"}
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