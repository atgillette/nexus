import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const workflowsRouter = createTRPCRouter({
  // Create a new workflow
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Workflow name is required"),
        description: z.string().min(1, "Description is required"),
        companyId: z.string().min(1, "Company ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user data from database to check role
      const userData = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true }
      });

      if (!userData) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      // Verify user has access to this company (admin or assigned SE)
      if (userData.role !== "admin") {
        // Check if user is assigned as SE to this company
        const assignment = await ctx.db.companySEAssignment.findFirst({
          where: {
            userId: userData.id,
            companyId: input.companyId,
          },
        });

        if (!assignment) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to create workflows for this company",
          });
        }
      }

      // Verify company exists
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      // Create the workflow
      const workflow = await ctx.db.workflow.create({
        data: {
          name: input.name,
          description: input.description,
          companyId: input.companyId,
          config: {}, // Empty config for now
        },
      });

      return workflow;
    }),

  // Get workflows by company ID
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get user data from database to check role
      const userData = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true }
      });

      if (!userData) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      // Verify user has access to this company (admin or assigned SE)
      if (userData.role !== "admin") {
        // Check if user is assigned as SE to this company
        const assignment = await ctx.db.companySEAssignment.findFirst({
          where: {
            userId: userData.id,
            companyId: input.companyId,
          },
        });

        if (!assignment) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view workflows for this company",
          });
        }
      }

      // Get workflows with execution statistics
      const workflows = await ctx.db.workflow.findMany({
        where: {
          companyId: input.companyId,
          isActive: true,
        },
        include: {
          executions: {
            select: {
              id: true,
              status: true,
              timeSaved: true,
              costSavings: true,
              itemsProcessed: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate statistics for each workflow
      return workflows.map((workflow) => {
        const executions = workflow.executions;
        const totalExecutions = executions.length;
        const exceptions = executions.filter((e) => e.status === "failed").length;
        const totalTimeSaved = executions.reduce((sum, e) => sum + (e.timeSaved || 0), 0);
        const totalMoneySaved = executions.reduce((sum, e) => sum + (e.costSavings || 0), 0);

        return {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          createdAt: workflow.createdAt,
          executions: totalExecutions,
          exceptions,
          timeSaved: totalTimeSaved,
          moneySaved: totalMoneySaved,
          // Mock some additional fields that might be needed
          nodes: Math.floor(Math.random() * 15) + 5, // Random between 5-20
          status: "active" as const,
        };
      });
    }),
});