import * as z from "zod";

// User form validation schema
export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  role: z.enum(["admin", "se"], {
    required_error: "Please select a role",
    invalid_type_error: "Invalid role",
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)\.]+$/.test(val),
      "Invalid phone number format"
    )
    .refine(
      (val) => !val || val.replace(/\D/g, "").length >= 10,
      "Phone number must have at least 10 digits"
    ),
  costRate: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Cost rate must be a positive number"
    )
    .refine(
      (val) => !val || parseFloat(val) <= 9999.99,
      "Cost rate must be less than $10,000/hr"
    ),
  billRate: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Bill rate must be a positive number"
    )
    .refine(
      (val) => !val || parseFloat(val) <= 9999.99,
      "Bill rate must be less than $10,000/hr"
    ),
  companyAssignments: z.array(z.string()).default([]),
});

// Refined schema with business logic validation
export const userFormSchemaWithRefinements = userFormSchema.refine(
  (data) => {
    // If both rates are provided, bill rate should be higher than cost rate
    if (data.costRate && data.billRate) {
      const cost = parseFloat(data.costRate);
      const bill = parseFloat(data.billRate);
      return bill >= cost;
    }
    return true;
  },
  {
    message: "Bill rate must be equal to or higher than cost rate",
    path: ["billRate"],
  }
);

// Type inference
export type UserFormValues = z.infer<typeof userFormSchema>;