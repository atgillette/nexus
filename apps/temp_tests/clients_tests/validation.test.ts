import {
  departmentSchema,
  clientUserSchema,
  solutionsEngineerSchema,
  companyFormSchema,
} from "../validation";

describe("Client Form Validation Schemas", () => {
  describe("departmentSchema", () => {
    it("should validate a valid department", () => {
      const validDepartment = {
        id: "dept-1",
        name: "Engineering",
      };
      
      const result = departmentSchema.safeParse(validDepartment);
      expect(result.success).toBe(true);
    });

    it("should require department name", () => {
      const invalidDepartment = {
        name: "",
      };
      
      const result = departmentSchema.safeParse(invalidDepartment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Department name is required");
      }
    });

    it("should trim department name", () => {
      const department = {
        name: "  Engineering  ",
      };
      
      const result = departmentSchema.safeParse(department);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Engineering");
      }
    });

    it("should allow optional id", () => {
      const department = {
        name: "Engineering",
      };
      
      const result = departmentSchema.safeParse(department);
      expect(result.success).toBe(true);
    });
  });

  describe("clientUserSchema", () => {
    it("should validate a valid user", () => {
      const validUser = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
        departmentId: "dept-1",
        emailNotifications: true,
        smsNotifications: false,
        billingAccess: true,
        adminAccess: false,
      };
      
      const result = clientUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should require user name", () => {
      const invalidUser = {
        name: "",
        email: "john@example.com",
      };
      
      const result = clientUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name is required");
      }
    });

    it("should require both first and last name", () => {
      const invalidUser = {
        name: "John",
        email: "john@example.com",
      };
      
      const result = clientUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter both first and last name");
      }
    });

    it("should validate email format", () => {
      const invalidUser = {
        name: "John Doe",
        email: "invalid-email",
      };
      
      const result = clientUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should lowercase and trim email", () => {
      const user = {
        name: "John Doe",
        email: "  JOHN@EXAMPLE.COM  ",
      };
      
      const result = clientUserSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should validate phone number with at least 10 digits", () => {
      const invalidUser = {
        name: "John Doe",
        email: "john@example.com",
        phone: "123",
      };
      
      const result = clientUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Phone number must have at least 10 digits");
      }
    });

    it("should accept valid phone formats", () => {
      const phoneFormats = [
        "555-123-4567",
        "(555) 123-4567",
        "555 123 4567",
        "+1 555 123 4567",
        "5551234567",
      ];
      
      phoneFormats.forEach(phone => {
        const user = {
          name: "John Doe",
          email: "john@example.com",
          phone,
        };
        
        const result = clientUserSchema.safeParse(user);
        expect(result.success).toBe(true);
      });
    });

    it("should allow optional phone", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
      };
      
      const result = clientUserSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it("should set default values for boolean fields", () => {
      const user = {
        name: "John Doe",
        email: "john@example.com",
      };
      
      const result = clientUserSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emailNotifications).toBe(false);
        expect(result.data.smsNotifications).toBe(false);
        expect(result.data.billingAccess).toBe(false);
        expect(result.data.adminAccess).toBe(false);
      }
    });
  });

  describe("solutionsEngineerSchema", () => {
    it("should validate a valid SE assignment", () => {
      const validSE = {
        userId: "se-1",
        email: "se@example.com",
      };
      
      const result = solutionsEngineerSchema.safeParse(validSE);
      expect(result.success).toBe(true);
    });

    it("should require userId", () => {
      const invalidSE = {
        userId: "",
        email: "se@example.com",
      };
      
      const result = solutionsEngineerSchema.safeParse(invalidSE);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please select a solutions engineer");
      }
    });

    it("should allow optional email", () => {
      const se = {
        userId: "se-1",
      };
      
      const result = solutionsEngineerSchema.safeParse(se);
      expect(result.success).toBe(true);
    });
  });

  describe("companyFormSchema", () => {
    it("should validate a complete valid form", () => {
      const validForm = {
        name: "Test Company",
        url: "https://testcompany.com",
        departments: [
          { name: "Engineering" },
          { name: "Sales" },
        ],
        users: [
          {
            name: "John Doe",
            email: "john@example.com",
            emailNotifications: false,
            smsNotifications: false,
            billingAccess: false,
            adminAccess: false,
          },
        ],
        solutionsEngineers: [
          { userId: "se-1", email: "se@example.com" },
        ],
      };
      
      const result = companyFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should validate minimal valid form", () => {
      const minimalForm = {
        name: "Test Company",
        url: "https://testcompany.com",
      };
      
      const result = companyFormSchema.safeParse(minimalForm);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.departments).toEqual([]);
        expect(result.data.users).toEqual([]);
        expect(result.data.solutionsEngineers).toEqual([]);
      }
    });

    it("should require company name", () => {
      const invalidForm = {
        name: "",
        url: "https://testcompany.com",
      };
      
      const result = companyFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Company name is required");
      }
    });

    it("should validate company name length", () => {
      const invalidForm = {
        name: "A".repeat(101),
        url: "https://testcompany.com",
      };
      
      const result = companyFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Company name must be less than 100 characters");
      }
    });

    it("should validate URL format", () => {
      const invalidUrls = [
        "not-a-url",
        "ftp://invalid.com",
        "javascript:alert(1)",
        "//missing-protocol.com",
      ];
      
      invalidUrls.forEach(url => {
        const form = {
          name: "Test Company",
          url,
        };
        
        const result = companyFormSchema.safeParse(form);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Please enter a valid URL");
        }
      });
    });

    it("should accept valid URLs", () => {
      const validUrls = [
        "https://example.com",
        "http://example.com",
        "https://sub.example.com",
        "https://example.com/path",
        "https://example.com:8080",
      ];
      
      validUrls.forEach(url => {
        const form = {
          name: "Test Company",
          url,
        };
        
        const result = companyFormSchema.safeParse(form);
        expect(result.success).toBe(true);
      });
    });

    it("should detect duplicate department names", () => {
      const form = {
        name: "Test Company",
        url: "https://testcompany.com",
        departments: [
          { name: "Engineering" },
          { name: "engineering" }, // Case insensitive duplicate
        ],
      };
      
      const result = companyFormSchema.safeParse(form);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Department names must be unique");
      }
    });

    it("should detect duplicate user emails", () => {
      const form = {
        name: "Test Company",
        url: "https://testcompany.com",
        users: [
          {
            name: "John Doe",
            email: "john@example.com",
            emailNotifications: false,
            smsNotifications: false,
            billingAccess: false,
            adminAccess: false,
          },
          {
            name: "Jane Doe",
            email: "JOHN@EXAMPLE.COM", // Case insensitive duplicate
            emailNotifications: false,
            smsNotifications: false,
            billingAccess: false,
            adminAccess: false,
          },
        ],
      };
      
      const result = companyFormSchema.safeParse(form);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("User email addresses must be unique");
      }
    });

    it("should detect duplicate SE assignments", () => {
      const form = {
        name: "Test Company",
        url: "https://testcompany.com",
        solutionsEngineers: [
          { userId: "se-1", email: "se1@example.com" },
          { userId: "se-1", email: "se1@example.com" }, // Duplicate
        ],
      };
      
      const result = companyFormSchema.safeParse(form);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Each Solutions Engineer can only be assigned once");
      }
    });

    it("should allow unique departments, users, and SEs", () => {
      const form = {
        name: "Test Company",
        url: "https://testcompany.com",
        departments: [
          { name: "Engineering" },
          { name: "Sales" },
          { name: "Marketing" },
        ],
        users: [
          {
            name: "John Doe",
            email: "john@example.com",
            emailNotifications: false,
            smsNotifications: false,
            billingAccess: false,
            adminAccess: false,
          },
          {
            name: "Jane Smith",
            email: "jane@example.com",
            emailNotifications: false,
            smsNotifications: false,
            billingAccess: false,
            adminAccess: false,
          },
        ],
        solutionsEngineers: [
          { userId: "se-1", email: "se1@example.com" },
          { userId: "se-2", email: "se2@example.com" },
        ],
      };
      
      const result = companyFormSchema.safeParse(form);
      expect(result.success).toBe(true);
    });
  });
});