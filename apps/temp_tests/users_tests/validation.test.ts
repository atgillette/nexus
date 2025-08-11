import { userFormSchema, userFormSchemaWithRefinements } from "../validation";

describe("User Form Validation", () => {
  describe("userFormSchema", () => {
    it("validates a valid user form", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        phone: "1234567890",
        costRate: "100",
        billRate: "150",
        assignedCompanies: ["company-1", "company-2"],
      };

      const result = userFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("requires first name", () => {
      const invalidData = {
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
      };

      const result = userFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Required");
      }
    });

    it("requires last name", () => {
      const invalidData = {
        firstName: "John",
        email: "john@example.com",
        role: "admin",
      };

      const result = userFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Required");
      }
    });

    it("validates email format", () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        role: "admin",
      };

      const result = userFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("validates phone number length", () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
        phone: "123",
      };

      const result = userFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Phone number must have at least 10 digits");
      }
    });

    it("accepts optional fields", () => {
      const minimalData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "se" as const,
      };

      const result = userFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe("userFormSchemaWithRefinements", () => {
    it("validates that bill rate is not less than cost rate", () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        costRate: "100",
        billRate: "50",
      };

      const result = userFormSchemaWithRefinements.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Bill rate must be equal to or higher than cost rate");
      }
    });

    it("allows equal cost and bill rates", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        costRate: "100",
        billRate: "100",
      };

      const result = userFormSchemaWithRefinements.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("allows bill rate higher than cost rate", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        costRate: "100",
        billRate: "150",
      };

      const result = userFormSchemaWithRefinements.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("handles missing cost and bill rates", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
      };

      const result = userFormSchemaWithRefinements.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("handles only cost rate provided", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        costRate: "100",
      };

      const result = userFormSchemaWithRefinements.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("handles only bill rate provided", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin" as const,
        billRate: "150",
      };

      const result = userFormSchemaWithRefinements.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});