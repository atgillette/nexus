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

  // Create new company
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Company name is required"),
        domain: z.string().min(1, "Domain is required"),
        industry: z.string().optional(),
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

      const company = await prisma.company.create({
        data: {
          name: input.name,
          domain: input.domain,
          industry: input.industry,
        },
      });

      return company;
    }),

  // Update company
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