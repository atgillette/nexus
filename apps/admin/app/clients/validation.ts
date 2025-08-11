import * as z from "zod";

// Helper for URL validation
const urlSchema = z.string().refine(
  (val) => {
    try {
      const url = new URL(val);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: "Please enter a valid URL" }
);

// Helper for phone validation
const phoneSchema = z.string().optional().refine(
  (val) => {
    if (!val || val === "") return true;
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10;
  },
  { message: "Phone number must have at least 10 digits" }
);

// Department schema
export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Department name is required").trim(),
});

// Client user schema
export const clientUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").trim().refine(
    (val) => {
      const parts = val.split(' ').filter(p => p);
      return parts.length >= 2;
    },
    { message: "Please enter both first and last name" }
  ),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: phoneSchema,
  departmentId: z.string().optional(),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  billingAccess: z.boolean().default(false),
  adminAccess: z.boolean().default(false),
});

// Solutions engineer assignment schema
export const solutionsEngineerSchema = z.object({
  userId: z.string().min(1, "Please select a solutions engineer"),
  email: z.string().optional(), // Email is auto-populated, not validated
});

// Company form validation schema with refinements
export const companyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .trim(),
  url: urlSchema,
  departments: z.array(departmentSchema).default([]),
  users: z.array(clientUserSchema).default([]),
  solutionsEngineers: z.array(solutionsEngineerSchema).default([]),
}).refine(
  (data) => {
    // Check for duplicate department names
    const deptNames = data.departments.map(d => d.name.toLowerCase());
    const uniqueDeptNames = new Set(deptNames);
    return deptNames.length === uniqueDeptNames.size;
  },
  {
    message: "Department names must be unique",
    path: ["departments"],
  }
).refine(
  (data) => {
    // Check for duplicate user emails
    const emails = data.users.map(u => u.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    return emails.length === uniqueEmails.size;
  },
  {
    message: "User email addresses must be unique",
    path: ["users"],
  }
).refine(
  (data) => {
    // Check for duplicate SE assignments
    const seIds = data.solutionsEngineers.map(se => se.userId);
    const uniqueSeIds = new Set(seIds);
    return seIds.length === uniqueSeIds.size;
  },
  {
    message: "Each Solutions Engineer can only be assigned once",
    path: ["solutionsEngineers"],
  }
);

// Type inference
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
export type ClientUserFormValues = z.infer<typeof clientUserSchema>;
export type SolutionsEngineerFormValues = z.infer<typeof solutionsEngineerSchema>;
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

// Export for form default values
export const defaultFormValues: CompanyFormValues = {
  name: "",
  url: "https://",
  departments: [],
  users: [],
  solutionsEngineers: [],
};