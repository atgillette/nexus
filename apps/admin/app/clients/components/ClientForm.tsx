"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
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
import { Plus, Trash2 } from "lucide-react";
import { 
  companyFormSchema,
  defaultFormValues,
  type CompanyFormValues 
} from "../validation";

interface ClientFormProps {
  editingClient?: {
    id: string;
    name: string;
    url: string;
    departments: Array<{ id: string; name: string }>;
    users: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      departmentId?: string;
      emailNotifications: boolean;
      smsNotifications: boolean;
      billingAccess: boolean;
      adminAccess: boolean;
    }>;
    solutionsEngineers: Array<{
      userId: string;
      email: string;
    }>;
  } | null;
  seUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  onSubmit: (data: CompanyFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ClientForm({
  editingClient,
  seUsers,
  onSubmit,
  isSubmitting,
  onCancel,
}: ClientFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema) as Resolver<CompanyFormValues>,
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

  // Reset form when client changes or component mounts
  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.name,
        url: editingClient.url,
        departments: editingClient.departments,
        users: editingClient.users,
        solutionsEngineers: editingClient.solutionsEngineers,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [editingClient, reset]);

  // Auto-populate SE email when SE is selected
  const handleSEChange = (index: number, userId: string) => {
    setValue(`solutionsEngineers.${index}.userId`, userId);
    const selectedSE = seUsers?.find(se => se.id === userId);
    if (selectedSE) {
      setValue(`solutionsEngineers.${index}.email`, selectedSE.email);
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <h1 className="text-2xl font-semibold mb-8">
          {editingClient ? "Edit Client" : "Add New Client"}
        </h1>
        
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
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingClient ? "Saving..." : "Creating...") 
                : (editingClient ? "Save Changes" : "Create Client")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}