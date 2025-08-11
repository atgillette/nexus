import * as z from "zod";

// Company form validation schema
export const companyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255, "Domain must be less than 255 characters"),
  industry: z
    .string()
    .optional()
    .nullable(),
});

// Type inference
export type CompanyFormValues = z.infer<typeof companyFormSchema>;