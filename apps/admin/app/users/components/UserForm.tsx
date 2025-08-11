"use client";

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
import type { User, UserFormData, Company } from "../types";

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  formData: UserFormData;
  onFormDataChange: (data: UserFormData) => void;
  companies: Company[] | undefined;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function UserForm({
  isOpen,
  onOpenChange,
  editingUser,
  formData,
  onFormDataChange,
  companies,
  onSubmit,
  isSubmitting,
}: UserFormProps) {
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleCompanyAssignmentChange = (
    companyId: string,
    checked: boolean
  ) => {
    const updatedAssignments = checked
      ? [...formData.companyAssignments, companyId]
      : formData.companyAssignments.filter((id) => id !== companyId);
    onFormDataChange({ ...formData, companyAssignments: updatedAssignments });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="se">Sales Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costRate">Cost Rate ($/hr)</Label>
              <Input
                id="costRate"
                type="number"
                step="0.01"
                value={formData.costRate}
                onChange={(e) => handleInputChange("costRate", e.target.value)}
                placeholder="75.00"
              />
            </div>
            <div>
              <Label htmlFor="billRate">Bill Rate ($/hr)</Label>
              <Input
                id="billRate"
                type="number"
                step="0.01"
                value={formData.billRate}
                onChange={(e) => handleInputChange("billRate", e.target.value)}
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <Label>Assigned Companies</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {companies?.map((company) => (
                <label key={company.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.companyAssignments.includes(company.id)}
                    onChange={(e) =>
                      handleCompanyAssignmentChange(
                        company.id,
                        e.target.checked
                      )
                    }
                    className="mr-2"
                  />
                  {company.name}
                </label>
              ))}
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
          <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
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