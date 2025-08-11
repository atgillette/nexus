"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nexus/ui";
import type { User, Company } from "../types";
import {
  userFormSchemaWithRefinements,
  type UserFormValues,
} from "../validation";

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  companies: Company[] | undefined;
  onSubmit: (data: UserFormValues) => void;
  isSubmitting: boolean;
}

export function UserForm({
  isOpen,
  onOpenChange,
  editingUser,
  companies,
  onSubmit,
  isSubmitting,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchemaWithRefinements),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "se",
      phone: "",
      costRate: "",
      billRate: "",
      companyAssignments: [],
    },
  });

  // Watch for company assignments
  const watchedCompanyAssignments = watch("companyAssignments");

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        const role = editingUser.role === "admin" || editingUser.role === "se" 
          ? editingUser.role 
          : "se";
        reset({
          email: editingUser.email,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          role,
          phone: editingUser.phone || "",
          costRate: editingUser.costRate?.toString() || "",
          billRate: editingUser.billRate?.toString() || "",
          companyAssignments: editingUser.companyAssignments.map(
            (c) => c.companyId
          ),
        });
      } else {
        reset({
          email: "",
          firstName: "",
          lastName: "",
          role: "se",
          phone: "",
          costRate: "",
          billRate: "",
          companyAssignments: [],
        });
      }
    }
  }, [isOpen, editingUser, reset]);

  const handleCompanyAssignmentChange = (
    companyId: string,
    checked: boolean
  ) => {
    const currentAssignments = watchedCompanyAssignments || [];
    const updatedAssignments = checked
      ? [...currentAssignments, companyId]
      : currentAssignments.filter((id) => id !== companyId);
    setValue("companyAssignments", updatedAssignments);
  };

  const onFormSubmit = (data: UserFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                {...register("firstName")}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("role")}
                onValueChange={(value) => setValue("role", value as "admin" | "se")}
              >
                <SelectTrigger aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="se">Sales Engineer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+1 234 567 8900"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costRate">Cost Rate ($/hr)</Label>
              <Input
                id="costRate"
                type="number"
                step="0.01"
                {...register("costRate")}
                placeholder="75.00"
                aria-invalid={!!errors.costRate}
              />
              {errors.costRate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.costRate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="billRate">Bill Rate ($/hr)</Label>
              <Input
                id="billRate"
                type="number"
                step="0.01"
                {...register("billRate")}
                placeholder="150.00"
                aria-invalid={!!errors.billRate}
              />
              {errors.billRate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.billRate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Assigned Companies</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {companies && companies.length > 0 ? (
                companies.map((company) => (
                  <label
                    key={company.id}
                    className="flex items-center cursor-pointer hover:bg-accent p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={watchedCompanyAssignments?.includes(company.id) || false}
                      onChange={(e) =>
                        handleCompanyAssignmentChange(
                          company.id,
                          e.target.checked
                        )
                      }
                      className="mr-2 cursor-pointer"
                    />
                    <span className="text-sm">{company.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No companies available
                </p>
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : editingUser
              ? "Update User"
              : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}