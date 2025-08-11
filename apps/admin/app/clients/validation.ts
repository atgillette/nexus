import * as z from "zod";

// Department schema
export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Department name is required"),
});

// Client user schema
export const clientUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  billingAccess: z.boolean().default(false),
  adminAccess: z.boolean().default(false),
});

// Solutions engineer assignment schema
export const solutionsEngineerSchema = z.object({
  userId: z.string().min(1, "Please select a solutions engineer"),
  email: z.string().email("Invalid email address"),
});

// Company form validation schema
export const companyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  url: z
    .string()
    .min(1, "Company URL is required")
    .max(255, "URL must be less than 255 characters"),
  departments: z.array(departmentSchema).default([]),
  users: z.array(clientUserSchema).default([]),
  solutionsEngineers: z.array(solutionsEngineerSchema).default([]),
});

// Type inference
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
export type ClientUserFormValues = z.infer<typeof clientUserSchema>;
export type SolutionsEngineerFormValues = z.infer<typeof solutionsEngineerSchema>;
export type CompanyFormValues = z.infer<typeof companyFormSchema>;