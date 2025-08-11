import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  adminProcedure,
} from "../trpc";

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'se']),
  phone: z.string().optional(),
  costRate: z.number().positive().optional(),
  billRate: z.number().positive().optional(),
  companyAssignments: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['admin', 'se']).optional(),
  phone: z.string().optional(),
  costRate: z.number().positive().optional(),
  billRate: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  companyAssignments: z.array(z.string()).optional(),
});

export const usersRouter = createTRPCRouter({
  // Get users filtered by role (admin or se only)
  getUsers: adminProcedure
    .input(z.object({
      role: z.enum(['admin', 'se']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const users = await ctx.db.user.findMany({
          where: {
            role: input.role || { in: ['admin', 'se'] },
            isActive: true,
          },
          include: {
            companyAssignments: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          costRate: user.costRate,
          billRate: user.billRate,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
          assignedClients: user.companyAssignments.map(assignment => assignment.company.name),
          companyAssignments: user.companyAssignments.map(assignment => ({
            companyId: assignment.companyId,
            companyName: assignment.company.name,
          })),
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        });
      }
    }),

  // Create a new user
  createUser: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { companyAssignments, ...userData } = input;

        // Check if user already exists
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A user with this email already exists',
          });
        }

        // Create the user
        const user = await ctx.db.user.create({
          data: userData,
        });

        // Create company assignments if provided
        if (companyAssignments && companyAssignments.length > 0) {
          await ctx.db.userCompanyAssignment.createMany({
            data: companyAssignments.map(companyId => ({
              userId: user.id,
              companyId,
            })),
          });
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      } catch (error) {
        console.error('Error creating user:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),

  // Update a user
  updateUser: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, companyAssignments, ...updateData } = input;

        // Check if user exists
        const existingUser = await ctx.db.user.findUnique({
          where: { id },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Check for email conflicts if email is being updated
        if (updateData.email && updateData.email !== existingUser.email) {
          const emailConflict = await ctx.db.user.findUnique({
            where: { email: updateData.email },
          });

          if (emailConflict) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'A user with this email already exists',
            });
          }
        }

        // Update the user
        const user = await ctx.db.user.update({
          where: { id },
          data: updateData,
        });

        // Update company assignments if provided
        if (companyAssignments !== undefined) {
          // Delete existing assignments
          await ctx.db.userCompanyAssignment.deleteMany({
            where: { userId: id },
          });

          // Create new assignments
          if (companyAssignments.length > 0) {
            await ctx.db.userCompanyAssignment.createMany({
              data: companyAssignments.map(companyId => ({
                userId: id,
                companyId,
              })),
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
      } catch (error) {
        console.error('Error updating user:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        });
      }
    }),

  // Delete a user (soft delete by setting isActive to false)
  deleteUser: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: input.id },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Soft delete by setting isActive to false
        await ctx.db.user.update({
          where: { id: input.id },
          data: { isActive: false },
        });

        return { success: true };
      } catch (error) {
        console.error('Error deleting user:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        });
      }
    }),

  // Get companies for dropdown in user form
  getCompanies: adminProcedure.query(async ({ ctx }) => {
    try {
      const companies = await ctx.db.company.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      });

      return companies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch companies',
      });
    }
  }),
});