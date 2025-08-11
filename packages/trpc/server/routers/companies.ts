import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db as prisma } from "@nexus/database";
import { TRPCError } from "@trpc/server";

export const companiesRouter = createTRPCRouter({
  // List all companies with optional search
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin or SE
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || (user.role !== "admin" && user.role !== "se")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and SE users can view companies",
        });
      }

      const where = input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" as const } },
              { domain: { contains: input.search, mode: "insensitive" as const } },
              { industry: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const companies = await prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          workflows: {
            select: {
              id: true,
              _count: true,
            },
          },
          users: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              workflows: true,
              users: true,
            },
          },
        },
      });

      // Transform data to include computed fields for the dashboard table
      return companies.map((company) => ({
        id: company.id,
        name: company.name,
        domain: company.domain,
        industry: company.industry,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        workflowCount: company._count.workflows,
        userCount: company._count.users,
      }));
    }),

  // Get single company by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin or SE
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || (user.role !== "admin" && user.role !== "se")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin and SE users can view companies",
        });
      }

      const company = await prisma.company.findUnique({
        where: { id: input.id },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      return company;
    }),

  // Get company with full details for editing
  getByIdWithDetails: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can view company details",
        });
      }

      const company = await prisma.company.findUnique({
        where: { id: input.id },
        include: {
          departments: true,
          users: {
            where: { role: "client" },
            include: {
              department: true,
            },
          },
          seAssignments: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Transform to match the expected format
      return {
        id: company.id,
        name: company.name,
        url: `https://${company.domain}`,
        departments: company.departments.map(dept => ({
          id: dept.id,
          name: dept.name,
        })),
        users: company.users.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || "",
          departmentId: user.departmentId || "",
          emailNotifications: user.emailNotifications,
          smsNotifications: user.smsNotifications,
          billingAccess: user.billingAccess,
          adminAccess: user.adminAccess,
        })),
        solutionsEngineers: company.seAssignments.map(assignment => ({
          userId: assignment.userId,
          email: assignment.user.email,
        })),
      };
    }),

  // Create new company with comprehensive data
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Company name is required"),
        domain: z.string().min(1, "Domain is required"),
        industry: z.string().optional(),
        departments: z.array(z.object({
          name: z.string().min(1, "Department name is required"),
        })).optional(),
        users: z.array(z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Invalid email address"),
          phone: z.string().optional(),
          departmentName: z.string().optional(),
          emailNotifications: z.boolean().default(false),
          smsNotifications: z.boolean().default(false),
          billingAccess: z.boolean().default(false),
          adminAccess: z.boolean().default(false),
        })).optional(),
        solutionsEngineers: z.array(z.object({
          userId: z.string().min(1, "SE user ID is required"),
          isPrimary: z.boolean().default(false),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can create companies",
        });
      }

      // Check if domain already exists
      const existingCompany = await prisma.company.findUnique({
        where: { domain: input.domain },
      });

      if (existingCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A company with this domain already exists",
        });
      }

      // Check for duplicate emails among new users
      if (input.users && input.users.length > 0) {
        const emails = input.users.map(u => u.email);
        const uniqueEmails = new Set(emails);
        if (emails.length !== uniqueEmails.size) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Duplicate email addresses found in user list",
          });
        }

        // Check if any emails already exist in the database
        const existingUsers = await prisma.user.findMany({
          where: {
            email: { in: emails },
          },
          select: { email: true },
        });

        if (existingUsers.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Email(s) already exist: ${existingUsers.map(u => u.email).join(", ")}`,
          });
        }
      }

      // Validate SE users exist and have correct role
      if (input.solutionsEngineers && input.solutionsEngineers.length > 0) {
        const seUserIds = input.solutionsEngineers.map(se => se.userId);
        const seUsers = await prisma.user.findMany({
          where: {
            id: { in: seUserIds },
            role: "se",
          },
          select: { id: true },
        });

        if (seUsers.length !== seUserIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more selected users are not valid Solutions Engineers",
          });
        }
      }

      // Use transaction to ensure all-or-nothing creation
      const result = await prisma.$transaction(async (tx) => {
        // Create the company
        const company = await tx.company.create({
          data: {
            name: input.name,
            domain: input.domain,
            industry: input.industry,
          },
        });

        // Create departments
        const departmentMap = new Map<string, string>();
        if (input.departments && input.departments.length > 0) {
          const departments = await Promise.all(
            input.departments.map(dept =>
              tx.department.create({
                data: {
                  name: dept.name,
                  companyId: company.id,
                },
              })
            )
          );
          departments.forEach(dept => {
            departmentMap.set(dept.name, dept.id);
          });
        }

        // Create client users
        if (input.users && input.users.length > 0) {
          await Promise.all(
            input.users.map(user =>
              tx.user.create({
                data: {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                  role: "client",
                  companyId: company.id,
                  departmentId: user.departmentName ? departmentMap.get(user.departmentName) : null,
                  emailNotifications: user.emailNotifications,
                  smsNotifications: user.smsNotifications,
                  billingAccess: user.billingAccess,
                  adminAccess: user.adminAccess,
                  isActive: false, // Start as inactive until invited
                },
              })
            )
          );
        }

        // Create SE assignments
        if (input.solutionsEngineers && input.solutionsEngineers.length > 0) {
          await Promise.all(
            input.solutionsEngineers.map(se =>
              tx.companySEAssignment.create({
                data: {
                  companyId: company.id,
                  userId: se.userId,
                  isPrimary: se.isPrimary,
                },
              })
            )
          );
        }

        return company;
      });

      return result;
    }),

  // Update company (basic info only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Company name is required"),
        domain: z.string().min(1, "Domain is required"),
        industry: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can update companies",
        });
      }

      // Check if company exists
      const existingCompany = await prisma.company.findUnique({
        where: { id: input.id },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Check if domain is being changed and if new domain is unique
      if (input.domain !== existingCompany.domain) {
        const domainExists = await prisma.company.findUnique({
          where: { domain: input.domain },
        });

        if (domainExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A company with this domain already exists",
          });
        }
      }

      const company = await prisma.company.update({
        where: { id: input.id },
        data: {
          name: input.name,
          domain: input.domain,
          industry: input.industry,
          isActive: input.isActive,
        },
      });

      return company;
    }),

  // Update company with full details (departments, users, SE assignments)
  updateWithDetails: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Company name is required"),
        domain: z.string().min(1, "Domain is required"),
        departments: z.array(z.object({
          id: z.string().optional(), // Existing departments have IDs
          name: z.string().min(1, "Department name is required"),
        })).optional(),
        users: z.array(z.object({
          id: z.string().optional(), // Existing users have IDs
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Invalid email address"),
          phone: z.string().optional(),
          departmentName: z.string().optional(),
          emailNotifications: z.boolean().default(false),
          smsNotifications: z.boolean().default(false),
          billingAccess: z.boolean().default(false),
          adminAccess: z.boolean().default(false),
        })).optional(),
        solutionsEngineers: z.array(z.object({
          userId: z.string().min(1, "SE user ID is required"),
          isPrimary: z.boolean().default(false),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can update companies",
        });
      }

      // Check if company exists
      const existingCompany = await prisma.company.findUnique({
        where: { id: input.id },
        include: {
          departments: true,
          users: { where: { role: "client" } },
          seAssignments: true,
        },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Check if domain is being changed and if new domain is unique
      if (input.domain !== existingCompany.domain) {
        const domainExists = await prisma.company.findUnique({
          where: { domain: input.domain },
        });

        if (domainExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A company with this domain already exists",
          });
        }
      }

      // Check for duplicate emails among users
      if (input.users && input.users.length > 0) {
        const newEmails = input.users.filter(u => !u.id).map(u => u.email);
        const updatedEmails = input.users.filter(u => u.id).map(u => ({ id: u.id, email: u.email }));
        
        // Check for duplicates within the submission
        const allEmails = input.users.map(u => u.email);
        const uniqueEmails = new Set(allEmails);
        if (allEmails.length !== uniqueEmails.size) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Duplicate email addresses found in user list",
          });
        }

        // Check if new emails already exist in database
        if (newEmails.length > 0) {
          const existingUsers = await prisma.user.findMany({
            where: {
              email: { in: newEmails },
            },
            select: { email: true },
          });

          if (existingUsers.length > 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `Email(s) already exist: ${existingUsers.map(u => u.email).join(", ")}`,
            });
          }
        }

        // Check if updated emails conflict with other users
        for (const updatedUser of updatedEmails) {
          const existingUser = existingCompany.users.find(u => u.id === updatedUser.id);
          if (existingUser && existingUser.email !== updatedUser.email) {
            const emailExists = await prisma.user.findFirst({
              where: {
                email: updatedUser.email,
                NOT: { id: updatedUser.id },
              },
            });

            if (emailExists) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `Email already exists: ${updatedUser.email}`,
              });
            }
          }
        }
      }

      // Validate SE users exist and have correct role
      if (input.solutionsEngineers && input.solutionsEngineers.length > 0) {
        const seUserIds = input.solutionsEngineers.map(se => se.userId);
        const seUsers = await prisma.user.findMany({
          where: {
            id: { in: seUserIds },
            role: "se",
          },
          select: { id: true },
        });

        if (seUsers.length !== seUserIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more selected users are not valid Solutions Engineers",
          });
        }
      }

      // Use transaction to ensure all-or-nothing update
      const result = await prisma.$transaction(async (tx) => {
        // Update the company
        const company = await tx.company.update({
          where: { id: input.id },
          data: {
            name: input.name,
            domain: input.domain,
          },
        });

        // Handle departments
        if (input.departments !== undefined) {
          const departmentMap = new Map<string, string>();
          
          // Track which departments to keep
          const departmentsToKeep = input.departments
            .filter(d => d.id && d.id.startsWith('cl'))
            .map(d => d.id!);

          // Delete departments not in the list
          await tx.department.deleteMany({
            where: {
              companyId: company.id,
              NOT: {
                id: { in: departmentsToKeep },
              },
            },
          });

          // Update existing and create new departments
          for (const dept of input.departments) {
            if (dept.id && dept.id.startsWith('cl')) {
              // Update existing department
              const updated = await tx.department.update({
                where: { id: dept.id },
                data: { name: dept.name },
              });
              departmentMap.set(dept.name, updated.id);
            } else {
              // Create new department
              const created = await tx.department.create({
                data: {
                  name: dept.name,
                  companyId: company.id,
                },
              });
              departmentMap.set(dept.name, created.id);
            }
          }

          // Handle users
          if (input.users !== undefined) {
            // Track which users to keep
            const usersToKeep = input.users
              .filter(u => u.id && u.id.startsWith('cl'))
              .map(u => u.id!);

            // Delete client users not in the list
            await tx.user.deleteMany({
              where: {
                companyId: company.id,
                role: "client",
                NOT: {
                  id: { in: usersToKeep },
                },
              },
            });

            // Update existing and create new users
            for (const user of input.users) {
              const userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                departmentId: user.departmentName ? departmentMap.get(user.departmentName) : null,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                billingAccess: user.billingAccess,
                adminAccess: user.adminAccess,
              };

              if (user.id && user.id.startsWith('cl')) {
                // Update existing user
                await tx.user.update({
                  where: { id: user.id },
                  data: userData,
                });
              } else {
                // Create new user
                await tx.user.create({
                  data: {
                    ...userData,
                    role: "client",
                    companyId: company.id,
                    isActive: false, // Start as inactive until invited
                  },
                });
              }
            }
          }
        }

        // Handle SE assignments
        if (input.solutionsEngineers !== undefined) {
          // Delete all existing SE assignments
          await tx.companySEAssignment.deleteMany({
            where: { companyId: company.id },
          });

          // Create new SE assignments
          if (input.solutionsEngineers.length > 0) {
            await Promise.all(
              input.solutionsEngineers.map(se =>
                tx.companySEAssignment.create({
                  data: {
                    companyId: company.id,
                    userId: se.userId,
                    isPrimary: se.isPrimary,
                  },
                })
              )
            );
          }
        }

        return company;
      });

      return result;
    }),

  // Department management mutations
  addDepartment: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        name: z.string().min(1, "Department name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage departments",
        });
      }

      // Check if department name already exists for this company
      const existing = await prisma.department.findFirst({
        where: {
          companyId: input.companyId,
          name: input.name,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Department with this name already exists",
        });
      }

      return await prisma.department.create({
        data: {
          companyId: input.companyId,
          name: input.name,
        },
      });
    }),

  updateDepartment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Department name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage departments",
        });
      }

      return await prisma.department.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  removeDepartment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage departments",
        });
      }

      // Check if department has users
      const usersInDept = await prisma.user.count({
        where: { departmentId: input.id },
      });

      if (usersInDept > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete department with assigned users",
        });
      }

      return await prisma.department.delete({
        where: { id: input.id },
      });
    }),

  // Client user management mutations
  addUser: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        departmentId: z.string().optional(),
        emailNotifications: z.boolean().default(false),
        smsNotifications: z.boolean().default(false),
        billingAccess: z.boolean().default(false),
        adminAccess: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage client users",
        });
      }

      // Check if email already exists
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      return await prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          role: "client",
          companyId: input.companyId,
          departmentId: input.departmentId,
          emailNotifications: input.emailNotifications,
          smsNotifications: input.smsNotifications,
          billingAccess: input.billingAccess,
          adminAccess: input.adminAccess,
          isActive: false, // Start as inactive until invited
        },
      });
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional().nullable(),
        departmentId: z.string().optional().nullable(),
        emailNotifications: z.boolean(),
        smsNotifications: z.boolean(),
        billingAccess: z.boolean(),
        adminAccess: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage client users",
        });
      }

      // Check if email is being changed and if new email is unique
      const existingUser = await prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (input.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (emailExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }
      }

      return await prisma.user.update({
        where: { id: input.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          departmentId: input.departmentId,
          emailNotifications: input.emailNotifications,
          smsNotifications: input.smsNotifications,
          billingAccess: input.billingAccess,
          adminAccess: input.adminAccess,
        },
      });
    }),

  removeUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage client users",
        });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: input.id },
      });

      if (!targetUser || targetUser.role !== "client") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only remove client users",
        });
      }

      return await prisma.user.delete({
        where: { id: input.id },
      });
    }),

  // SE assignment management mutations
  assignSE: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
        isPrimary: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage SE assignments",
        });
      }

      // Check if SE user exists and has correct role
      const seUser = await prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!seUser || seUser.role !== "se") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not a Solutions Engineer",
        });
      }

      // Check if already assigned
      const existing = await prisma.companySEAssignment.findUnique({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId: input.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "SE is already assigned to this company",
        });
      }

      return await prisma.companySEAssignment.create({
        data: {
          companyId: input.companyId,
          userId: input.userId,
          isPrimary: input.isPrimary,
        },
      });
    }),

  unassignSE: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage SE assignments",
        });
      }

      return await prisma.companySEAssignment.delete({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId: input.userId,
          },
        },
      });
    }),

  updateSEAssignment: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
        isPrimary: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin users can manage SE assignments",
        });
      }

      return await prisma.companySEAssignment.update({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId: input.userId,
          },
        },
        data: {
          isPrimary: input.isPrimary,
        },
      });
    }),

  // Get dashboard metrics for companies
  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin or SE
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user || (user.role !== "admin" && user.role !== "se")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admin and SE users can view metrics",
      });
    }

    const companies = await prisma.company.findMany({
      include: {
        workflows: {
          include: {
            executions: {
              select: {
                status: true,
                timeSaved: true,
                costSavings: true,
                itemsProcessed: true,
              },
            },
          },
        },
      },
    });

    // Transform to include dashboard metrics
    return companies.map((company) => {
      const workflows = company.workflows;
      const allExecutions = workflows.flatMap((w) => w.executions);
      const totalExecutions = allExecutions.length;
      const exceptions = allExecutions.filter((e) => e.status === "failed").length;
      const timeSaved = allExecutions.reduce((sum, e) => sum + e.timeSaved, 0);
      const costSavings = allExecutions.reduce((sum, e) => sum + e.costSavings, 0);
      const nodes = workflows.reduce((sum, w) => {
        // Mock node count - in real app this would come from workflow config
        return sum + Math.floor(Math.random() * 10 + 5);
      }, 0);

      // Mock revenue calculation - in real app this would come from billing
      const revenue = Math.floor(workflows.length * 2500 + totalExecutions * 10);

      return {
        id: company.id,
        name: company.name,
        domain: company.domain,
        industry: company.industry,
        isActive: company.isActive,
        createdAt: company.createdAt,
        workflows: workflows.length,
        nodes,
        executions: totalExecutions,
        exceptions,
        revenue,
        timeSaved: Math.floor(timeSaved / 60), // Convert to hours
        moneySaved: costSavings,
      };
    });
  }),
});